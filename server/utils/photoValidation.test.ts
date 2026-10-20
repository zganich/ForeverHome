import { describe, test, expect, vi, beforeEach } from "vitest";
import { validatePhotoQuality, getPhotoTips } from "../photoQuality";

// Mock the LLM invocation
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("Photo Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validatePhotoQuality", () => {
    test("accepts high-quality photos", async () => {
      const { invokeLLM } = await import("../_core/llm");

      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isAcceptable: true,
                score: 95,
                issues: [],
                suggestions: [],
                canProceed: true,
              }),
            },
          },
        ],
      });

      const result = await validatePhotoQuality(
        "https://example.com/good-photo.jpg"
      );

      expect(result.isAcceptable).toBe(true);
      expect(result.score).toBe(95);
      expect(result.canProceed).toBe(true);
      expect(result.issues).toEqual([]);
    });

    test("rejects low-quality photos", async () => {
      const { invokeLLM } = await import("../_core/llm");

      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isAcceptable: false,
                score: 30,
                issues: ["Photo is too blurry", "Poor lighting"],
                suggestions: ["Use better lighting", "Hold camera steady"],
                canProceed: false,
              }),
            },
          },
        ],
      });

      const result = await validatePhotoQuality(
        "https://example.com/bad-photo.jpg"
      );

      expect(result.isAcceptable).toBe(false);
      expect(result.score).toBe(30);
      expect(result.canProceed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test("provider outage never reports a passing quality check", async () => {
      const { invokeLLM } = await import("../_core/llm");
      vi.mocked(invokeLLM).mockRejectedValue(new Error("API Error"));
      await expect(
        validatePhotoQuality("data:image/jpeg;base64,/9j/2Q==")
      ).rejects.toThrow("No analysis was started");
    });
    test("malformed provider results cannot pass validation", async () => {
      const { invokeLLM } = await import("../_core/llm");
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{ message: { content: '{"canProceed":true}' } }],
      } as any);
      await expect(
        validatePhotoQuality("data:image/jpeg;base64,/9j/2Q==")
      ).rejects.toThrow("quality check unavailable");
    });
  });

  describe("getPhotoTips", () => {
    test("provides tips for blurry photos", () => {
      const issues = ["Photo is blurry", "Low resolution"];
      const tips = getPhotoTips(issues);

      expect(tips.length).toBeGreaterThan(0);
      expect(
        tips.some(
          tip =>
            tip.toLowerCase().includes("focus") ||
            tip.toLowerCase().includes("steady")
        )
      ).toBe(true);
    });

    test("provides tips for lighting issues", () => {
      const issues = ["Poor lighting", "Too dark"];
      const tips = getPhotoTips(issues);

      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(tip => tip.toLowerCase().includes("light"))).toBe(true);
    });

    test("provides tips for visibility issues", () => {
      const issues = ["Pet not visible", "Pet partially hidden"];
      const tips = getPhotoTips(issues);

      expect(tips.length).toBeGreaterThan(0);
      expect(
        tips.some(
          tip =>
            tip.toLowerCase().includes("visible") ||
            tip.toLowerCase().includes("see")
        )
      ).toBe(true);
    });

    test("returns general tips when no specific issues", () => {
      // getPhotoTips always returns general tips when no specific issues match
      const tips = getPhotoTips([]);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips).toContain("💡 Medium shots showing face and body work best");
      expect(tips).toContain("☀️ Natural lighting helps capture clear details");
    });
  });
});
