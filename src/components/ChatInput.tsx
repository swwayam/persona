"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  busy?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  busy,
  placeholder
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-white/5 bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-neutral-850 focus-within:border-amber-500/40 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder || "Type a message…  (Enter to send, Shift+Enter for newline)"}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-[0.95rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none max-h-[220px] scroll-area"
          />
          {busy && onStop ? (
            <button
              onClick={onStop}
              className="m-2 shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              aria-label="Stop generating"
              title="Stop"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim()}
              className="m-2 shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-neutral-900 hover:bg-amber-400 disabled:bg-neutral-700 disabled:text-neutral-500 transition-colors"
              aria-label="Send message"
              title="Send"
            >
              <Send size={15} />
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-neutral-500 text-center">
          AI personas are simulations. Verify important info independently.
        </p>
      </div>
    </div>
  );
}
