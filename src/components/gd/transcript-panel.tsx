"use client";

import { useEffect, useRef } from "react";
import { getPersona } from "@/lib/ai/personas";
import type { GdTurn } from "@/lib/types";

// Within this distance of the bottom, new turns keep the view pinned to the latest.
const STICK_TO_BOTTOM_PX = 80;

export function TranscriptPanel({ turns }: { turns: GdTurn[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const mountedRef = useRef(false);

  // Scroll inside the panel (not the page) to the newest turn, unless the
  // student has scrolled up to re-read something. Waits a frame so the new
  // turn is laid out; jumps instantly on first render, glides afterwards.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !pinnedRef.current) return;
    const behavior: ScrollBehavior = mountedRef.current ? "smooth" : "auto";
    mountedRef.current = true;
    const frame = requestAnimationFrame(() => list.scrollTo({ top: list.scrollHeight, behavior }));
    return () => cancelAnimationFrame(frame);
  }, [turns.length]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Live transcript</h2>
      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX;
        }}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
        aria-live="polite"
      >
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
      </div>
    </div>
  );
}
