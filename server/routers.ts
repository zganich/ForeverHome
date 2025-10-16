import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession, CREDIT_PACKS, type CreditPackId } from "./stripe";
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

  // Pet management
  pets: router({
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getPet, createAnalysis } = await import("./db");
        const { analyzeBehavior } = await import("./aiAgents");

        // Verify pet belongs to user
        const pet = await getPet(input.petId);
        if (!pet || pet.userId !== ctx.user.id) {
          throw new Error("Pet not found or access denied");
        }

        // Run AI agent swarm analysis
        const result = await analyzeBehavior(input.mediaUrl, pet, input.userContext);

        // Store analysis in database
        const analysis = await createAnalysis({
          petId: input.petId,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType,
          userContext: input.userContext,
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
      if (!pet || pet.userId !== ctx.user.id) {
        throw new Error("Pet not found or access denied");
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
          throw new Error("Failed to create checkout session");
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
          throw new Error("Invalid beta code");
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
