import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createPet } = await import("./db");
        return createPet(ctx.user.id, input);
      }),
  }),

  // Behavior analysis
  analysis: router({
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
});

export type AppRouter = typeof appRouter;
