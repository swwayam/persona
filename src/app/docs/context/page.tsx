import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = { title: "Context management — Docs" };

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
          Context management
        </h1>
        <p className="mt-3 text-neutral-400">
          How a 10-turn conversation stays coherent, and what we&rsquo;d do
          differently for 100-turn sessions.
        </p>

        <Section title="The constraint">
          <p>
            Every LLM call has a fixed context window. Naively sending the
            whole conversation forever means: (1) the bill grows linearly with
            the chat, (2) latency grows linearly with the chat, and (3) at
            some point the oldest messages get truncated and the model
            forgets the original question.
          </p>
          <p>
            For an educator-persona chat, the right behaviour is:
            <em> keep the recent turns, drop the rest, and let the persona
            prompt carry the long-term voice rules.</em>
          </p>
        </Section>

        <Section title="What we do today: sliding window">
          <p>
            In <code>src/lib/context.ts</code> the <code>buildContextMessages</code>{" "}
            helper takes the full history and returns:
          </p>
          <ol>
            <li>
              The persona <strong>system prompt</strong> (always).
            </li>
            <li>
              The <strong>last N</strong> user/assistant turns, where N is
              controlled by <code>LLM_CONTEXT_WINDOW</code> (default 20
              messages ≈ 10 turns).
            </li>
          </ol>
          <p>
            We slice from the end of the array, never the start, so the
            freshest context always wins. This is a deliberate trade-off:
            we accept that the model can&rsquo;t remember turn 1 once you
            cross 10 turns, in exchange for stable cost and latency.
          </p>
        </Section>

        <Section title="What the window size means in tokens">
          <p>
            A typical Hinglish assistant turn is ~120–250 tokens; a typical
            user question is ~15–60 tokens. With 20 messages we&rsquo;re
            looking at ~1.5k–3k tokens of recent history, which is well
            inside every modern model&rsquo;s window and leaves plenty of
            room for the ~1.2k-token persona system prompt and the new
            response.
          </p>
        </Section>

        <Section title="Why no summarization (yet)">
          <p>
            A rolling summary would let us keep long-term context past the
            window, which sounds great. In practice, for this use-case:
          </p>
          <ul>
            <li>
              It doubles LLM cost (one extra call to summarize before every
              reply).
            </li>
            <li>
              It adds 200–600ms of latency to every reply.
            </li>
            <li>
              It needs careful prompt design to avoid &ldquo;summary
              poisoning&rdquo; where the summary subtly drifts the persona.
            </li>
            <li>
              The persona prompt already encodes long-term voice rules, so
              most loss-of-recall failures are recoverable with a follow-up
              question.
            </li>
          </ul>
        </Section>

        <Section title="Future improvement: rolling summary + retrieval">
          <p>The planned v2 pipeline is:</p>
          <ol>
            <li>
              <strong>Persona system prompt</strong> (always, never trimmed).
            </li>
            <li>
              <strong>Rolling summary</strong> of turns older than the
              window, regenerated whenever the window slides.
            </li>
            <li>
              <strong>Last N raw turns</strong> for verbatim recall.
            </li>
            <li>
              <strong>Optional RAG</strong> for citing real videos / blog
              posts when the user asks &ldquo;show me where you explained
              closures&rdquo;.
            </li>
          </ol>
          <p>
            The interface in <code>src/lib/context.ts</code> is shaped to
            make that swap a one-file change.
          </p>
        </Section>

        <Section title="Other small-but-important rules">
          <ul>
            <li>
              <strong>Persona-scoped conversations.</strong> Switching from
              Hitesh to Piyush starts a new conversation, so we never mix
              personas inside one history buffer.
            </li>
            <li>
              <strong>Empty-message filter.</strong> The API rejects the
              request if the last message isn&rsquo;t a non-empty user turn.
            </li>
            <li>
              <strong>Streaming + abort.</strong> The server streams via
              SSE, the client parses it incrementally, and a Stop button
              aborts the fetch. The conversation state stays consistent
              because we only commit deltas to the in-memory model.
            </li>
            <li>
              <strong>Storage.</strong> Conversations are persisted to
              <code> localStorage</code> under one namespaced key. Wiping
              storage wipes history; nothing is sent to a backend.
            </li>
          </ul>
        </Section>

        <NavFooter
          prev={{ href: "/docs/prompts", label: "Prompt engineering" }}
          next={{ href: "/docs/samples", label: "Sample conversations" }}
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
