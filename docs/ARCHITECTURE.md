# Architecture

A short tour of the codebase for anyone who wants to extend it.

## Module map

```
src/
├── app/                       # Next.js App Router
│   ├── api/chat/route.ts      # ⭐ Streaming SSE endpoint
│   ├── docs/                  # /docs pages (rendered as React)
│   ├── layout.tsx             # Root layout, fonts, metadata
│   ├── page.tsx               # The chat page
│   └── globals.css            # Tailwind + small custom styles
├── components/
│   ├── ChatWindow.tsx         # App shell, state, side-effects
│   ├── Sidebar.tsx            # Conversation list, grouped by persona
│   ├── ChatInput.tsx          # Auto-grow textarea + send/stop
│   ├── MessageBubble.tsx      # One message (user or assistant)
│   ├── MarkdownView.tsx       # react-markdown + Prism syntax highlighting
│   ├── PersonaSwitcher.tsx    # Header pill toggle + avatar
│   ├── EmptyState.tsx         # Welcome + suggested prompts
│   ├── TypingDots.tsx
│   └── CopyButton.tsx
└── lib/
    ├── personas.ts            # ⭐ Hitesh & Piyush system prompts
    ├── llm.ts                 # Provider-agnostic LLM client (stream + complete)
    ├── context.ts             # Sliding-window context builder
    ├── storage.ts             # localStorage persistence
    ├── stream.ts              # Browser SSE parser
    └── types.ts               # Shared types
```

## Data flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (React)                                                    │
│                                                                     │
│   ChatWindow (state: conversations, activeId, activePersona)        │
│      │                                                              │
│      ├── Sidebar          ← localStorage on change                  │
│      │                                                              │
│      ├── Message list     ← streamed deltas committed per token     │
│      │                                                              │
│      └── ChatInput        → POST { persona, messages: history }     │
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │ SSE
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Server: /api/chat/route.ts                                         │
│                                                                     │
│   1. Validate body                                                  │
│   2. Read LLM config from env                                       │
│   3. buildContextMessages(persona, history, contextWindow)          │
│        → [persona system prompt, last N user/assistant turns]        │
│   4. chatStream({ messages, temperature, maxTokens })               │
│        → for-await each delta → emit `event: delta` over SSE        │
│   5. Emit `event: done` on completion, `event: error` on failure    │
│                                                                     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS
                                  ▼
                       Any OpenAI-compatible LLM
                       (Groq, OpenAI, OpenRouter, …)
```

## Where to extend

| You want to … | Edit this file |
| --- | --- |
| Change how a persona talks | `src/lib/personas.ts` |
| Add a new persona | `src/lib/personas.ts` (add to `personas` map + UI switcher) |
| Tune sampling per persona | `src/app/api/chat/route.ts` (`PERSONA_TUNING`) |
| Add RAG / rolling summary | `src/lib/context.ts` |
| Change UI / add components | `src/components/*` |
| Change the chat API contract | `src/lib/llm.ts` + `src/app/api/chat/route.ts` |
| Add a new LLM provider | Just set the env vars; no code change needed |

## Design choices

- **No DB.** Conversations live in the browser's `localStorage`. The
  server is stateless. This is intentional: the demo is small, privacy
  is a feature, and Vercel hobby tier is enough.
- **No auth.** Anyone with the URL can chat. Fine for a public demo.
  A real deployment behind auth would just gate the API route.
- **Streaming-first.** Every reply streams via SSE so the first token
  lands in <1s. The client builds up the assistant message from deltas
  and shows a typing cursor at the end.
- **Provider-agnostic.** The LLM client speaks OpenAI's chat-completions
  format, which Groq, OpenAI, OpenRouter, Together, Mistral, vLLM and
  others all implement. Switching providers is a 3-line `.env` change.

## State machine (one message send)

```
IDLE  ──[user submits]──>  SENDING  ──[stream starts]──>  STREAMING
                                                              │
                            ┌─────────────────────────────────┤
                            │                                 │
                       [user stops]                       [stream ends]
                            │                                 │
                            ▼                                 ▼
                         IDLE                             IDLE (+ msg)
```

Empty assistant placeholders on error are removed so the user never sees
a half-empty turn. The retry button re-sends the last user message and
discards the trailing failed assistant turn.
