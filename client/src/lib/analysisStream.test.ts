import { expect, it, vi, afterEach } from "vitest";
vi.mock("./api", () => ({ authFetch: vi.fn() }));
import { authFetch } from "./api";
import { AnalysisStream } from "./analysisStream";
afterEach(() => vi.clearAllMocks());
it("decodes chunked progress and closes on exactly one persisted completion without retry", async () => {
  const encoder = new TextEncoder();
  vi.mocked(authFetch).mockResolvedValue(
    new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(encoder.encode('data: {"stage":"start"}\n\nda'));
          c.enqueue(
            encoder.encode('ta: {"stage":"complete","analysisId":"saved"}\n\n')
          );
          c.close();
        },
      })
    )
  );
  const events: any[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = new AnalysisStream({});
    stream.onerror = reject;
    stream.onmessage = e => {
      const value = JSON.parse(e.data);
      events.push(value);
      if (value.stage === "complete") {
        stream.close();
        resolve();
      }
    };
  });
  expect(events.map(x => x.stage)).toEqual(["start", "complete"]);
  expect(authFetch).toHaveBeenCalledTimes(1);
});
it("reports truncated EOF and never automatically starts another paid request", async () => {
  vi.mocked(authFetch).mockResolvedValue(
    new Response('data: {"stage":"start"}\n\n')
  );
  const error = await new Promise<unknown>(resolve => {
    const stream = new AnalysisStream({});
    stream.onerror = resolve;
  });
  expect(String(error)).toContain("before completion");
  expect(authFetch).toHaveBeenCalledTimes(1);
});
it("delivers a provider error as failure rather than completion", async () => {
  vi.mocked(authFetch).mockResolvedValue(
    new Response('data: {"stage":"error","error":"AI unavailable"}\n\n')
  );
  const message = await new Promise<string>((resolve, reject) => {
    const stream = new AnalysisStream({});
    stream.onerror = reject;
    stream.onmessage = e => {
      stream.close();
      resolve(e.data);
    };
  });
  expect(JSON.parse(message).stage).toBe("error");
  expect(authFetch).toHaveBeenCalledTimes(1);
});
