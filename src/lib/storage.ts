"use client";

import type { Conversation } from "./types";
import type { PersonaId } from "./personas";

const KEY = "persona-chat:v1";

interface PersistShape {
  conversations: Conversation[];
  activeId: string | null;
  activePersona: PersonaId;
}

function safeWindow(): Window | null {
  if (typeof window === "undefined") return null;
  return window;
}

export function loadState(): PersistShape | null {
  const w = safeWindow();
  if (!w) return null;
  try {
    const raw = w.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistShape;
    if (!parsed || !Array.isArray(parsed.conversations)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistShape): void {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled — fail silently.
  }
}

export function clearState(): void {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
