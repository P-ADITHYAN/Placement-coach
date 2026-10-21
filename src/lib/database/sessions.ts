import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CategoryScore, Difficulty, GdReport, GdSessionRecord, GdTurn, PersonaId, SpeechMetrics } from "@/lib/types";

// Reads use the student's own client, so Row Level Security guarantees they
// only ever see their own data. Writes use the admin client and are always
// scoped to a user id the caller has already verified.

interface SessionRow {
  id: string;
  topic_id: string;
  difficulty: Difficulty;
  duration_minutes: number;
  ended_at: string;
  overall_score: number | null;
}

interface TurnRow {
  turn_number: number;
  speaker_type: "student" | "ai";
  persona_id: string | null;
  transcript: string;
  duration_seconds: number;
}

interface ReportRow {
  session_id: string;
  overall_score: number;
  metrics: SpeechMetrics;
  category_scores: CategoryScore[];
  strengths: string[];
  priority_improvements: string[];
  improved_example: GdReport["improvedExample"];
  practice_task: string;
  rubric_version: string;
  limited_evidence: boolean;
  dropped_quotes: number;
}

export interface SessionSummaryRow {
  id: string;
  topicId: string;
  endedAt: string;
  durationMinutes: number;
  overallScore: number | null;
  categoryScores: { categoryId: string; score: number }[] | null;
}

function toTurn(row: TurnRow): GdTurn {
  return {
    turnNumber: row.turn_number,
    speakerType: row.speaker_type,
    personaId: (row.persona_id ?? undefined) as PersonaId | undefined,
    text: row.transcript,
    durationSeconds: Number(row.duration_seconds),
  };
}

function toReport(row: ReportRow, topicId: string): GdReport {
  return {
    sessionId: row.session_id,
    topicId,
    overallScore: row.overall_score,
    metrics: row.metrics,
    categories: row.category_scores,
    strengths: row.strengths,
    priorityImprovements: row.priority_improvements,
    improvedExample: row.improved_example,
    practiceTask: row.practice_task,
    rubricVersion: row.rubric_version,
    limitedEvidence: row.limited_evidence,
    droppedQuotes: row.dropped_quotes,
  };
}

/** Stores a finished GD and its transcript; returns the new session id. */
export async function saveCompletedSession(
  userId: string,
  session: Omit<GdSessionRecord, "id">,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gd_sessions")
    .insert({
      user_id: userId,
      topic_id: session.topicId,
      difficulty: session.difficulty,
      duration_minutes: session.durationMinutes,
      ended_at: session.endedAt,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Saving session failed: ${error.message}`);

  if (session.turns.length > 0) {
    const { error: turnsError } = await admin.from("gd_turns").insert(
      session.turns.map((t) => ({
        session_id: data.id,
        turn_number: t.turnNumber,
        speaker_type: t.speakerType,
        persona_id: t.personaId ?? null,
        transcript: t.text,
        duration_seconds: t.durationSeconds,
      })),
    );
    if (turnsError) {
      await admin.from("gd_sessions").delete().eq("id", data.id);
      throw new Error(`Saving transcript failed: ${turnsError.message}`);
    }
  }
  return data.id as string;
}

/** A session and its transcript, if it belongs to the signed-in student. */
export async function getSession(sessionId: string): Promise<GdSessionRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gd_sessions")
    .select("id, topic_id, difficulty, duration_minutes, ended_at, gd_turns (turn_number, speaker_type, persona_id, transcript, duration_seconds)")
    .eq("id", sessionId)
    .order("turn_number", { referencedTable: "gd_turns" })
    .maybeSingle();
  if (error || !data) return null;
  const row = data as SessionRow & { gd_turns: TurnRow[] };
  return {
    id: row.id,
    topicId: row.topic_id,
    difficulty: row.difficulty,
    durationMinutes: row.duration_minutes,
    endedAt: row.ended_at,
    turns: row.gd_turns.map(toTurn),
  };
}

/** The saved report for a session of the signed-in student, if one exists. */
export async function getReport(sessionId: string, topicId: string): Promise<GdReport | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("gd_reports").select("*").eq("session_id", sessionId).maybeSingle();
  return data ? toReport(data as ReportRow, topicId) : null;
}

export async function saveReport(userId: string, report: GdReport) {
  const admin = createAdminClient();
  const { error } = await admin.from("gd_reports").upsert({
    session_id: report.sessionId,
    user_id: userId,
    overall_score: report.overallScore,
    metrics: report.metrics,
    category_scores: report.categories,
    strengths: report.strengths,
    priority_improvements: report.priorityImprovements,
    improved_example: report.improvedExample,
    practice_task: report.practiceTask,
    rubric_version: report.rubricVersion,
    limited_evidence: report.limitedEvidence,
    dropped_quotes: report.droppedQuotes,
  });
  if (error) throw new Error(`Saving report failed: ${error.message}`);
  await admin
    .from("gd_sessions")
    .update({ overall_score: report.overallScore })
    .eq("id", report.sessionId)
    .eq("user_id", userId);
}

/** The signed-in student's sessions, newest first, with category scores for charts. */
export async function listSessions(limit = 50): Promise<SessionSummaryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gd_sessions")
    .select("id, topic_id, ended_at, duration_minutes, overall_score, gd_reports (category_scores)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  type ReportEmbed = { category_scores: CategoryScore[] };
  type Row = Omit<SessionRow, "difficulty"> & { gd_reports: ReportEmbed | ReportEmbed[] | null };
  return (data as unknown as Row[]).map((row) => {
    // One-to-one embeds come back as an object; normalise in case of an array.
    const report = Array.isArray(row.gd_reports) ? row.gd_reports[0] : row.gd_reports;
    return {
      id: row.id,
      topicId: row.topic_id,
      endedAt: row.ended_at,
      durationMinutes: row.duration_minutes,
      overallScore: row.overall_score,
      categoryScores: report?.category_scores.map((c) => ({ categoryId: c.categoryId, score: c.score })) ?? null,
    };
  });
}

/** Topic ids the signed-in student has already practised. */
export async function listPractisedTopicIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("gd_sessions").select("topic_id").limit(1000);
  if (error || !data) return [];
  return [...new Set(data.map((row) => row.topic_id as string))];
}

export async function getDisplayName(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("display_name").maybeSingle();
  return (data?.display_name as string | undefined) ?? "";
}
