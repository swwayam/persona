import type { PersonaId } from "@/lib/personas";

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  persona: PersonaId;
  createdAt: number;
}

export interface Conversation {
  id: string;
  persona: PersonaId;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function deriveTitle(content: string, max = 48): string {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}
