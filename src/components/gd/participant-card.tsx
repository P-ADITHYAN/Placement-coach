import type { Persona } from "@/lib/types";

export function ParticipantCard({ persona, speaking }: { persona: Persona; speaking: boolean }) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-4 transition ${
        speaking ? `ring-2 ${persona.accent.ring}` : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold text-white ${persona.accent.avatar} ${
            speaking ? "animate-pulse" : ""
          }`}
        >
          {persona.name[0]}
        </span>
        <div className="min-w-0">
          <p className="font-medium">{persona.name}</p>
          <p className="truncate text-xs text-muted">{persona.role}</p>
        </div>
      </div>
      <p className="mt-3 h-4 text-xs font-medium text-accent" aria-live="polite">
        {speaking ? "Speaking…" : ""}
      </p>
    </div>
  );
}
