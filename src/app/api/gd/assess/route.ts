import { getReport, getSession, saveReport } from "@/lib/database/sessions";
import { getTopic } from "@/lib/topics";
import { assessSession } from "@/lib/scoring/assess";
import { getUserId } from "@/lib/supabase/server";

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

/**
 * Assesses a saved session. The transcript is read from the database (not from
 * the browser), and an existing report is returned instead of re-assessing.
 */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return fail(401, "Please sign in again.");

  const body = (await request.json().catch(() => null)) as { sessionId?: unknown } | null;
  if (typeof body?.sessionId !== "string") return fail(400, "Missing session.");

  const session = await getSession(body.sessionId);
  const topic = session ? getTopic(session.topicId) : undefined;
  if (!session || !topic) return fail(404, "That discussion wasn't found.");

  const existing = await getReport(session.id, session.topicId);
  if (existing) return Response.json(existing);

  try {
    const report = await assessSession({
      sessionId: session.id,
      topic,
      difficulty: session.difficulty,
      turns: session.turns,
    });
    await saveReport(userId, report);
    return Response.json(report);
  } catch (error) {
    console.error("[assess]", error instanceof Error ? error.message : error);
    return fail(502, "The assessment couldn't be generated right now. Your discussion is saved — please try again.");
  }
}
