# Persona data preparation

This document explains how the Hitesh Choudhary and Piyush Garg personas
were distilled from public content into a single, auditable system prompt
each. There is no fine-tuning, no scraping pipeline, and no vector store —
the persona is 100% encoded in [`src/lib/personas.ts`](../src/lib/personas.ts).

## 1. Sources

We only used content that is public, attributable, and free to reference for
educational purposes.

### Hitesh Choudhary
- YouTube — full-stack web dev playlists, JavaScript deep dives, career
  talks, the "Chai aur Code" brand content.
- [hitesh.ai](https://hitesh.ai) — bio, blog, course catalogue.
- Podcasts and panels where he appears as a guest.
- Public X / Twitter posts.

### Piyush Garg
- YouTube — system design series, full-stack / Next.js / Node projects,
  devlog content.
- [piyushgarg.dev](https://www.piyushgarg.dev) — bio, writing.
- Public LinkedIn / X posts.

## 2. Distillation methodology

For each persona we asked the same four questions of the source material:

1. **What is the default language and code-switch pattern?**
   Hitesh defaults to heavy Roman-Hindi Hinglish with English tech terms;
   Piyush is mostly English with light Hindi sprinkles.
2. **What are the recurring phrases, hooks, and analogies?**
   Hitesh: "dekho", "bhai", "yrr", "chai", "tutorial hell", hostel / mess
   / chai analogies. Piyush: "let's see", "trade-off", "in production",
   system-diagram framing.
3. **How do they teach?**
   Hitesh leads with a story or analogy, then code, then a "next step".
   Piyush frames the problem, reasons about trade-offs, then shows
   production-grade code.
4. **What is in / out of domain?**
   We list strong and weak topics so the model can honestly say
   "yeh meri strong area nahi hai".

## 3. Encoding as a system prompt

Each distilled profile becomes a single system prompt with a fixed six-section
structure, so the LLM sees a stable shape, the prompt is easy to diff between
iterations, and behaviour stays consistent across providers.

1. **WHO YOU ARE** — identity, role, brand voice.
2. **LANGUAGE & TONE** — Hinglish ratio, signature phrases.
3. **PERSONALITY** — values, anti-patterns, what they never do.
4. **TEACHING APPROACH** — how they structure answers.
5. **DOMAIN DEPTH** — strong / weak areas, so the model can admit limits.
6. **RESPONSE SHAPE & HARD RULES** — length, code, formatting, never-break rules.

The full prompts are in [`src/lib/personas.ts`](../src/lib/personas.ts). They
are intentionally long and dense; brevity in a system prompt loses signal.

## 4. What we deliberately did not do

- **No fine-tuning.** The project ships zero trained weights; the persona
  lives 100% in the prompt so it can be audited, version-controlled, and
  swapped in seconds.
- **No fabricated quotes.** The signature phrases in the prompts are the
  kind of phrases both educators actually use in their public content. We
  do not include fake "as I said in my 2022 video" references in the
  system prompt.
- **No impersonation beyond chat.** The model is instructed to never reveal
  it is an AI, and to refuse to write harmful, illegal, or impersonating
  content (e.g. tweets that look like they were really posted by the
  persona).

## 5. Iteration loop

The system prompts went through ~6 rounds. Each round:

1. Pick 8–10 diverse test questions.
2. Run them against the model.
3. Score each reply on a 1–5 rubric for **voice**, **accuracy**, and
   **teaching clarity**.
4. Edit the prompt to fix the worst failure mode.

The full rubric and test set live in [`EVALUATION.md`](./EVALUATION.md).
