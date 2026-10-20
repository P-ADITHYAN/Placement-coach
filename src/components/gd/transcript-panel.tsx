"use client";

import { useEffect, useRef } from "react";
import { getPersona } from "@/lib/ai/personas";
import type { GdTurn } from "@/lib/types";

export function TranscriptPanel({ turns }: { turns: GdTurn[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns.length]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Live transcript</h2>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {turns.length === 0 && (
          <p className="text-sm text-muted">The discussion transcript will appear here.</p>
        )}
        {turns.map((turn) => {
          const isStudent = turn.speakerType === "student";
          const persona = turn.personaId ? getPersona(turn.personaId) : undefined;
          return (
            <div key={turn.turnNumber} className={isStudent ? "pl-6" : "pr-6"}>
              <p className={`text-xs font-semibold ${isStudent ? "text-accent" : "text-muted"}`}>
                {isStudent ? "You" : `${persona?.name} · ${persona?.role}`}
              </p>
              <p
                className={`mt-1 rounded-lg px-3 py-2 text-sm ${
                  isStudent ? "bg-accent-soft" : "bg-background"
                }`}
              >
                {turn.text}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
