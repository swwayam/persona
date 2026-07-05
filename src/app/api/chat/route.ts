import { NextRequest } from "next/server";
import { getLLMConfig, chatStream, LLMConfigError, type ChatMessage } from "@/lib/llm";
import { type PersonaId } from "@/lib/personas";
import { buildContextMessages } from "@/lib/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  persona: PersonaId;
  messages: ChatMessage[];
}

/**
 * Per-persona tuning knobs. Different personas feel right at different
 * temperatures / token budgets, so we override the env defaults here.
 */
const PERSONA_TUNING: Record<
  PersonaId,
  { temperature: number; maxTokens: number }
> = {
  hitesh: { temperature: 0.75, maxTokens: 1100 },
  piyush: { temperature: 0.55, maxTokens: 1000 }
};

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  if (!body || (body.persona !== "hitesh" && body.persona !== "piyush")) {
    return jsonError(400, "Invalid or missing 'persona'. Expected 'hitesh' or 'piyush'.");
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError(400, "Missing 'messages' array.");
  }

  // Only the latest user message is required; the rest is sliding-window history.
  const last = body.messages[body.messages.length - 1];
  if (!last || last.role !== "user" || !last.content?.trim()) {
    return jsonError(400, "Last message must be a non-empty user message.");
  }

  let cfg;
  try {
    cfg = getLLMConfig();
  } catch (err) {
    return jsonError(500, (err as Error).message);
  }

  const messages = buildContextMessages({
    persona: body.persona,
    history: body.messages,
    contextWindow: cfg.contextWindow
  });

  const tuning = PERSONA_TUNING[body.persona];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send("status", { persona: body.persona, model: cfg.model });

        for await (const delta of chatStream({
          messages,
          temperature: tuning.temperature,
          maxTokens: tuning.maxTokens
        })) {
          send("delta", { content: delta });
        }
        send("done", { ok: true });
        controller.close();
      } catch (err) {
        const msg = err instanceof LLMConfigError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error";
        send("error", { message: msg });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      hint: "POST { persona, messages: [{role, content}] } to stream a chat response."
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
