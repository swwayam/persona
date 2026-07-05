import Link from "next/link";
import { ArrowLeft, FileText, Database, MessageSquare, Wrench } from "lucide-react";

export const metadata = {
  title: "Docs — Persona Chat",
  description: "How the Hitesh & Piyush persona chat is built."
};

const SECTIONS = [
  {
    href: "/docs/personas",
    icon: <FileText size={18} />,
    title: "Persona data preparation",
    desc: "How we collected, cleaned, and distilled the public content that shapes each persona."
  },
  {
    href: "/docs/prompts",
    icon: <MessageSquare size={18} />,
    title: "Prompt engineering strategy",
    desc: "The system-prompt structure, Hinglish/English tuning, and the rules we enforce."
  },
  {
    href: "/docs/context",
    icon: <Database size={18} />,
    title: "Context management",
    desc: "How we keep multi-turn conversations coherent without blowing the token budget."
  },
  {
    href: "/docs/samples",
    icon: <Wrench size={18} />,
    title: "Sample conversations",
    desc: "Real transcripts that show both personas in action, side by side."
  }
];

export default function DocsIndex() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-200">
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft size={14} />
          Back to chat
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Documentation
        </h1>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          Everything about how this project captures the voice of{" "}
          <span className="text-amber-300">Hitesh Choudhary</span> and{" "}
          <span className="text-blue-300">Piyush Garg</span>, how it talks to
          an LLM, and how the conversation stays coherent as it grows.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block h-full rounded-xl border border-white/10 bg-neutral-850/60 hover:border-amber-500/30 hover:bg-neutral-800 transition-colors p-4"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  {s.icon}
                  <span className="text-sm font-semibold text-white">
                    {s.title}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-400">{s.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
