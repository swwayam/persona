"use client";

import { Plus, Trash2, MessageSquare, Github, BookOpen } from "lucide-react";
import { PersonaAvatar } from "./PersonaSwitcher";
import type { Conversation } from "@/lib/types";
import type { PersonaId } from "@/lib/personas";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  activePersona: PersonaId;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  activePersona
}: SidebarProps) {
  // Group by persona, then by recency.
  const grouped: Record<PersonaId, Conversation[]> = {
    hitesh: [],
    piyush: []
  };
  for (const c of conversations) {
    grouped[c.persona].push(c);
  }
  for (const id of Object.keys(grouped) as PersonaId[]) {
    grouped[id].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/5 bg-neutral-900/50">
      <div className="p-3 border-b border-white/5">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area p-2 space-y-4">
        {(["hitesh", "piyush"] as PersonaId[]).map((pid) => (
          <div key={pid}>
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wider text-neutral-500">
              <PersonaAvatar id={pid} size={18} />
              <span>{pid === "hitesh" ? "Hitesh" : "Piyush"}</span>
              <span className="ml-auto text-neutral-600">
                {grouped[pid].length}
              </span>
            </div>
            {grouped[pid].length === 0 ? (
              <p className="px-3 py-2 text-xs text-neutral-600">
                No chats yet.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {grouped[pid].map((c) => {
                  const isActive = c.id === activeId && c.persona === activePersona;
                  return (
                    <li key={c.id} className="group relative">
                      <button
                        onClick={() => onSelect(c.id)}
                        className={[
                          "w-full text-left flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        ].join(" ")}
                      >
                        <MessageSquare
                          size={13}
                          className={
                            isActive ? "text-amber-300" : "text-neutral-500"
                          }
                        />
                        <span className="truncate flex-1">{c.title}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete conversation"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 space-y-1">
        <a
          href="/docs"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <BookOpen size={14} />
          <span>Documentation</span>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <Github size={14} />
          <span>Source</span>
        </a>
      </div>
    </aside>
  );
}
