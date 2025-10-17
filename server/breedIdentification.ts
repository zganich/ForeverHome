import { invokeLLM } from "./_core/llm";

export interface BreedPrediction {
  breed: string;
  confidence: number; // 0-1
  traits: string[];
}

export interface BreedIdentificationResult {
  primaryBreed: string;
  confidence: "low" | "medium" | "high";
  candidates: BreedPrediction[];
  careTips: string[];
  behaviorTraits: string[];
}

/**
 * Identify pet breed from image using GPT-4 Vision
 */
export async function identifyBreed(
  imageUrl: string,
  species: "dog" | "cat" | "other"
): Promise<BreedIdentificationResult> {
  const systemPrompt = `You are an expert veterinary breed identification specialist. Analyze the provided pet image and identify the breed with high accuracy.

Return a JSON object with this exact structure:
{
  "primaryBreed": "Most likely breed name",
  "confidence": "low" | "medium" | "high",
  "candidates": [
    {
      "breed": "Breed name",
      "confidence": 0.0-1.0,
      "traits": ["trait1", "trait2", "trait3"]
    }
  ],
  "careTips": ["tip1", "tip2", "tip3"],
  "behaviorTraits": ["trait1", "trait2", "trait3"]
}

Guidelines:
- Provide top 3 breed candidates
- Confidence levels: high (>0.7), medium (0.4-0.7), low (<0.4)
- For mixed breeds, list the most prominent breeds
- Include breed-specific care tips
- Include typical behavior traits for the breed
- If uncertain, be honest about low confidence`;

  const userPrompt = `Identify the breed of this ${species}. Provide detailed breed analysis including physical characteristics, likely breed mix if applicable, care requirements, and typical behavior traits.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "breed_identification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              primaryBreed: { type: "string" },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              candidates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    breed: { type: "string" },
                    confidence: { type: "number" },
                    traits: { type: "array", items: { type: "string" } },
                  },
                  required: ["breed", "confidence", "traits"],
                  additionalProperties: false,
                },
              },
              careTips: { type: "array", items: { type: "string" } },
              behaviorTraits: { type: "array", items: { type: "string" } },
            },
            required: ["primaryBreed", "confidence", "candidates", "careTips", "behaviorTraits"],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      throw new Error("No response from breed identification");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    const result: BreedIdentificationResult = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("[Breed ID] Error:", error);
    throw new Error("Failed to identify breed");
  }
}

/**
 * Get breed-specific behavior context for analysis
 */
export function getBreedBehaviorContext(
  breed: string,
  species: "dog" | "cat" | "other"
): string {
  // This provides context to the behavior analysis agents
  return `This ${species} is identified as a ${breed}. Consider breed-specific traits when analyzing behavior.`;
}

