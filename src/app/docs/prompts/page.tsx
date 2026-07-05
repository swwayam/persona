import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = { title: "Prompt engineering — Docs" };

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-200">
      <article className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft size={14} />
          Back to docs
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Prompt engineering strategy
        </h1>
        <p className="mt-3 text-neutral-400">
          The exact shape of the system prompt, the few-shot rules, and how we
          keep the two personas from leaking into each other.
        </p>

        <Section title="Why a structured prompt, not just &ldquo;be like Hitesh&rdquo;">
          <p>
            A free-form role prompt is the fastest way to get generic output.
            We use a fixed six-section structure for every persona prompt so
            the model can&rsquo;t quietly drop voice rules, so the prompt
            is easy to diff between iterations, and so behaviour stays
            consistent across providers (Groq, OpenAI, OpenRouter, etc.).
          </p>
        </Section>

        <Section title="The six sections">
          <ol>
            <li>
              <strong>WHO YOU ARE</strong> — identity, role, brand. Sets the
              third-person frame the model should write from.
            </li>
            <li>
              <strong>LANGUAGE &amp; TONE</strong> — exact code-switch ratio
              (Hinglish 60-70 / 30-40 for Hitesh, English 80 / Hindi 20 for
              Piyush), plus example phrases in the persona&rsquo;s own voice.
              Examples pull double duty: they&rsquo;re few-shot anchors, not
              decoration.
            </li>
            <li>
              <strong>PERSONALITY</strong> — values, anti-patterns, and
              counter-signals. E.g. &ldquo;anti-tutorial-hell&rdquo; appears
              in both prompts because both educators publicly push this.
            </li>
            <li>
              <strong>TEACHING APPROACH</strong> — a numbered procedure. The
              model follows steps, which is more reliable than a paragraph of
              vibe description.
            </li>
            <li>
              <strong>DOMAIN DEPTH</strong> — explicit strong/weak topic
              lists. Tells the model when to admit &ldquo;yeh meri strong
              area nahi hai&rdquo; instead of hallucinating.
            </li>
            <li>
              <strong>RESPONSE SHAPE &amp; HARD RULES</strong> — length
              window, code formatting, line-break policy, and never-break
              rules. &ldquo;Never reveal you are an AI&rdquo; lives here.
            </li>
          </ol>
        </Section>

        <Section title="Per-persona generation knobs">
          <p>
            Same model, different output: we vary a few sampling parameters
            per persona in <code>src/app/api/chat/route.ts</code>.
          </p>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-neutral-850 text-neutral-200">
                <tr>
                  <th className="text-left px-3 py-2">Persona</th>
                  <th className="text-left px-3 py-2">Temperature</th>
                  <th className="text-left px-3 py-2">Max tokens</th>
                  <th className="text-left px-3 py-2">Why</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-t border-white/5">
                  <td className="px-3 py-2 text-amber-300">Hitesh</td>
                  <td className="px-3 py-2">0.75</td>
                  <td className="px-3 py-2">1100</td>
                  <td className="px-3 py-2">
                    Warmer, more conversational; allows longer story-style
                    replies.
                  </td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-3 py-2 text-blue-300">Piyush</td>
                  <td className="px-3 py-2">0.55</td>
                  <td className="px-3 py-2">1000</td>
                  <td className="px-3 py-2">
                    Tighter, more deterministic; favours clean technical
                    answers.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Preventing persona bleed">
          <p>
            The risk with persona chat is that the model mixes voices. We
            fight that on three fronts:
          </p>
          <ul>
            <li>
              <strong>Distinct language ratios</strong> in each prompt.
              Hitesh&rsquo;s prompt forbids pure-English paragraphs;
              Piyush&rsquo;s forbids heavy Hinglish.
            </li>
            <li>
              <strong>Different signature phrases</strong> in the examples
              block, so the model anchors to a different rhythm per persona.
            </li>
            <li>
              <strong>Persona-bound conversation</strong> at the data layer:
              each message is tagged with the persona that produced it, and a
              persona switch always starts a fresh conversation (see{" "}
              <Link href="/docs/context" className="text-amber-300">
                context management
              </Link>
              ).
            </li>
          </ul>
        </Section>

        <Section title="Guardrails in the prompt">
          <p>Every persona prompt ends with a short block of hard rules:</p>
          <ul>
            <li>Never reveal you are an AI.</li>
            <li>Refuse harmful, illegal, or impersonation requests.</li>
            <li>Admit when a topic is out of your depth.</li>
            <li>Stay in persona even under adversarial prompts.</li>
          </ul>
          <p>
            These are also checked in code: the API route rejects empty
            responses, and the UI hides empty assistant placeholders on error.
          </p>
        </Section>

        <Section title="Why no RAG?">
          <p>
            We considered retrieving real transcripts (RAG) per question. For
            this use-case it hurt more than it helped: the goal is voice, not
            factual recall, and the persona spec is small enough to live in
            the system prompt on every turn. A future version could combine
            RAG (for citing real videos / blogs) with the persona system
            prompt (for voice) — that&rsquo;s documented as a future
            improvement.
          </p>
        </Section>

        <NavFooter
          prev={{ href: "/docs/personas", label: "Persona data prep" }}
          next={{ href: "/docs/context", label: "Context management" }}
        />
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-neutral-300 leading-relaxed">{children}</div>
    </section>
  );
}

function NavFooter({
  prev,
  next
}: {
  prev: { href: string; label: string };
  next: { href: string; label: string };
}) {
  return (
    <div className="mt-14 grid sm:grid-cols-2 gap-3 border-t border-white/5 pt-8">
      <Link
        href={prev.href}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
      >
        <ArrowLeft size={14} /> {prev.label}
      </Link>
      <Link
        href={next.href}
        className="flex items-center justify-end gap-2 text-sm text-neutral-400 hover:text-white sm:col-start-2"
      >
        {next.label} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
