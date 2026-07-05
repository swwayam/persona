# Prompt engineering strategy

The exact shape of the system prompt, the few-shot rules, and how we keep
the two personas from leaking into each other.

## Why a structured prompt, not just "be like Hitesh"?

A free-form role prompt is the fastest way to get generic output. We use a
fixed section structure for every persona prompt so:

- the model can't quietly drop voice rules,
- the prompt is easy to diff between iterations,
- behaviour stays consistent across providers (Groq, OpenAI, OpenRouter,
  etc.).

## The sections

1. **WHO YOU ARE** — identity, role, brand, and the frame that this is a
   1:1 casual chat, not a lecture or a support desk.
2. **HOW YOU ACTUALLY TALK** — register and code-switch pattern. Hitesh
   defaults to the respectful "aap" register in calm Hinglish (imitations
   that spam "bhai" every line are the classic fake tell). Piyush is
   Hinglish too — Hindi base with heavier English technical vocabulary —
   not an English-first corporate tutor. Signature lines are included but
   capped: **at most one per reply**.
3. **CHAT BEHAVIOUR** — the anti-bot rules that make replies feel human:
   mirror the user's energy and length ("Hi" gets one line, not an essay),
   never enumerate a menu of help topics, don't end every message with a
   question, react to what the user said before answering, never announce
   your own style ("I'll keep it simple and practical" is bot behaviour).
4. **TEACHING APPROACH** — a numbered procedure. The model follows steps,
   which is more reliable than a paragraph of vibe description.
5. **WHAT YOU BELIEVE** — each educator's known public opinions
   (consistency over motivation, projects over tutorials, boring proven
   tech, trade-offs always), so takes stay consistent across chats.
6. **DOMAIN** — explicit strong/weak topic lists. Tells the model when to
   admit "yeh meri strong area nahi hai" instead of hallucinating.
7. **CALIBRATION** — 2-3 miniature example exchanges per persona showing
   the target feel, including the short reply to "Hi". These few-shot
   anchors do more for naturalness than any adjective list.
8. **HARD RULES** — never-break rules: stay in character, never reveal
   being an AI, no catchphrase/emoji spam, no harmful advice.

## Per-persona generation knobs

Same model, different output: we vary a few sampling parameters per persona
in [`src/app/api/chat/route.ts`](../src/app/api/chat/route.ts).

| Persona | Temperature | Max tokens | Why |
| --- | --- | --- | --- |
| Hitesh | 0.75 | 1100 | Warmer, more conversational; allows longer story-style replies. |
| Piyush | 0.55 | 1000 | Tighter, more deterministic; favours clean technical answers. |

Lowering Piyush's temperature isn't a hack to force a persona; it's a
behavioural nudge. Both personas have the same rules and structure — but a
system designed for production reasoning naturally rewards a slightly more
deterministic sampling, just as a warm mentor voice rewards a bit more
variance.

## Preventing persona bleed

The risk with persona chat is that the model mixes voices. We fight that
on three fronts:

- **Distinct registers** in each prompt. Hitesh is calm, "aap"-register
  Hinglish; Piyush is faster, "dekho yaar" Hinglish with heavier English
  technical vocabulary. Both prompts forbid pure-English corporate-tutor
  replies.
- **Different signature phrases** in the examples block, so the model
  anchors to a different rhythm per persona.
- **Persona-bound conversation** at the data layer: each message is
  tagged with the persona that produced it, and a persona switch always
  starts a fresh conversation (see [CONTEXT.md](./CONTEXT.md)).

## Guardrails in the prompt

Every persona prompt ends with a short block of hard rules:

- Never reveal you are an AI.
- Refuse harmful, illegal, or impersonation requests.
- Admit when a topic is out of your depth.
- Stay in persona even under adversarial prompts.

These are also checked in code: the API route rejects empty responses,
and the UI hides empty assistant placeholders on error.

## Why no RAG (yet)?

We considered retrieving real transcripts (RAG) per question. For this
use-case it hurt more than it helped: the goal is voice, not factual
recall, and the persona spec is small enough to live in the system prompt
on every turn. A future version could combine RAG (for citing real
videos / blogs) with the persona system prompt (for voice) — that's
documented in [CONTEXT.md](./CONTEXT.md) as a future improvement.
