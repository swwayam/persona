# Context management

How a 10-turn conversation stays coherent, and what we'd do differently
for 100-turn sessions.

## The constraint

Every LLM call has a fixed context window. Naively sending the whole
conversation forever means:

1. the bill grows linearly with the chat,
2. latency grows linearly with the chat, and
3. at some point the oldest messages get truncated and the model forgets
   the original question.

For an educator-persona chat, the right behaviour is: *keep the recent
turns, drop the rest, and let the persona prompt carry the long-term voice
rules.*

## What we do today: sliding window

In [`src/lib/context.ts`](../src/lib/context.ts) the `buildContextMessages`
helper takes the full history and returns:

1. The persona **system prompt** (always).
2. The **last N** user/assistant turns, where N is controlled by
   `LLM_CONTEXT_WINDOW` (default 20 messages ≈ 10 turns).

We slice from the end of the array, never the start, so the freshest
context always wins. This is a deliberate trade-off: we accept that the
model can't remember turn 1 once you cross 10 turns, in exchange for
stable cost and latency.

## What the window size means in tokens

A typical Hinglish assistant turn is ~120–250 tokens; a typical user
question is ~15–60 tokens. With 20 messages we're looking at ~1.5k–3k
tokens of recent history, which is well inside every modern model's
window and leaves plenty of room for the ~1.2k-token persona system prompt
and the new response.

## Why no summarization (yet)

A rolling summary would let us keep long-term context past the window,
which sounds great. In practice, for this use-case:

- It doubles LLM cost (one extra call to summarize before every reply).
- It adds 200–600ms of latency to every reply.
- It needs careful prompt design to avoid "summary poisoning" where the
  summary subtly drifts the persona.
- The persona prompt already encodes long-term voice rules, so most
  loss-of-recall failures are recoverable with a follow-up question.

## Future improvement: rolling summary + retrieval

The planned v2 pipeline is:

1. **Persona system prompt** (always, never trimmed).
2. **Rolling summary** of turns older than the window, regenerated
   whenever the window slides.
3. **Last N raw turns** for verbatim recall.
4. **Optional RAG** for citing real videos / blog posts when the user
   asks "show me where you explained closures".

The interface in [`src/lib/context.ts`](../src/lib/context.ts) is shaped
to make that swap a one-file change.

## Other small-but-important rules

- **Persona-scoped conversations.** Switching from Hitesh to Piyush starts
  a new conversation, so we never mix personas inside one history buffer.
- **Empty-message filter.** The API rejects the request if the last
  message isn't a non-empty user turn.
- **Streaming + abort.** The server streams via SSE, the client parses it
  incrementally, and a Stop button aborts the fetch. The conversation
  state stays consistent because we only commit deltas to the in-memory
  model.
- **Storage.** Conversations are persisted to `localStorage` under one
  namespaced key. Wiping storage wipes history; nothing is sent to a
  backend.
