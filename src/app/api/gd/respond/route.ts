import { generateAiTurn } from "@/lib/ai/orchestrator";
import { getTopic } from "@/lib/mock/topics";
import { getUserId } from "@/lib/supabase/server";
import type { RespondReason, RespondRequest } from "@/lib/types";
import { isDifficulty, parseTurns } from "@/lib/validation/discussion";

const REASONS: RespondReason[] = ["student-turn", "silence", "closing"];

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Validates the untrusted request body; returns null if it is malformed. */
function parseRequest(body: unknown): RespondRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.topicId !== "string" || !isDifficulty(b.difficulty)) return null;
  if (typeof b.remainingSeconds !== "number" || !Number.isFinite(b.remainingSeconds)) return null;
  if (!REASONS.includes(b.reason as RespondReason)) return null;
  const turns = parseTurns(b.turns);
  if (!turns) return null;

  return {
    topicId: b.topicId,
    difficulty: b.difficulty,
    remainingSeconds: b.remainingSeconds,
    reason: b.reason as RespondReason,
    turns: turns.map(({ speakerType, personaId, text }) => ({ speakerType, personaId, text })),
  };
}

export async function POST(request: Request) {
  if (!(await getUserId())) return fail(401, "Please sign in again.");

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
