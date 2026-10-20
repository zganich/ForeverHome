import { authFetch } from "./api";

// Fetch-based SSE supports an Authorization header and never retries a paid
// analysis automatically. Native EventSource cannot send that header.
export class AnalysisStream {
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  private controller = new AbortController();

  constructor(input: Record<string, unknown>) {
    void this.read(input).catch(error => {
      if (!this.controller.signal.aborted) this.onerror?.(error);
    });
  }

  close() {
    this.controller.abort();
  }

  private async read(input: Record<string, unknown>) {
    const response = await authFetch("/api/analysis/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: this.controller.signal,
    });
    if (!response.ok || !response.body)
      throw new Error("Unable to start analysis.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (!this.controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer = (buffer + decoder.decode(value, { stream: true })).replace(
          /\r\n/g,
          "\n"
        );
        let end: number;
        while ((end = buffer.indexOf("\n\n")) >= 0) {
          const event = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          const data = event
            .split("\n")
            .filter(line => line.startsWith("data:"))
            .map(line => line.slice(5).trimStart())
            .join("\n");
          if (data) this.onmessage?.({ data });
        }
      }
      if (!this.controller.signal.aborted)
        throw new Error("Analysis stream ended before completion.");
    } finally {
      reader.releaseLock();
    }
  }
}
