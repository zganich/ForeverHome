import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./db", () => ({ getPet: vi.fn(), createAnalysis: vi.fn() }));
vi.mock("./credits", () => ({
  reserveAnalysisCredit: vi.fn(),
  refundAnalysisCredit: vi.fn(),
}));
vi.mock("./aiAgents", () => ({ analyzeBehavior: vi.fn() }));
import { getPet, createAnalysis } from "./db";
import { reserveAnalysisCredit, refundAnalysisCredit } from "./credits";
import { analyzeBehavior } from "./aiAgents";
import { runAnalysis } from "./analysis";

describe("Analysis persistence and credit recovery", () => {
  const input = {
    petId: "pet",
    mediaUrl: "https://fictional.example/photo.jpg",
    mediaType: "image" as const,
  };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPet).mockResolvedValue({ id: "pet", userId: "user" } as any);
    vi.mocked(reserveAnalysisCredit).mockResolvedValue({
      allowed: true,
      charged: true,
    });
    vi.mocked(analyzeBehavior).mockResolvedValue({
      synthesis: { primaryBehavior: "Content", confidence: 80 },
      personalityVoice: "I feel relaxed.",
    } as any);
    vi.mocked(createAnalysis).mockResolvedValue({ id: "saved" } as any);
  });
  it("returns a persisted result including the generated interpretation", async () => {
    expect((await runAnalysis("user", input)).analysis.id).toBe("saved");
    expect(createAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({ personalityVoice: "I feel relaxed." })
    );
    expect(refundAnalysisCredit).not.toHaveBeenCalled();
  });
  it("refunds provider failures", async () => {
    vi.mocked(analyzeBehavior).mockRejectedValue(new Error("provider down"));
    await expect(runAnalysis("user", input)).rejects.toThrow("provider down");
    expect(refundAnalysisCredit).toHaveBeenCalledWith("user");
    expect(createAnalysis).not.toHaveBeenCalled();
  });
  it("refunds persistence failures", async () => {
    vi.mocked(createAnalysis).mockRejectedValue(new Error("write failed"));
    await expect(runAnalysis("user", input)).rejects.toThrow("write failed");
    expect(refundAnalysisCredit).toHaveBeenCalledWith("user");
  });
  it("does not award a refund to uncharged beta or unlimited accounts", async () => {
    vi.mocked(reserveAnalysisCredit).mockResolvedValue({
      allowed: true,
      charged: false,
    });
    vi.mocked(analyzeBehavior).mockRejectedValue(new Error("provider down"));
    await expect(runAnalysis("user", input)).rejects.toThrow();
    expect(refundAnalysisCredit).not.toHaveBeenCalled();
  });
  it("blocks another user's pet before charging", async () => {
    await expect(runAnalysis("other", input)).rejects.toThrow("permission");
    expect(reserveAnalysisCredit).not.toHaveBeenCalled();
  });
  it("blocks unsupported video before charging", async () => {
    await expect(
      runAnalysis("user", { ...input, mediaType: "video" })
    ).rejects.toThrow("Video analysis is unavailable");
    expect(reserveAnalysisCredit).not.toHaveBeenCalled();
  });
});
