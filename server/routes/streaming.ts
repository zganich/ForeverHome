import express from "express";
import { createContext } from "../_core/context";
import { getPet, createAnalysis } from "../db";
import { analyzeBehavior, type ProgressData } from "../aiAgents";
import { deductCredits } from "../credits";
import type { Request, Response } from "express";

/**
 * SSE endpoint for streaming analysis progress
 * This allows the frontend to receive real-time updates as analysis progresses
 */
export async function handleAnalysisStream(req: Request, res: Response) {
  const { petId, mediaUrl, mediaType, userContext, photoDate, petAgeAtPhoto, quickMode } = req.query;

  // Validate required parameters
  if (!petId || !mediaUrl || !mediaType) {
    res.status(400).json({ error: "Missing required parameters: petId, mediaUrl, mediaType" });
    return;
  }

  // Create context for authentication
  const ctx = await createContext({ req, res } as any);
  if (!ctx.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  const sendEvent = (stage: string, data?: ProgressData | { status: string } | any, progress?: number) => {
    const eventData = {
      stage,
      data,
      progress,
      timestamp: Date.now(),
    };
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  };

  try {
    // Verify pet belongs to user
    const pet = await getPet(petId as string);
    if (!pet) {
      sendEvent("error", { status: "error" }, 0);
      res.write(`data: ${JSON.stringify({ stage: "error", error: "Pet not found" })}\n\n`);
      res.end();
      return;
    }

    if (pet.userId !== ctx.user.id) {
      sendEvent("error", { status: "error" }, 0);
      res.write(`data: ${JSON.stringify({ stage: "error", error: "Access denied" })}\n\n`);
      res.end();
      return;
    }

    // Deduct credits before analysis
    const creditsDeducted = await deductCredits(ctx.user.id, 1);
    if (!creditsDeducted) {
      sendEvent("error", { status: "error" }, 0);
      res.write(`data: ${JSON.stringify({ stage: "error", error: "Insufficient credits" })}\n\n`);
      res.end();
      return;
    }

    // Start analysis with progress callbacks
    sendEvent("start", { status: "starting" }, 5);

    const result = await analyzeBehavior(
      mediaUrl as string,
      pet,
      (userContext as string) || undefined,
      {
        quickMode: quickMode === "true",
        streaming: true,
        onProgress: (stage: string, data?: ProgressData) => {
          let progress = 5;
          
          // Check if data has status property (for "analyzing" status)
          const isAnalyzing = data && typeof data === "object" && "status" in data && data.status === "analyzing";
          
          // Map stages to progress percentages
          switch (stage) {
            case "vision":
              progress = isAnalyzing ? 20 : 35;
              break;
            case "context":
              progress = isAnalyzing ? 40 : 55;
              break;
            case "synthesis":
              progress = isAnalyzing ? 60 : 75;
              break;
            case "recommendations":
              progress = isAnalyzing ? 80 : 90;
              break;
            case "voice":
              progress = isAnalyzing ? 92 : 95;
              break;
            case "complete":
              progress = 98;
              break;
          }

          sendEvent(stage, data, progress);
        },
      }
    );

    // Store analysis in database
    const analysis = await createAnalysis({
      petId: petId as string,
      mediaUrl: mediaUrl as string,
      mediaType: mediaType as "image" | "video",
      userContext: (userContext as string) || undefined,
      photoDate: photoDate ? new Date(photoDate as string) : undefined,
      petAgeAtPhoto: (petAgeAtPhoto as string) || undefined,
      visionData: JSON.stringify(result.vision),
      contextData: JSON.stringify(result.context),
      synthesisData: JSON.stringify(result.synthesis),
      recommendations: JSON.stringify(result.recommendations),
      primaryBehavior: result.synthesis.primaryBehavior,
      confidenceScore: `${Math.round(result.synthesis.confidence)}%`,
    });

    // Send completion event
    sendEvent("complete", { personalityVoice: result.personalityVoice, personality: result.personality }, 100);
    res.write(`data: ${JSON.stringify({ 
      stage: "complete", 
      analysisId: analysis.id,
      result 
    })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Analysis stream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ stage: "error", error: errorMessage })}\n\n`);
    res.end();
  }
}

export function registerStreamingRoutes(app: express.Express) {
  app.get("/api/analysis/stream", handleAnalysisStream);
}
