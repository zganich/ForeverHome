import { withAiOperation, qualityDigest } from "./aiAdmission";
import { assertOwnedImageUrl, ownedImageDataUrl } from "./storage";
import {
  billingAvailability,
  requireBillingAvailable,
} from "./billingAvailability";
import { analysisInput, runAnalysis } from "./analysis";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createCheckoutSession,
  createSubscriptionCheckout,
  CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  type CreditPackId,
  type SubscriptionPlanId,
} from "./stripe";
import {
  getUserCredits,
  activateBetaTester,
  isBetaTester,
  validateBetaCode,
  hasUnlimitedCredits,
} from "./credits";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    syncUser: protectedProcedure.mutation(({ ctx }) => ({
      success: true,
      user: ctx.user,
    })),
    logout: publicProcedure.mutation(() => ({ success: true })),
  }),

  // Reminders
  reminders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserReminders } = await import("./reminders");
      return getUserReminders(ctx.user.id);
    }),
    upcoming: protectedProcedure.query(async ({ ctx }) => {
      const { getUpcomingReminders } = await import("./reminders");
      return getUpcomingReminders(ctx.user.id);
    }),
    forPet: protectedProcedure
      .input(z.object({ petId: z.string().max(64) }))
      .query(async ({ ctx, input }) => {
        const { getPet } = await import("./db");
        const pet = await getPet(input.petId);
        if (!pet || pet.userId !== ctx.user.id)
          throw new Error("Access denied");
        const { getPetReminders } = await import("./reminders");
        return getPetReminders(input.petId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          petId: z.string().max(64),
          title: z.string().min(1).max(255),
          description: z.string().max(5000).optional(),
          type: z.enum(["medication", "vet", "grooming", "training", "custom"]),
          dueDate: z.date(),
          isRecurring: z
            .enum(["none", "daily", "weekly", "monthly", "yearly"])
            .default("none"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getPet } = await import("./db");
        const pet = await getPet(input.petId);
        if (!pet || pet.userId !== ctx.user.id)
          throw new Error("Access denied");
        const { createReminder } = await import("./reminders");
        return createReminder({
          userId: ctx.user.id,
          petId: input.petId,
          title: input.title,
          description: input.description || null,
          type: input.type,
          dueDate: input.dueDate,
          isRecurring: input.isRecurring,
          isCompleted: "no",
          notificationSent: "no",
        });
      }),
    complete: protectedProcedure
      .input(z.object({ reminderId: z.string().max(64) }))
      .mutation(async ({ ctx, input }) => {
        const { completeReminder } = await import("./reminders");
        return completeReminder(input.reminderId, ctx.user.id);
      }),
    delete: protectedProcedure
      .input(z.object({ reminderId: z.string().max(64) }))
      .mutation(async ({ ctx, input }) => {
        const { deleteReminder } = await import("./reminders");
        return deleteReminder(input.reminderId, ctx.user.id);
      }),
  }),

  // Pet management
  pets: router({
    identifyBreed: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().max(2048),
          species: z.enum(["dog", "cat", "other"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        assertOwnedImageUrl(ctx.user.id, input.imageUrl);
        const { identifyBreed } = await import("./breedIdentification");
        return withAiOperation(ctx.user.id, "breed", async () =>
          identifyBreed(
            await ownedImageDataUrl(ctx.user.id, input.imageUrl),
            input.species
          )
        );
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPets } = await import("./db");
      return getUserPets(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          species: z.enum(["dog", "cat", "other"]),
          breed: z.string().max(100).optional(),
          age: z.string().max(50).optional(),
          photoUrl: z.string().max(500).optional(),
          personality: z
            .enum([
              "goofy",
              "wise",
              "sassy",
              "serious",
              "excited",
              "sleepy",
              "dramatic",
            ])
            .optional(),
          voiceStyle: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createPet } = await import("./db");
        return createPet(ctx.user.id, input);
      }),
  }),

  // Behavior analysis
  analysis: router({
    validatePhoto: protectedProcedure
      .input(z.object({ imageUrl: z.string().max(2048) }))
      .mutation(async ({ ctx, input }) => {
        assertOwnedImageUrl(ctx.user.id, input.imageUrl);
        const { validatePhotoQuality, photoQualitySchema, getPhotoTips } =
          await import("./photoQuality");
        const imageData = await ownedImageDataUrl(ctx.user.id, input.imageUrl);
        const result = photoQualitySchema.parse(
          await withAiOperation(
            ctx.user.id,
            "quality",
            () => validatePhotoQuality(imageData),
            qualityDigest(imageData)
          )
        );
        const tips = getPhotoTips(result.issues);
        return { ...result, tips };
      }),
    create: protectedProcedure
      .input(analysisInput)
      .mutation(({ ctx, input }) => runAnalysis(ctx.user.id, input)),
    listForPet: protectedProcedure
      .input(z.object({ petId: z.string().max(64) }))
      .query(async ({ ctx, input }) => {
        const { getPet, getPetAnalyses } = await import("./db");

        // Verify pet belongs to user
        const pet = await getPet(input.petId);
        if (!pet) {
          throw new Error(
            "Pet not found. Please check that the pet exists and try again."
          );
        }
        if (pet.userId !== ctx.user.id) {
          throw new Error(
            "You don't have permission to access this pet. Please contact support if you believe this is an error."
          );
        }

        return getPetAnalyses(input.petId);
      }),
    get: protectedProcedure
      .input(z.object({ analysisId: z.string().max(64) }))
      .query(async ({ ctx, input }) => {
        const { getAnalysis, getPet } = await import("./db");

        const analysis = await getAnalysis(input.analysisId);
        if (!analysis) {
          throw new Error("Analysis not found");
        }

        // Verify pet belongs to user
        const pet = await getPet(analysis.petId);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        return analysis;
      }),
    submitFeedback: protectedProcedure
      .input(
        z.object({
          analysisId: z.string().max(64),
          feedback: z.enum(["helpful", "not_helpful"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getAnalysis, getPet, updateAnalysisFeedback } = await import(
          "./db"
        );

        const analysis = await getAnalysis(input.analysisId);
        if (!analysis) {
          throw new Error("Analysis not found");
        }

        // Verify pet belongs to user
        const pet = await getPet(analysis.petId);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        await updateAnalysisFeedback(input.analysisId, input.feedback);
        return { success: true };
      }),
  }),

  // Payment and credits
  payment: router({
    getAvailability: publicProcedure.query(() => billingAvailability()),
    getCreditPacks: publicProcedure.query(() => {
      return Object.values(CREDIT_PACKS);
    }),
    getSubscriptionPlans: publicProcedure.query(() => {
      return Object.values(SUBSCRIPTION_PLANS);
    }),
    createSubscriptionCheckout: protectedProcedure
      .input(
        z.object({
          planId: z.enum(["essential", "premium", "shelter"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const successUrl = `${process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?subscription=success`;
        requireBillingAvailable();
        const cancelUrl = `${process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"}/subscribe?subscription=cancelled`;

        const checkoutUrl = await createSubscriptionCheckout(
          ctx.user.id,
          input.planId as SubscriptionPlanId,
          successUrl,
          cancelUrl
        );

        if (!checkoutUrl) {
          throw new Error(
            "Unable to create checkout session. Please try again or contact support if the problem persists."
          );
        }

        return { url: checkoutUrl };
      }),
    createCheckout: protectedProcedure
      .input(
        z.object({
          packId: z.enum(["starter", "value", "power"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const successUrl = `${process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=success`;
        requireBillingAvailable();
        const cancelUrl = `${process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=cancelled`;

        const checkoutUrl = await createCheckoutSession(
          ctx.user.id,
          input.packId as CreditPackId,
          successUrl,
          cancelUrl
        );

        if (!checkoutUrl) {
          throw new Error(
            "Unable to process payment. Please check your payment information and try again."
          );
        }

        return { url: checkoutUrl };
      }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await getUserCredits(ctx.user.id);
      const betaTester = await isBetaTester(ctx.user.id);
      return {
        credits,
        isBetaTester: betaTester,
        unlimited: hasUnlimitedCredits(ctx.user),
      };
    }),
    validateBetaCode: publicProcedure
      .input(
        z.object({
          code: z.string().max(64),
        })
      )
      .mutation(async ({ input }) => {
        const result = await validateBetaCode(input.code);
        return { valid: result.valid };
      }),
    redeemBetaCode: protectedProcedure
      .input(
        z.object({
          code: z.string().max(64),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const success = await activateBetaTester(ctx.user.id, input.code);
        if (!success) {
          throw new Error(
            "Invalid or expired beta code. Please check your code and try again, or contact support if you believe this is an error."
          );
        }
        return { success: true };
      }),
  }),

  feedback: router({
    submit: protectedProcedure
      .input(
        z.object({
          category: z.enum([
            "bug",
            "feature_request",
            "ux_improvement",
            "performance",
            "content",
            "other",
          ]),
          rating: z.number().min(1).max(5).optional(),
          message: z.string().min(1).max(5000),
          pageUrl: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createFeedback } = await import("./db");
        const userAgent = ctx.req.headers["user-agent"] || undefined;

        await createFeedback({
          userId: ctx.user.id,
          category: input.category,
          rating: input.rating ?? null,
          message: input.message,
          pageUrl: input.pageUrl ?? null,
          userAgent: userAgent ?? null,
        });

        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserFeedback } = await import("./db");
      return getUserFeedback(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
