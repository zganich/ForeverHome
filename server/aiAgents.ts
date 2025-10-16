import { invokeLLM } from "./_core/llm";
import type { Pet } from "../drizzle/schema";

/**
 * AI Agent Swarm for Pet Behavior Analysis
 * Each agent has a specialized role in the analysis pipeline
 */

export interface VisionAnalysis {
  posture: string;
  facialExpression: string;
  environmentalContext: string;
  confidence: number;
}

export interface ContextEnrichment {
  breedTraits: string;
  ageConsiderations: string;
  historicalPatterns?: string;
}

export interface BehaviorSynthesis {
  primaryBehavior: string;
  confidence: number;
  reasoning: string;
  alternativeInterpretations?: string[];
}

export interface Recommendations {
  actions: string[];
  safetyWarnings?: string[];
  vetConsultation?: boolean;
}

/**
 * Vision Agent: Analyzes visual content from images/videos
 */
export async function visionAgent(imageUrl: string, species: string): Promise<VisionAnalysis> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a pet behavior vision specialist analyzing ${species} body language and expressions. Focus on observable physical cues.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this ${species}'s body language. Focus on:
1. Body posture (tail, ears, stance, muscle tension)
2. Facial expression (eyes, mouth, overall tension)
3. Environmental context (location, other animals/people present)

Return a JSON object with: posture, facialExpression, environmentalContext, and confidence (0-100).`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "vision_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            posture: { type: "string", description: "Description of body posture" },
            facialExpression: { type: "string", description: "Description of facial expression" },
            environmentalContext: { type: "string", description: "Environmental observations" },
            confidence: { type: "number", description: "Confidence score 0-100" },
          },
          required: ["posture", "facialExpression", "environmentalContext", "confidence"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format from LLM");
  }
  return JSON.parse(content || "{}");
}

/**
 * Context Agent: Enriches analysis with pet-specific context
 */
export async function contextAgent(pet: Pet, visionData: VisionAnalysis): Promise<ContextEnrichment> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a pet behavior expert providing breed and age-specific context.",
      },
      {
        role: "user",
        content: `Given this pet profile and visual observations, provide context:

Pet: ${pet.name} (${pet.breed || "mixed breed"} ${pet.species}, ${pet.age || "unknown age"})
Visual observations: ${JSON.stringify(visionData)}

Provide:
1. Breed-specific behavioral tendencies
2. Age-appropriate behavior expectations

Return JSON with: breedTraits, ageConsiderations`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "context_enrichment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            breedTraits: { type: "string", description: "Breed-specific traits" },
            ageConsiderations: { type: "string", description: "Age-related considerations" },
          },
          required: ["breedTraits", "ageConsiderations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format from LLM");
  }
  return JSON.parse(content || "{}");
}

/**
 * Behavioral Synthesis Agent: Combines all inputs for holistic interpretation
 */
export async function synthesisAgent(
  visionData: VisionAnalysis,
  contextData: ContextEnrichment,
  userContext?: string
): Promise<BehaviorSynthesis> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert pet behaviorist synthesizing multiple data sources to interpret behavior. Be empathetic and educational.",
      },
      {
        role: "user",
        content: `Synthesize this data into a behavior interpretation:

Vision Analysis: ${JSON.stringify(visionData)}
Context: ${JSON.stringify(contextData)}
${userContext ? `User's note: ${userContext}` : ""}

Provide:
1. Primary behavior interpretation (one clear label like "Playful", "Anxious", "Content")
2. Confidence score (0-100)
3. Clear, empathetic explanation of reasoning
4. Alternative interpretations if confidence < 70%

Return JSON with: primaryBehavior, confidence, reasoning, alternativeInterpretations (array, optional)`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "behavior_synthesis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            primaryBehavior: { type: "string", description: "Primary behavior label" },
            confidence: { type: "number", description: "Confidence 0-100" },
            reasoning: { type: "string", description: "Explanation of interpretation" },
            alternativeInterpretations: {
              type: "array",
              items: { type: "string" },
              description: "Alternative possibilities",
            },
          },
          required: ["primaryBehavior", "confidence", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format from LLM");
  }
  return JSON.parse(content || "{}");
}

/**
 * Recommendation Agent: Generates actionable suggestions
 */
export async function recommendationAgent(synthesis: BehaviorSynthesis): Promise<Recommendations> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a pet care advisor providing safe, actionable recommendations. 
NEVER diagnose medical conditions. 
ALWAYS suggest vet consultation for concerning behaviors.
Focus on positive reinforcement.`,
      },
      {
        role: "user",
        content: `Based on this behavior interpretation, provide recommendations:

${JSON.stringify(synthesis)}

Provide:
1. 2-3 specific, actionable recommendations
2. Safety warnings if applicable
3. Whether to consult a veterinarian (true/false)

Return JSON with: actions (array of strings), safetyWarnings (array, optional), vetConsultation (boolean)`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: { type: "string" },
              description: "Actionable recommendations",
            },
            safetyWarnings: {
              type: "array",
              items: { type: "string" },
              description: "Safety warnings if applicable",
            },
            vetConsultation: {
              type: "boolean",
              description: "Whether to consult a vet",
            },
          },
          required: ["actions", "vetConsultation"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format from LLM");
  }
  return JSON.parse(content || "{}");
}

/**
 * Orchestrator: Runs the full agent swarm pipeline
 */
export async function analyzeBehavior(
  imageUrl: string,
  pet: Pet,
  userContext?: string
): Promise<{
  vision: VisionAnalysis;
  context: ContextEnrichment;
  synthesis: BehaviorSynthesis;
  recommendations: Recommendations;
  personalityVoice: string;
  personality: string;
}> {
  // Run agents in sequence
  const vision = await visionAgent(imageUrl, pet.species);
  const context = await contextAgent(pet, vision);
  const synthesis = await synthesisAgent(vision, context, userContext);
  const recommendations = await recommendationAgent(synthesis);

  // Generate personality-based voice interpretation
  const personality = pet.personality || "goofy";
  const { generatePersonalityVoice } = await import("./textToSpeech");
  
  // Create a conversational interpretation from the synthesis
  const baseInterpretation = `${synthesis.primaryBehavior}. ${synthesis.reasoning}`;
  const personalityVoice = generatePersonalityVoice(baseInterpretation, personality as any);

  return {
    vision,
    context,
    synthesis,
    recommendations,
    personalityVoice,
    personality,
  };
}

