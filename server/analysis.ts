import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { analyzeBehavior, type ProgressData } from "./aiAgents";
import { getPet, createAnalysis } from "./db";
import { reserveAnalysisCredit, refundAnalysisCredit } from "./credits";

export const analysisInput = z.object({
  petId: z.string().min(1),
  mediaUrl: z.url(),
  mediaType: z.enum(["image", "video"]),
  userContext: z.string().max(5000).optional(),
  photoDate: z.coerce.date().optional(),
  petAgeAtPhoto: z.string().max(64).optional(),
  quickMode: z.boolean().optional(),
});

export async function runAnalysis(
  userId: string,
  input: z.infer<typeof analysisInput>,
  onProgress?: (stage: string, data?: ProgressData) => void
) {
  // OpenAI's image input cannot consume an uploaded video URL. Reject before
  // charging until frame extraction is implemented in a separate engagement.
  if (input.mediaType !== "image")
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Video analysis is unavailable. Please upload a photo.",
    });
  const pet = await getPet(input.petId);
  if (!pet)
    throw new Error(
      "Pet not found. Please check that the pet exists and try again."
    );
  if (pet.userId !== userId)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to analyze this pet.",
    });
  const reservation = await reserveAnalysisCredit(userId);
  if (!reservation.allowed)
    throw new Error(
      "Insufficient credits. Please purchase more credits or upgrade your plan."
    );
  try {
    const result = await analyzeBehavior(
      input.mediaUrl,
      pet,
      input.userContext,
      { quickMode: input.quickMode, onProgress }
    );
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
      personalityVoice: result.personalityVoice,
    });
    return { analysis, result };
  } catch (error) {
    if (reservation.charged) await refundAnalysisCredit(userId);
    throw error;
  }
}
