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
    const fetch = vi.fn().mockResolvedValue({
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
      vi.fn().mockResolvedValue({
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

it("logs only bounded diagnostic identifiers, never the provider message or prompt", async () => {
  vi.mocked(console.error).mockClear();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "x-request-id": "req_fixture" }),
        json: async () => ({
          error: {
            code: "invalid_image_url",
            type: "invalid_request_error",
            param: "messages",
            message: "PRIVATE_IMAGE_AND_PROMPT",
          },
        }),
      })
  );
  await expect(invokeLLM({ messages: [] })).rejects.toThrow("(400)");
  const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
  expect(logged).toContain("invalid_image_url");
  expect(logged).toContain("req_fixture");
  expect(logged).not.toContain("PRIVATE_IMAGE_AND_PROMPT");
  vi.unstubAllGlobals();
});
it("rejects incomplete output before the pipeline can persist it", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "{}" }, finish_reason: "length" }],
        }),
      })
  );
  await expect(invokeLLM({ messages: [] })).rejects.toThrow("incomplete");
  vi.unstubAllGlobals();
});
