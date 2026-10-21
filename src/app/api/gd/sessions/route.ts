import { saveCompletedSession } from "@/lib/database/sessions";
import { getTopic, DURATIONS } from "@/lib/mock/topics";
import { getUserId } from "@/lib/supabase/server";
import { isDifficulty, parseTurns } from "@/lib/validation/discussion";

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Saves a finished GD for the signed-in student. */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return fail(401, "Please sign in again.");

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const turns = parseTurns(body?.turns);
  if (
    !body ||
    !turns ||
    typeof body.topicId !== "string" ||
    !getTopic(body.topicId) ||
    !isDifficulty(body.difficulty) ||
    !DURATIONS.includes(body.durationMinutes as (typeof DURATIONS)[number])
  ) {
    return fail(400, "Invalid session data.");
  }

  try {
    const id = await saveCompletedSession(userId, {
      topicId: body.topicId,
      difficulty: body.difficulty,
      durationMinutes: body.durationMinutes as number,
      endedAt: new Date().toISOString(),
      turns,
    });
    return Response.json({ id });
  } catch (error) {
    console.error("[sessions]", error instanceof Error ? error.message : error);
    return fail(502, "Your discussion couldn't be saved. Please try again.");
  }
}
