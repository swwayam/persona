"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { TypingDots } from "./TypingDots";
import { PersonaSwitcher, PersonaAvatar } from "./PersonaSwitcher";
import { parseSSE } from "@/lib/stream";
import {
  loadState,
  saveState
} from "@/lib/storage";
import { getPersona, type PersonaId } from "@/lib/personas";
import { newId, deriveTitle, type ChatMessage, type Conversation } from "@/lib/types";
import type { ChatMessage as ApiChatMessage } from "@/lib/llm";

export function ChatWindow() {
  const [hydrated, setHydrated] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaId>("hitesh");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const s = loadState();
    if (s) {
      setConversations(s.conversations);
      setActiveId(s.activeId);
      setActivePersona(s.activePersona);
    }
    setHydrated(true);
  }, []);

  // Persist on changes (after hydration to avoid wiping storage).
  useEffect(() => {
    if (!hydrated) return;
    saveState({ conversations, activeId, activePersona });
  }, [hydrated, conversations, activeId, activePersona]);

  // Get the active conversation (or null if none).
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  // Auto-scroll on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages.length, busy]);

  const startNewConversation = useCallback(
    (persona: PersonaId) => {
      const conv: Conversation = {
        id: newId(),
        persona,
        title: "New chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setActivePersona(persona);
      setError(null);
      setSidebarOpen(false);
    },
    []
  );

  const selectConversation = useCallback((id: string) => {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    setActiveId(id);
    setActivePersona(c.persona);
    setError(null);
    setSidebarOpen(false);
  }, [conversations]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const switchPersona = useCallback(
    (id: PersonaId) => {
      if (id === activePersona) return;
      // Switching persona starts a fresh chat with that persona.
      startNewConversation(id);
    },
    [activePersona, startNewConversation]
  );

  const updateActive = useCallback(
    (updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? updater(c) : c))
      );
    },
    [activeId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (busy) return;
      setError(null);

      let convId = activeId;
      // Auto-create a conversation if there is none active.
      if (!convId) {
        const conv: Conversation = {
          id: newId(),
          persona: activePersona,
          title: deriveTitle(content),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        convId = conv.id;
        setConversations((prev) => [conv, ...prev]);
        setActiveId(convId);
      }

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content,
        persona: activePersona,
        createdAt: Date.now()
      };

      const assistantMsg: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: "",
        persona: activePersona,
        createdAt: Date.now()
      };

      // Append user + assistant placeholder to the (possibly new) conversation.
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title:
                  c.messages.length === 0 ? deriveTitle(content) : c.title,
                messages: [...c.messages, userMsg, assistantMsg],
                updatedAt: Date.now()
              }
            : c
        )
      );

      setBusy(true);
      abortRef.current = new AbortController();

      try {
        const historyForApi: ApiChatMessage[] = [...(activeConversation?.messages ?? []), userMsg]
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona: activePersona, messages: historyForApi }),
          signal: abortRef.current.signal
        });

        if (!res.ok) {
          let msg = `Request failed: ${res.status}`;
          try {
            const j = (await res.json()) as { error?: string };
            if (j?.error) msg = j.error;
          } catch {
            // ignore
          }
          throw new Error(msg);
        }
        if (!res.body) throw new Error("No response body.");

        let acc = "";
        for await (const ev of parseSSE(res)) {
          if (ev.event === "delta") {
            const data = ev.data as { content?: string };
            if (typeof data?.content === "string") {
              acc += data.content;
              const snapshot = acc;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMsg.id ? { ...m, content: snapshot } : m
                        ),
                        updatedAt: Date.now()
                      }
                    : c
                )
              );
            }
          } else if (ev.event === "error") {
            const data = ev.data as { message?: string };
            throw new Error(data?.message || "Stream error");
          } else if (ev.event === "done") {
            // finished
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // user stopped — keep what we have
        } else {
          setError((err as Error).message);
          // Remove empty placeholder on error
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.filter((m) =>
                      m.id === assistantMsg.id ? m.content.trim().length > 0 : true
                    )
                  }
                : c
            )
          );
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [activeId, activePersona, activeConversation, busy]
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retryLast = useCallback(() => {
    if (!activeConversation) return;
    const lastUser = [...activeConversation.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUser) {
      // Remove any trailing empty assistant placeholder
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: c.messages.slice(0, -1) }
            : c
        )
      );
      sendMessage(lastUser.content);
    }
  }, [activeConversation, sendMessage]);

  const persona = getPersona(activePersona);
  const messages = activeConversation?.messages ?? [];
  const showEmpty = !activeConversation || messages.length === 0;

  return (
    <div className="h-screen flex bg-neutral-900 text-neutral-200">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        activePersona={activePersona}
        onSelect={selectConversation}
        onNew={() => startNewConversation(activePersona)}
        onDelete={deleteConversation}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-40 lg:hidden transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <div className="h-full w-72">
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            activePersona={activePersona}
            onSelect={selectConversation}
            onNew={() => startNewConversation(activePersona)}
            onDelete={deleteConversation}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          personaId={activePersona}
          onPersonaChange={switchPersona}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
          sidebarOpen={sidebarOpen}
        />

        {error && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 flex items-center gap-2 text-sm text-red-200">
            <AlertTriangle size={15} className="shrink-0" />
            <span className="flex-1 truncate">{error}</span>
            <button
              onClick={retryLast}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-100"
            >
              <RefreshCw size={12} />
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="text-red-200/70 hover:text-red-100 px-1"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-area"
        >
          {showEmpty ? (
            <EmptyState
              persona={activePersona}
              onSuggest={(q) => sendMessage(q)}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 group">
              {messages.map((m, idx) => {
                const isLastAssistant =
                  m.role === "assistant" && idx === messages.length - 1;
                return (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isStreaming={busy && isLastAssistant}
                  />
                );
              })}
              {busy && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3">
                  <PersonaAvatar id={activePersona} />
                  <div className="rounded-2xl rounded-tl-sm bg-neutral-850 border border-white/5 px-4 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          onStop={stopGenerating}
          busy={busy}
          placeholder={
            activePersona === "hitesh"
              ? "Type a question… (Enter to send)"
              : "Ask a system design, code, or career question…"
          }
        />
      </main>
    </div>
  );
}

interface HeaderProps {
  personaId: PersonaId;
  onPersonaChange: (id: PersonaId) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

function Header({
  personaId,
  onPersonaChange,
  onToggleSidebar,
  sidebarOpen
}: HeaderProps) {
  const persona = getPersona(personaId);
  return (
    <header className="border-b border-white/5 bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <PersonaAvatar id={personaId} size={28} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {persona.name}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">
              {persona.tagline}
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <PersonaSwitcher active={personaId} onChange={onPersonaChange} />
      </div>
    </header>
  );
}
