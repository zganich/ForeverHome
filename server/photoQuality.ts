import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const photoQualitySchema = z.object({
  isAcceptable: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(z.string().max(2000)).max(20),
  suggestions: z.array(z.string().max(2000)).max(20),
  canProceed: z.boolean(),
});

export interface PhotoQualityResult {
  isAcceptable: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  canProceed: boolean;
}

/**
 * Validates photo quality before running full analysis
 * This is a quick check to prevent wasting credits on unusable photos
 */
export async function validatePhotoQuality(
  imageUrl: string
): Promise<PhotoQualityResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a photo quality validator for pet behavior analysis. Evaluate if the photo is suitable for AI behavior analysis.

Check for:
1. Pet visibility - Is the pet clearly visible?
2. Lighting - Is there sufficient light to see details?
3. Focus/Clarity - Is the image sharp enough?
4. Framing - Can you see the pet's face or body?
5. Obstructions - Is the pet partially hidden?

Return a JSON response with:
- isAcceptable (boolean): true if photo is usable
- score (number 0-100): quality score
- issues (array): list of problems found
- suggestions (array): specific tips to improve
- canProceed (boolean): whether to allow analysis`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Evaluate this photo for pet behavior analysis quality:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low", // Use low detail for faster, cheaper validation
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "photo_quality_check",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isAcceptable: {
                type: "boolean",
                description: "Whether the photo is acceptable for analysis",
              },
              score: {
                type: "number",
                description: "Quality score from 0-100",
              },
              issues: {
                type: "array",
                items: { type: "string" },
                description: "List of quality issues found",
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "Specific suggestions to improve photo quality",
              },
              canProceed: {
                type: "boolean",
                description: "Whether to allow analysis to proceed",
              },
            },
            required: [
              "isAcceptable",
              "score",
              "issues",
              "suggestions",
              "canProceed",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      throw new Error("No response from quality check");
    }

    const content =
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content);

    const result = photoQualitySchema.parse(JSON.parse(content));
    return result;
  } catch (error) {
    // Provider outages and invalid responses are not successful quality checks.
    throw new Error(
      "Photo quality check unavailable. Please try again later. No analysis was started."
    );
  }
}

/**
 * Get helpful tips based on quality issues
 */
export function getPhotoTips(issues: string[]): string[] {
  const tips: string[] = [];

  if (
    issues.some(
      i => i.toLowerCase().includes("dark") || i.toLowerCase().includes("light")
    )
  ) {
    tips.push("📸 Try taking the photo in natural light or near a window");
  }

  if (
    issues.some(
      i => i.toLowerCase().includes("blur") || i.toLowerCase().includes("focus")
    )
  ) {
    tips.push("🎯 Hold your phone steady and make sure the pet is in focus");
  }

  if (
    issues.some(
      i => i.toLowerCase().includes("far") || i.toLowerCase().includes("small")
    )
  ) {
    tips.push("🔍 Get closer to your pet - medium shots work best");
  }

  if (
    issues.some(
      i =>
        i.toLowerCase().includes("hidden") ||
        i.toLowerCase().includes("obstruct")
    )
  ) {
    tips.push("👁️ Make sure your pet's face or body is fully visible");
  }

  if (issues.some(i => i.toLowerCase().includes("angle"))) {
    tips.push("📐 Try shooting at your pet's eye level for better results");
  }

  // Always include general tips
  if (tips.length === 0) {
    tips.push("💡 Medium shots showing face and body work best");
    tips.push("☀️ Natural lighting helps capture clear details");
  }

  return tips;
}
