import OpenAI from "openai";

import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";

export type PersonalityType = "goofy" | "wise" | "sassy" | "serious" | "excited" | "sleepy" | "dramatic";

/**
 * Generate personality-based interpretation text
 * This creates the "voice" of the pet based on their personality
 */
export async function generatePersonalityVoice(
  interpretation: string,
  personality: PersonalityType
): Promise<string> {
  const personalityPrompts = {
    goofy: `Rewrite this pet behavior interpretation in a playful, silly, energetic voice. Use casual language, exclamations, and enthusiasm. Make it fun and lighthearted:\n\n${interpretation}`,
    
    wise: `Rewrite this pet behavior interpretation in a calm, philosophical, gentle voice. Use thoughtful language and wisdom. Make it sound like a wise old soul:\n\n${interpretation}`,
    
    sassy: `Rewrite this pet behavior interpretation in a sarcastic, witty voice with attitude. Add personality and sass. Make it sound confident and a bit cheeky:\n\n${interpretation}`,
    
    serious: `Rewrite this pet behavior interpretation in a professional, matter-of-fact voice. Keep it straightforward and informative:\n\n${interpretation}`,
    
    excited: `Rewrite this pet behavior interpretation in a high-energy, enthusiastic voice. Use lots of exclamation points and excitement. Make it sound super pumped:\n\n${interpretation}`,
    
    sleepy: `Rewrite this pet behavior interpretation in a calm, drowsy, relaxed voice. Use slow, peaceful language. Make it sound like they're half asleep:\n\n${interpretation}`,
    
    dramatic: `Rewrite this pet behavior interpretation in an over-the-top, theatrical voice. Make it dramatic and expressive. Add flair and emotion:\n\n${interpretation}`,
  };

  const response = await invokeLLM({
    messages: [{ role: "user", content: personalityPrompts[personality] }],
    maxTokens: 500,
  });
  const content = response.choices[0]?.message.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Unable to generate pet interpretation.");
  return content;

}

/**
 * Generate speech audio from text using OpenAI TTS
 * Returns a Buffer containing the MP3 audio data
 */
export async function generateSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<Buffer> {
  try {
    if (!ENV.openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");
    const openai = new OpenAI({ apiKey: ENV.openaiApiKey, baseURL: ENV.openaiBaseUrl });
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      speed: 1.0,
    });

    // Convert the response to a Buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("[TTS] Error generating speech:", error);
    throw new Error("Failed to generate speech");
  }
}

/**
 * Map personality types to OpenAI voice styles
 */
export function getVoiceForPersonality(personality: PersonalityType): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  const voiceMap: Record<PersonalityType, "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"> = {
    goofy: "alloy",      // Neutral, versatile
    wise: "onyx",        // Deep, authoritative
    sassy: "nova",       // Energetic, expressive
    serious: "echo",     // Clear, professional
    excited: "shimmer",  // Bright, enthusiastic
    sleepy: "fable",     // Soft, gentle
    dramatic: "nova",    // Expressive, theatrical
  };

  return voiceMap[personality];
}

