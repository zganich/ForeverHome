import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession, createSubscriptionCheckout, CREDIT_PACKS, SUBSCRIPTION_PLANS, type CreditPackId, type SubscriptionPlanId } from "./stripe";
import { getUserCredits, activateBetaTester, isBetaTester } from "./credits";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
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
      .input(z.object({ petId: z.string() }))
      .query(async ({ input }) => {
        const { getPetReminders } = await import("./reminders");
        return getPetReminders(input.petId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          petId: z.string(),
          title: z.string().min(1),
          description: z.string().optional(),
          type: z.enum(["medication", "vet", "grooming", "training", "custom"]),
          dueDate: z.date(),
          isRecurring: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).default("none"),
        })
      )
      .mutation(async ({ ctx, input }) => {
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
      .input(z.object({ reminderId: z.string() }))
      .mutation(async ({ input }) => {
        const { completeReminder } = await import("./reminders");
        return completeReminder(input.reminderId);
      }),
    delete: protectedProcedure
      .input(z.object({ reminderId: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteReminder } = await import("./reminders");
        return deleteReminder(input.reminderId);
      }),
  }),

  // Pet management
  pets: router({
    identifyBreed: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          species: z.enum(["dog", "cat", "other"]),
        })
      )
      .mutation(async ({ input }) => {
        const { identifyBreed } = await import("./breedIdentification");
        return identifyBreed(input.imageUrl, input.species);
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPets } = await import("./db");
      return getUserPets(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          species: z.enum(["dog", "cat", "other"]),
          breed: z.string().optional(),
          age: z.string().optional(),
          photoUrl: z.string().optional(),
          personality: z.enum(["goofy", "wise", "sassy", "serious", "excited", "sleepy", "dramatic"]).optional(),
          voiceStyle: z.string().optional(),
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
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        const { validatePhotoQuality, getPhotoTips } = await import("./photoQuality");
        const result = await validatePhotoQuality(input.imageUrl);
        const tips = getPhotoTips(result.issues);
        return { ...result, tips };
      }),
    create: protectedProcedure
      .input(
        z.object({
          petId: z.string(),
          mediaUrl: z.string(),
          mediaType: z.enum(["image", "video"]),
          userContext: z.string().optional(),
          photoDate: z.date().optional(),
          petAgeAtPhoto: z.string().optional(),
          quickMode: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getPet, createAnalysis } = await import("./db");
        const { analyzeBehavior } = await import("./aiAgents");
        const { deductCredits } = await import("./credits");

        // Verify pet belongs to user
        const pet = await getPet(input.petId);
        if (!pet) {
          throw new Error("Pet not found. Please check that the pet exists and try again.");
        }
        if (pet.userId !== ctx.user.id) {
          throw new Error("You don't have permission to analyze this pet. Please contact support if you believe this is an error.");
        }

        // Deduct credits before analysis
        const creditsDeducted = await deductCredits(ctx.user.id, 1);
        if (!creditsDeducted) {
          throw new Error("Insufficient credits. Please purchase more credits or upgrade your plan.");
        }

        // Run AI agent swarm analysis with Phase 1 optimizations
        const result = await analyzeBehavior(
          input.mediaUrl, 
          pet, 
          input.userContext,
          {
            quickMode: input.quickMode,
          }
        );

        // Store analysis in database
        const analysis = await createAnalysis({
          petId: input.petId,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType,
          userContext: input.userContext,
          photoDate: input.photoDate,
          petAgeAtPhoto: input.petAgeAtPhoto,
          visionData: JSON.stringify(result.vision),
          contextData: JSON.stringify(result.context),
          synthesisData: JSON.stringify(result.synthesis),
          recommendations: JSON.stringify(result.recommendations),
          primaryBehavior: result.synthesis.primaryBehavior,
          confidenceScore: `${Math.round(result.synthesis.confidence)}%`,
        });

        return {
          analysis,
          result,
        };
      }),
    listForPet: protectedProcedure.input(z.object({ petId: z.string() })).query(async ({ ctx, input }) => {
      const { getPet, getPetAnalyses } = await import("./db");

      // Verify pet belongs to user
      const pet = await getPet(input.petId);
              if (!pet) {
          throw new Error("Pet not found. Please check that the pet exists and try again.");
        }
        if (pet.userId !== ctx.user.id) {
          throw new Error("You don't have permission to access this pet. Please contact support if you believe this is an error.");
        }

      return getPetAnalyses(input.petId);
    }),
    get: protectedProcedure.input(z.object({ analysisId: z.string() })).query(async ({ ctx, input }) => {
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
          analysisId: z.string(),
          feedback: z.enum(["helpful", "not_helpful"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getAnalysis, getPet, updateAnalysisFeedback } = await import("./db");

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
        const successUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?subscription=success`;
        const cancelUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/subscribe?subscription=cancelled`;

        const checkoutUrl = await createSubscriptionCheckout(
          ctx.user.id,
          input.planId as SubscriptionPlanId,
          successUrl,
          cancelUrl
        );

        if (!checkoutUrl) {
          throw new Error("Unable to create checkout session. Please try again or contact support if the problem persists.");
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
        const successUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=success`;
        const cancelUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=cancelled`;

        const checkoutUrl = await createCheckoutSession(
          ctx.user.id,
          input.packId as CreditPackId,
          successUrl,
          cancelUrl
        );

        if (!checkoutUrl) {
          throw new Error("Unable to process payment. Please check your payment information and try again.");
        }

        return { url: checkoutUrl };
      }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await getUserCredits(ctx.user.id);
      const betaTester = await isBetaTester(ctx.user.id);
      return { credits, isBetaTester: betaTester };
    }),
    redeemBetaCode: protectedProcedure
      .input(
        z.object({
          code: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const success = await activateBetaTester(ctx.user.id, input.code);
        if (!success) {
          throw new Error("Invalid or expired beta code. Please check your code and try again, or contact support if you believe this is an error.");
        }
        return { success: true };
      }),
  }),

  feedback: router({
    submit: protectedProcedure
      .input(
        z.object({
          category: z.enum(["bug", "feature_request", "ux_improvement", "performance", "content", "other"]),
          rating: z.number().min(1).max(5).optional(),
          message: z.string().min(1),
          pageUrl: z.string().optional(),
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
