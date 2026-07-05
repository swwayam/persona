"use client";

import { listPersonas, getPersona, type PersonaId } from "@/lib/personas";

interface PersonaSwitcherProps {
  active: PersonaId;
  onChange: (id: PersonaId) => void;
}

export function PersonaSwitcher({ active, onChange }: PersonaSwitcherProps) {
  const personas = listPersonas();
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-850 border border-white/5">
      {personas.map((p) => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              isActive
                ? p.id === "hitesh"
                  ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            ].join(" ")}
            aria-pressed={isActive}
          >
            <span
              className={[
                "w-2 h-2 rounded-full",
                p.id === "hitesh" ? "bg-amber-400" : "bg-blue-400"
              ].join(" ")}
            />
            {p.shortName}
          </button>
        );
      })}
    </div>
  );
}

interface PersonaAvatarProps {
  id: PersonaId;
  size?: number;
}

export function PersonaAvatar({ id, size = 36 }: PersonaAvatarProps) {
  const p = getPersona(id);
  return (
    <div
      className="rounded-full bg-cover bg-center border border-white/10 shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: p.avatar ? `url(${p.avatar})` : undefined
      }}
      aria-label={p.name}
    />
  );
}
