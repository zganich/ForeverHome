import type { Express, Request, Response } from "express";
import { requireAuth } from "../_core/auth";
import { analysisInput, runAnalysis } from "../analysis";

export async function handleAnalysisStream(req: Request, res: Response) {
  const parsed = analysisInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid analysis request" }); return; }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  const send = (event: Record<string, unknown>) => {
    if (!res.destroyed && !res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  try {
    send({ stage: "start", progress: 5 });
    const completed = await runAnalysis(res.locals.user.id, parsed.data, (stage, data) => {
      const progress = { vision: 25, context: 45, synthesis: 65, recommendations: 85, voice: 95 }[stage] ?? 5;
      send({ stage, data, progress });
    });
    // Exactly one completion event, after persistence, including the result ID.
    send({ stage: "complete", progress: 100, analysisId: completed.analysis.id, result: completed.result });
  } catch (error) {
    send({ stage: "error", error: error instanceof Error ? error.message : "Analysis failed" });
  } finally { res.end(); }
}

export function registerStreamingRoutes(app: Express) {
  app.post("/api/analysis/stream", requireAuth, handleAnalysisStream);
}
