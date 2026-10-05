import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./env", () => ({
  ENV: {
    openaiApiKey: "fictional-key",
    openaiBaseUrl: "https://api.openai.com/v1",
    openaiModel: "gpt-4.1-mini",
  },
}));
import { invokeLLM } from "./llm";

describe("Direct OpenAI transport", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("sends images, strict JSON schema and requested token limit without Forge parameters", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "{}" } }] }),
      });
    vi.stubGlobal("fetch", fetch);
    await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: "https://fictional.example/photo.jpg" },
            },
          ],
        },
      ],
      maxTokens: 300,
      outputSchema: {
        name: "result",
        schema: { type: "object" },
        strict: true,
      },
    });
    expect(fetch.mock.calls[0][0]).toBe(
      "https://api.openai.com/v1/chat/completions"
    );
    const request = JSON.parse(fetch.mock.calls[0][1].body);
    expect(request.model).toBe("gpt-4.1-mini");
    expect(request.max_completion_tokens).toBe(300);
    expect(request.response_format.json_schema.strict).toBe(true);
    expect(request.messages[0].content[0].type).toBe("image_url");
    expect(request).not.toHaveProperty("thinking");
  });
  it("does not expose provider error bodies", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 401,
          text: async () => "sensitive provider detail",
        })
    );
    await expect(invokeLLM({ messages: [] })).rejects.toThrow(
      "AI provider request failed (401)"
    );
  });
});
