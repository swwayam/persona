"use client";

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span
        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}
