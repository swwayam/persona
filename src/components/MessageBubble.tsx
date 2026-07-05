"use client";

import { CopyButton } from "./CopyButton";
import { MarkdownView } from "./MarkdownView";
import type { ChatMessage } from "@/lib/types";
import { getPersona } from "@/lib/personas";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const persona = !isUser ? getPersona(message.persona) : null;

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm bg-amber-500/15 border border-amber-500/30 px-4 py-3 text-neutral-100">
            <MarkdownView content={message.content} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="shrink-0">
        <div
          className="w-9 h-9 rounded-full bg-cover bg-center border border-white/10"
          style={{
            backgroundImage: persona?.avatar
              ? `url(${persona.avatar})`
              : undefined
          }}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-white">
            {persona?.name ?? "Assistant"}
          </span>
          <span className="text-xs text-neutral-500">
            {persona?.tagline}
          </span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-neutral-850 border border-white/5 px-4 py-3 text-neutral-200">
          <MarkdownView content={message.content} />
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 align-middle ml-0.5 bg-amber-400 animate-pulse" />
          )}
        </div>
        {!isStreaming && message.content && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
