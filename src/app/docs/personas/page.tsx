import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = { title: "Persona data preparation — Docs" };

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-200">
      <article className="max-w-3xl mx-auto px-5 py-10 sm:py-16 prose-invert">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft size={14} />
          Back to docs
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Persona data preparation
        </h1>
        <p className="mt-3 text-neutral-400">
          How we distilled hundreds of hours of public content into a tight,
          usable persona spec — without training a model.
        </p>

        <Section title="1. What we collected">
          <p>
            Both personas have a large, public footprint, so we worked with
            that and added nothing we couldn&rsquo;t cite:
          </p>
          <ul>
            <li>
              <strong>Hitesh Choudhary</strong> — long-form YouTube videos
              (full-stack web dev playlists, JavaScript deep dives, career /
              motivation talks),{" "}
              <a href="https://hitesh.ai" target="_blank" rel="noreferrer">
                hitesh.ai
              </a>{" "}
              blog posts and bio, podcast appearances, public X / Twitter
              posts.
            </li>
            <li>
              <strong>Piyush Garg</strong> — system design and full-stack
              YouTube series,{" "}
              <a href="https://www.piyushgarg.dev" target="_blank" rel="noreferrer">
                piyushgarg.dev
              </a>{" "}
              writing and bio, project walkthroughs, public LinkedIn / X posts.
            </li>
          </ul>
          <p>
            We did <em>not</em> scrape at scale, run any fine-tuning, or store
            raw transcripts. The persona is fully encoded in the system prompt
            in <code>src/lib/personas.ts</code>.
          </p>
        </Section>

        <Section title="2. Distillation pass">
          <p>For each persona we asked the same four questions of the source material:</p>
          <ol>
            <li>
              <strong>What is the default language and code-switch pattern?</strong>{" "}
              Hitesh defaults to heavy Roman-Hindi Hinglish with English tech
              terms; Piyush is mostly English with light Hindi sprinkles.
            </li>
            <li>
              <strong>What are the recurring phrases, hooks, and analogies?</strong>{" "}
              Hitesh: &ldquo;dekho&rdquo;, &ldquo;bhai&rdquo;, &ldquo;yrr&rdquo;, &ldquo;chai&rdquo;,
              &ldquo;tutorial hell&rdquo;, hostel / mess / chai analogies. Piyush: &ldquo;let&rsquo;s see&rdquo;,
              &ldquo;trade-off&rdquo;, &ldquo;in production&rdquo;, system-diagram framing.
            </li>
            <li>
              <strong>How do they teach?</strong> Hitesh leads with a story
              or analogy, then code, then a &ldquo;next step&rdquo;. Piyush
              frames the problem, reasons about trade-offs, then shows
              production-grade code.
            </li>
            <li>
              <strong>What is in / out of domain?</strong> We list strong and
              weak topics so the model can honestly say &ldquo;yeh meri strong
              area nahi hai&rdquo;.
            </li>
          </ol>
        </Section>

        <Section title="3. Encoding as a system prompt">
          <p>
            Each distilled profile becomes a single system prompt with the same
            six sections, so the LLM sees a stable structure:
          </p>
          <ol>
            <li><strong>WHO YOU ARE</strong> — identity, role, brand voice.</li>
            <li><strong>LANGUAGE &amp; TONE</strong> — Hinglish ratio, signature phrases.</li>
            <li><strong>PERSONALITY</strong> — values, anti-patterns, what they never do.</li>
            <li><strong>TEACHING APPROACH</strong> — how they structure answers.</li>
            <li><strong>DOMAIN DEPTH</strong> — strong / weak areas, so the model can admit limits.</li>
            <li><strong>RESPONSE SHAPE &amp; HARD RULES</strong> — length, code, formatting, never-break rules.</li>
          </ol>
        </Section>

        <Section title="4. What we deliberately did not do">
          <ul>
            <li>
              <strong>No fine-tuning.</strong> The project ships zero trained
              weights; the persona lives 100% in the prompt so it can be
              audited, version-controlled, and swapped in seconds.
            </li>
            <li>
              <strong>No fabricated quotes.</strong> The signature phrases in
              the prompts are the kind of phrases both educators actually
              use in their public content. We avoid putting fake &ldquo;as I
              said in my 2022 video&rdquo; references in the system prompt.
            </li>
            <li>
              <strong>No impersonation beyond chat.</strong> The model is
              instructed to never reveal it is an AI, and to refuse to write
              harmful, illegal, or impersonating content (e.g. tweets that
              look like they were really posted by the persona).
            </li>
          </ul>
        </Section>

        <Section title="5. Iteration loop">
          <p>
            The system prompts went through ~6 rounds. Each round: pick 8–10
            diverse test questions, run them against the model, score each
            reply on a 1–5 rubric for <em>voice</em>, <em>accuracy</em>, and{" "}
            <em>teaching clarity</em>, and edit the prompt to fix the worst
            failure mode. The full rubric and test set live in the repo under{" "}
            <code>/evaluation</code>.
          </p>
        </Section>

        <NavFooter
          prev={{ href: "/docs", label: "Docs index" }}
          next={{ href: "/docs/prompts", label: "Prompt engineering" }}
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
