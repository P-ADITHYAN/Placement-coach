import { getTopic } from "@/lib/mock/topics";
import { assessSession } from "@/lib/scoring/assess";
import { isDifficulty, parseTurns } from "@/lib/validation/discussion";

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const turns = parseTurns(body?.turns);
  if (!body || typeof body.sessionId !== "string" || !isDifficulty(body.difficulty) || !turns) {
    return fail(400, "Invalid session data.");
  }

  const topic = typeof body.topicId === "string" ? getTopic(body.topicId) : undefined;
  if (!topic) return fail(404, "Unknown topic.");

  try {
    const report = await assessSession({
      sessionId: body.sessionId.slice(0, 64),
      topic,
      difficulty: body.difficulty,
      turns,
    });
    return Response.json(report);
  } catch (error) {
    console.error("[assess]", error instanceof Error ? error.message : error);
    return fail(502, "The assessment couldn't be generated right now. Your transcript is saved — please try again.");
  }
}
