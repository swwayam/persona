# AGENTS.md

Notes for future contributors and AI coding agents working in this repo.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS
- OpenAI-compatible LLM endpoint (Groq by default)
- `react-markdown` + `remark-gfm` + `react-syntax-highlighter` (Prism oneDark)
- `lucide-react` for icons

## Commands

```bash
npm run dev        # dev server on :3000
npm run build      # production build (also typechecks)
npm run start      # serve the build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

Run all three (`build`, `lint`, `typecheck`) before opening a PR. All
three currently pass clean.

## Conventions

- TypeScript strict mode. No `any`, no `// @ts-ignore`. If a type is
  awkward, fix it at the type level rather than suppressing.
- Functional React components only. No class components.
- "use client" only where state / effects / browser APIs are needed.
  Most of the app is client-side because it's a chat; that's expected.
- All shared types live in `src/lib/types.ts`. Per-domain types live
  next to the file that uses them.
- No code comments unless the user asks for them. Code should be
  self-documenting; docs go in `docs/`.

## Adding a new persona

1. Add a new entry to `personas` in `src/lib/personas.ts` with a
   six-section system prompt.
2. Add a `PersonaId` to the union type at the top of the same file.
3. Add per-persona tuning to `PERSONA_TUNING` in
   `src/app/api/chat/route.ts`.
4. (Optional) Add an avatar URL and accent colour in
   `tailwind.config.ts` if the new persona needs its own theme colour.
5. The persona switcher in the header and the sidebar grouping in
   `Sidebar.tsx` are data-driven; no change needed.

## Adding a new LLM provider

No code change needed if the provider speaks the OpenAI chat-completions
streaming format (Groq, OpenAI, OpenRouter, Together, Mistral, vLLM,
LM Studio, etc.). Just change `LLM_BASE_URL`, `LLM_API_KEY`, and
`LLM_MODEL` in `.env.local` / your hosting platform.

## Swapping the context strategy

`src/lib/context.ts` exposes `buildContextMessages({ persona, history,
contextWindow })`. That's the only seam. To add rolling summary or RAG,
implement the new pipeline behind the same function signature and
`/api/chat/route.ts` doesn't need to change.

## Prompt iteration

The persona system prompts in `src/lib/personas.ts` are the single
source of truth. When iterating:

1. Write a small set of test questions (see `docs/EVALUATION.md`).
2. Run them via the dev server and capture the outputs.
3. Score on voice / accuracy / teaching clarity (1–5 each).
4. Edit the prompt to fix the worst failure mode, not the symptom.

Avoid putting fake "as I said in my 2022 video" references in the
system prompt. Avoid putting quotes that don't generalise.

## Things to not do

- Don't add a database. The app is intentionally local-first.
- Don't fine-tune anything. The whole point of the project is that the
  persona is auditable in one file.
- Don't introduce a CSS-in-JS lib. Tailwind only.
- Don't add analytics, cookies, or any tracking. The app has zero
  network calls except the LLM request the user triggers.
- Don't change `LLM_BASE_URL` defaults to a paid provider silently.
  Default to Groq's free tier.
