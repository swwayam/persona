"use client";

import { Sparkles, Code2, Briefcase, Heart, Cpu } from "lucide-react";
import type { PersonaId } from "@/lib/personas";

interface EmptyStateProps {
  persona: PersonaId;
  onSuggest: (q: string) => void;
}

const ICON_BY_TOPIC = [Sparkles, Code2, Briefcase, Cpu, Heart];

export function EmptyState({ persona, onSuggest }: EmptyStateProps) {
  const suggestionsByPersona: Record<PersonaId, string[]> = {
    hitesh: [
      "Bhai, React seekhna hai. Roadmap do please ☕",
      "JavaScript ka closure simple example se samjhao",
      "Meri job chali gayi, ab kya karu?",
      "Web dev vs App dev — beginner ke liye kya best hai?",
      "TypeScript seekhun ya pehle JS strong karu?"
    ],
    piyush: [
      "How would you design a URL shortener like bit.ly?",
      "Next.js App Router vs Pages Router — production mein kya use karein?",
      "Should I learn tRPC or stick with REST?",
      "How do I deploy a Node.js app with zero downtime?",
      "Best folder structure for a large Next.js project?"
    ]
  };

  const list = suggestionsByPersona[persona];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="max-w-2xl w-full space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            {persona === "hitesh" ? "Haan ji, kya haal hai? ☕" : "Hey, what are we building?"}
          </h1>
          <p className="mt-2 text-neutral-400 text-sm sm:text-base">
            {persona === "hitesh"
              ? "Batao kya seekhna hai aaj. Web dev, JavaScript, career, ya bas kuch samajhna hai — I'm here."
              : "Drop a question, a system design problem, or a code review. I'll reason through it with you."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {list.map((q, i) => {
            const Icon = ICON_BY_TOPIC[i % ICON_BY_TOPIC.length];
            return (
              <button
                key={q}
                onClick={() => onSuggest(q)}
                className="text-left rounded-xl border border-white/10 bg-neutral-850/60 hover:bg-neutral-800 hover:border-amber-500/30 transition-all p-3.5 group"
              >
                <div className="flex items-start gap-2.5">
                  <Icon
                    size={16}
                    className="mt-0.5 text-amber-400 group-hover:text-amber-300"
                  />
                  <span className="text-sm text-neutral-200 group-hover:text-white">
                    {q}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-neutral-500">
          Tip: switch personas any time with the toggle in the top-right.
        </p>
      </div>
    </div>
  );
}
