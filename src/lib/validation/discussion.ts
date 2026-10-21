import { isPersonaId } from "@/lib/ai/personas";
import { DIFFICULTIES } from "@/lib/topics";
import type { Difficulty, GdTurn } from "@/lib/types";

// Validation for discussion data sent by the browser (untrusted input).
export const MAX_TURNS = 80;
const MAX_TURN_CHARS = 1_500;
const MAX_TURN_SECONDS_STORED = 120;

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some((d) => d.value === value);
}

/** Parses an array of turns; returns null if anything is malformed. */
export function parseTurns(value: unknown): GdTurn[] | null {
  if (!Array.isArray(value) || value.length > MAX_TURNS) return null;
  const turns: GdTurn[] = [];
  for (const [index, raw] of value.entries()) {
    const t = raw as Record<string, unknown> | null;
    if (typeof t?.text !== "string" || t.text.length > MAX_TURN_CHARS) return null;
    const duration = typeof t.durationSeconds === "number" && Number.isFinite(t.durationSeconds) ? t.durationSeconds : 0;
    const base = {
      turnNumber: index + 1,
      text: t.text,
      durationSeconds: Math.min(Math.max(0, duration), MAX_TURN_SECONDS_STORED),
    };
    if (t.speakerType === "student") turns.push({ ...base, speakerType: "student" });
    else if (t.speakerType === "ai" && isPersonaId(t.personaId))
      turns.push({ ...base, speakerType: "ai", personaId: t.personaId });
    else return null;
  }
  return turns;
}
