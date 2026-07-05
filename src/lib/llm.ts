/**
 * LLM client abstraction. Works with any OpenAI-compatible chat
 * completions endpoint (OpenAI, Groq, Together, OpenRouter, Mistral, vLLM, etc).
 *
 * Reads config from env at runtime so deployment platforms can swap providers
 * without code changes.
 */

export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
  contextWindow: number;
}

export function getLLMConfig(): LLMConfig {
  const baseUrl =
    process.env.LLM_BASE_URL?.replace(/\/+$/, "") || "https://api.openai.com/v1";
  const apiKey = process.env.LLM_API_KEY || "";
  const model = process.env.LLM_MODEL || "gpt-5-mini";
  const defaultMaxTokens = Number(process.env.LLM_MAX_TOKENS) || 1024;
  const defaultTemperature = Number(process.env.LLM_TEMPERATURE) || 0.7;
  const contextWindow = Number(process.env.LLM_CONTEXT_WINDOW) || 20;

  return {
    baseUrl,
    apiKey,
    model,
    defaultMaxTokens,
    defaultTemperature,
    contextWindow
  };
}

export class LLMConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMConfigError";
  }
}

export function validateConfig(cfg: LLMConfig): void {
  if (!cfg.apiKey || cfg.apiKey === "your_api_key_here") {
    throw new LLMConfigError(
      "LLM_API_KEY is missing. Set it in .env.local or your deployment platform's env settings."
    );
  }
  if (!cfg.model) {
    throw new LLMConfigError("LLM_MODEL is missing.");
  }
}

/**
 * OpenAI reasoning models (gpt-5*, o1/o3/o4...) reject `max_tokens` and any
 * non-default `temperature` on the chat completions API. They take
 * `max_completion_tokens` instead, and that budget includes hidden reasoning
 * tokens — so we pin `reasoning_effort` low to keep replies fast and
 * conversational rather than burning the budget on reasoning.
 */
function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/.test(model);
}

function buildRequestBody(cfg: LLMConfig, req: ChatRequest, stream: boolean) {
  const body: Record<string, unknown> = {
    model: cfg.model,
    messages: req.messages,
    stream
  };
  const maxTokens = req.maxTokens ?? cfg.defaultMaxTokens;
  if (isReasoningModel(cfg.model)) {
    body.max_completion_tokens = maxTokens;
    body.reasoning_effort = "low";
  } else {
    body.max_tokens = maxTokens;
    body.temperature = req.temperature ?? cfg.defaultTemperature;
  }
  return body;
}

/**
 * Non-streaming chat completion. Returns the full assistant text.
 * Useful for tests and for callers that don't want to handle streams.
 */
export async function chatComplete(req: ChatRequest): Promise<string> {
  const cfg = getLLMConfig();
  validateConfig(cfg);

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify(buildRequestBody(cfg, req, false))
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM request failed: ${res.status} ${res.statusText} — ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned an empty response.");
  }
  return content;
}

/**
 * Streaming chat completion. Yields text deltas as they arrive from the model.
 * Compatible with the OpenAI streaming format (data: {choices:[{delta:{content}}]}).
 */
export async function* chatStream(req: ChatRequest): AsyncGenerator<string, void, void> {
  const cfg = getLLMConfig();
  validateConfig(cfg);

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify(buildRequestBody(cfg, req, true))
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM stream failed: ${res.status} ${res.statusText} — ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split SSE events. Events are separated by a blank line.
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        if (!payload) continue;

        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // Some providers send partial JSON in a single chunk. Skip malformed.
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
