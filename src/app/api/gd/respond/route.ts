import { generateAiTurn } from "@/lib/ai/orchestrator";
import { isPersonaId } from "@/lib/ai/personas";
import { DIFFICULTIES, getTopic } from "@/lib/mock/topics";
import type { RespondReason, RespondRequest } from "@/lib/types";

const MAX_TURNS = 80;
const MAX_TURN_CHARS = 1_500;
const REASONS: RespondReason[] = ["student-turn", "silence", "closing"];

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Validates the untrusted request body; returns null if it is malformed. */
function parseRequest(body: unknown): RespondRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.topicId !== "string") return null;
  if (!DIFFICULTIES.some((d) => d.value === b.difficulty)) return null;
  if (typeof b.remainingSeconds !== "number" || !Number.isFinite(b.remainingSeconds)) return null;
  if (!REASONS.includes(b.reason as RespondReason)) return null;
  if (!Array.isArray(b.turns) || b.turns.length > MAX_TURNS) return null;

  const turns: RespondRequest["turns"] = [];
  for (const t of b.turns as Record<string, unknown>[]) {
    if (typeof t?.text !== "string" || t.text.length > MAX_TURN_CHARS) return null;
    if (t.speakerType === "student") turns.push({ speakerType: "student", text: t.text });
    else if (t.speakerType === "ai" && isPersonaId(t.personaId))
      turns.push({ speakerType: "ai", personaId: t.personaId, text: t.text });
    else return null;
  }

  return {
    topicId: b.topicId,
    difficulty: b.difficulty as RespondRequest["difficulty"],
    remainingSeconds: b.remainingSeconds,
    reason: b.reason as RespondReason,
    turns,
  };
}

export async function POST(request: Request) {
  const parsed = parseRequest(await request.json().catch(() => null));
  if (!parsed) return fail(400, "Invalid discussion state.");

  const topic = getTopic(parsed.topicId);
  if (!topic) return fail(404, "Unknown topic.");

  try {
    return Response.json(await generateAiTurn(topic, parsed));
  } catch (error) {
    console.error("[respond]", error instanceof Error ? error.message : error);
    return fail(502, "The AI participants couldn't respond. You can keep speaking.");
  }
}
