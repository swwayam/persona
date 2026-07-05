/**
 * Tiny SSE (Server-Sent Events) parser for the browser.
 * Yields { event, data } objects as they stream in.
 */
export interface SSEEvent {
  event: string;
  data: unknown;
}

export async function* parseSSE(
  response: Response
): AsyncGenerator<SSEEvent, void, void> {
  if (!response.body) {
    throw new Error("Response has no body to stream.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE separates events with a blank line.
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const lines = part.split("\n");
        let event = "message";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            data += line.slice(5).trim();
          }
        }
        if (!data) continue;
        let parsed: unknown = data;
        try {
          parsed = JSON.parse(data);
        } catch {
          // keep as string
        }
        yield { event, data: parsed };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
