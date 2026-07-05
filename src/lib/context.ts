import type { ChatMessage } from "./llm";
import { getPersona, type PersonaId } from "./personas";

/**
 * Build the message array sent to the LLM.
 *
 * Strategy:
 *   1. System message = persona prompt.
 *   2. Keep the last N user/assistant turns (sliding window) for context.
 *   3. Always include the latest user message (already in window).
 *
 * We slice from the END of the array so the most recent conversation
 * survives, which is what the model needs to stay coherent.
 */

export interface BuildContextOptions {
  persona: PersonaId;
  history: ChatMessage[]; // user/assistant turns only, no system
  contextWindow: number;
}

export function buildContextMessages(opts: BuildContextOptions): ChatMessage[] {
  const persona = getPersona(opts.persona);
  const sys: ChatMessage = { role: "system", content: persona.systemPrompt };

  // `history` is already user/assistant only. Drop empties.
  const cleaned = opts.history.filter(
    (m) => m.role !== "system" && typeof m.content === "string" && m.content.trim().length > 0
  );

  // Sliding window: keep last (2 * contextWindow) messages to roughly
  // cover N back-and-forth turns. We multiply by 2 to keep pairs balanced.
  const windowSize = Math.max(2, opts.contextWindow) * 2;
  const trimmed = cleaned.slice(-windowSize);

  return [sys, ...trimmed];
}

/**
 * Lightweight summarization-free context management.
 *
 * We avoid real summarization here for two reasons:
 *   1. It doubles LLM cost and adds latency on every request.
 *   2. With 20-message windows (≈10 turns) the model stays coherent on
 *      all current supported providers, which is plenty for a chat demo.
 *
 * For longer sessions a future improvement is rolling summary
 * (see docs/CONTEXT.md).
 */
