# Persona Chat — Hitesh & Piyush AI

> An AI-powered website that simulates conversations with **Hitesh Choudhary** and **Piyush Garg**, matching each person's tone, vocabulary, and teaching style.

Built with Next.js 14, TypeScript, Tailwind CSS, and any OpenAI-compatible LLM (Groq, OpenAI, OpenRouter, Together, Mistral, vLLM, ...).

---

## Live demo

Deploy in 60 seconds on Vercel: see **[Deployment](#deployment)**.

## Features

- 🎭 **Two real personas** — Hitesh (Hinglish, big-brother energy) and Piyush (English-first, system-design voice).
- 🔄 **Live persona switcher** in the header. Switching starts a fresh conversation.
- 💬 **Streaming responses** with token-by-token updates, abortable mid-stream.
- 🧠 **Sliding-window context** that keeps the last ~10 turns coherent.
- 💾 **Local-first persistence** — conversations live in `localStorage`; nothing is stored server-side.
- 🧑‍💻 **Code blocks** with syntax highlighting (oneDark).
- 📜 **In-app docs** at `/docs` explaining persona prep, prompt design, and context strategy.
- 🔌 **Provider-agnostic** — works with any OpenAI-compatible API. Defaults to OpenAI (`gpt-5-mini`); Groq, OpenRouter, Together, etc. work by swapping two env vars.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/your-username/persona-chat.git
cd persona-chat

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# edit .env.local and add your LLM_API_KEY

# 4. Run
npm run dev
# open http://localhost:3000
```

### Getting an API key

The default config targets **OpenAI** with `gpt-5-mini`:

1. Create an API key at [platform.openai.com](https://platform.openai.com/api-keys).
2. Put it in `.env.local` as `LLM_API_KEY=sk-...`.
3. Leave the defaults: `LLM_BASE_URL=https://api.openai.com/v1`, `LLM_MODEL=gpt-5-mini`.

If you'd rather use **Groq** (generous free tier), change `.env.local` to:

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_...
LLM_MODEL=llama-3.3-70b-versatile
```

> **Note on GPT-5 models:** reasoning models (`gpt-5*`, `o*`) don't accept custom
> `temperature` or `max_tokens` on the chat completions API. The client in
> [`src/lib/llm.ts`](./src/lib/llm.ts) detects them automatically, sends
> `max_completion_tokens` + `reasoning_effort: "low"` instead, and skips the
> temperature override. The per-persona temperature tuning below applies only to
> non-reasoning models (Groq, `gpt-4o-mini`, etc.).

---

## Project structure

```
persona-chat/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts        # Streaming SSE chat endpoint
│   │   ├── docs/                    # In-app documentation
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Main chat page
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatWindow.tsx           # Main app shell + state
│   │   ├── Sidebar.tsx              # Conversation list
│   │   ├── ChatInput.tsx            # Auto-grow textarea + send/stop
│   │   ├── MessageBubble.tsx        # One message (user or assistant)
│   │   ├── MarkdownView.tsx         # react-markdown + syntax highlight
│   │   ├── PersonaSwitcher.tsx      # Header pill toggle
│   │   ├── EmptyState.tsx           # Welcome + suggested prompts
│   │   ├── TypingDots.tsx
│   │   └── CopyButton.tsx
│   └── lib/
│       ├── personas.ts              # ⭐ Hitesh & Piyush system prompts
│       ├── llm.ts                   # OpenAI-compatible streaming client
│       ├── context.ts               # Sliding-window context builder
│       ├── storage.ts               # localStorage persistence
│       ├── stream.ts                # SSE parser
│       └── types.ts                 # Shared types
├── docs/                            # Long-form markdown docs
│   ├── ARCHITECTURE.md
│   └── EVALUATION.md                # Rubric + test questions
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Documentation

The full design doc lives at **[/docs](http://localhost:3000/docs)** once the app is running, and is also checked in:

- [`docs/PERSONAS.md`](./docs/PERSONAS.md) — how the persona data was collected and prepared.
- [`docs/PROMPTS.md`](./docs/PROMPTS.md) — the prompt-engineering strategy, the per-persona tuning, and the rules.
- [`docs/CONTEXT.md`](./docs/CONTEXT.md) — context-management approach and the v2 plan (rolling summary + RAG).
- [`docs/SAMPLES.md`](./docs/SAMPLES.md) — sample transcripts that show both personas in action.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — module breakdown, data flow, and extension points.
- [`docs/EVALUATION.md`](./docs/EVALUATION.md) — evaluation rubric mapped to the assignment's marks.

---

## How the personas work

There is **no fine-tuning, no RAG, no scraping at scale**. Each persona is a single, large system prompt in [`src/lib/personas.ts`](./src/lib/personas.ts) that encodes:

- WHO YOU ARE — identity, role, brand
- LANGUAGE & TONE — exact Hinglish/English ratio and signature phrases
- PERSONALITY — values, anti-patterns, what they never do
- TEACHING APPROACH — numbered procedure the model follows
- DOMAIN DEPTH — strong / weak topics so the model can admit limits
- RESPONSE SHAPE & HARD RULES — length, code formatting, never-break rules

Per-persona sampling tweaks live in [`src/app/api/chat/route.ts`](./src/app/api/chat/route.ts):

| Persona | Temperature | Max tokens | Why |
| --- | --- | --- | --- |
| Hitesh | 0.75 | 1100 | Warmer, more conversational; allows longer story-style replies. |
| Piyush | 0.55 | 1000 | Tighter, more deterministic; favours clean technical answers. |

See **[docs/PROMPTS.md](./docs/PROMPTS.md)** for the full design.

---

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible endpoint. |
| `LLM_API_KEY` | _(required)_ | API key for the provider. |
| `LLM_MODEL` | `gpt-5-mini` | Model name. |
| `LLM_MAX_TOKENS` | `1024` | Max tokens per response (sent as `max_completion_tokens` for reasoning models). |
| `LLM_TEMPERATURE` | `0.7` | Default temperature; overridden per persona. Ignored by GPT-5/o-series models. |
| `LLM_CONTEXT_WINDOW` | `20` | Recent messages kept as context (~10 turns). |

---

## Scripts

```bash
npm run dev        # start dev server on :3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add the env vars from `.env.example` in the Vercel dashboard.
4. Deploy.

That's it — Vercel auto-detects Next.js and routes the streaming `/api/chat` endpoint correctly.

### Anywhere else

Any Node 18+ host that supports streaming responses works. Build with `npm run build` and start with `npm run start`.

```bash
docker build -t persona-chat .
docker run -p 3000:3000 --env-file .env.local persona-chat
```

---

## License

MIT.

## Credits

- Hitesh Choudhary — [hitesh.ai](https://hitesh.ai), YouTube.
- Piyush Garg — [piyushgarg.dev](https://www.piyushgarg.dev), YouTube.
- This project is a fan-made educational tool, not affiliated with either educator.
