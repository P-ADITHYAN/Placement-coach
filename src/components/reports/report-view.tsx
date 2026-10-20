import Link from "next/link";
import { CategoryCard } from "@/components/reports/category-card";
import { Card, StatTile } from "@/components/ui/card";
import { getPersona } from "@/lib/ai/personas";
import type { GdReport, GdSessionRecord, GdTopic } from "@/lib/types";

export function ReportView({
  report,
  topic,
  session,
  sample = false,
}: {
  report: GdReport;
  topic: GdTopic;
  /** The discussion the report is based on; absent for the sample report. */
  session?: GdSessionRecord;
  sample?: boolean;
}) {
  const { metrics } = report;
  const retryParams = new URLSearchParams({ topic: topic.id });
  if (session) {
    retryParams.set("difficulty", session.difficulty);
    retryParams.set("duration", String(session.durationMinutes));
  }
  const fillers = Object.entries(metrics.fillerBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            GD report{sample ? " · sample data" : session ? ` · ${session.difficulty} · ${session.durationMinutes} min` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{topic.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/gd/session?${retryParams}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Retry this topic
          </Link>
          <Link href="/gd/setup" className="rounded-lg border border-line px-4 py-2 text-sm hover:border-muted">
            New topic
          </Link>
        </div>
      </div>

      {report.limitedEvidence && (
        <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {metrics.turnCount === 0
            ? "You didn't make any contributions in this GD, so there was nothing to assess. Try speaking early next time."
            : "You spoke only briefly, so these scores rest on limited evidence. Make more contributions for a more reliable assessment."}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Overall score</p>
          <p className="mt-2 text-5xl font-semibold tabular-nums">
            {report.overallScore}
            <span className="text-xl text-muted">/100</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            Weighted from six rubric categories · rubric {report.rubricVersion}. A practice aid, not an employer score.
          </p>
        </Card>
        <Card className="md:col-span-2">
          {report.strengths.length > 0 && (
            <>
              <h2 className="font-semibold">What went well</h2>
              <ul className="mt-2 mb-4 space-y-1 text-sm">
                {report.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h2 className="font-semibold">Top priorities</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {report.priorityImprovements.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <div className="mt-4 rounded-lg bg-accent-soft p-3 text-sm">
            <span className="font-medium">Practice task: </span>
            {report.practiceTask}
          </div>
        </Card>
      </div>

      {report.improvedExample && (
        <Card>
          <h2 className="font-semibold">Say it better</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">What you said</p>
              <blockquote className="mt-1 border-l-2 border-rose-400 pl-3 text-sm italic">
                “{report.improvedExample.original}”
              </blockquote>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">A stronger version</p>
              <blockquote className="mt-1 border-l-2 border-emerald-500 pl-3 text-sm">
                “{report.improvedExample.improved}”
              </blockquote>
            </div>
          </div>
          {report.improvedExample.why && <p className="mt-3 text-sm text-muted">{report.improvedExample.why}</p>}
        </Card>
      )}

      <section>
        <h2 className="font-semibold">Measured from your transcript</h2>
        <p className="mb-3 text-sm text-muted">
          Counted directly by software from what you said. Transcription errors can affect these numbers.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Words spoken" value={String(metrics.wordsSpoken)} />
          <StatTile label="Speaking rate" value={`${metrics.speakingRateWpm} wpm`} hint="Typical: 120–160" />
          <StatTile label="Filler words" value={String(metrics.fillerWords)} />
          <StatTile label="Your turns" value={String(metrics.turnCount)} />
          <StatTile label="Avg. turn" value={`${metrics.averageTurnSeconds}s`} />
          <StatTile label="Your share" value={`${metrics.talkSharePercent}%`} hint="Of all words in the GD" />
        </div>
        {(fillers.length > 0 || metrics.repeatedPhrases.length > 0) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {fillers.length > 0 && (
              <Card>
                <p className="text-sm font-medium">Filler words used</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fillers.map(([filler, n]) => (
                    <span key={filler} className="rounded-full bg-background px-3 py-1 text-sm">
                      “{filler}” × {n}
                    </span>
                  ))}
                </div>
              </Card>
            )}
            {metrics.repeatedPhrases.length > 0 && (
              <Card>
                <p className="text-sm font-medium">Phrases you repeated across turns</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {metrics.repeatedPhrases.slice(0, 5).map((p) => (
                    <li key={p}>“{p}”</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </section>

      {metrics.turnCount > 0 && (
        <section>
          <h2 className="font-semibold">Rubric assessment</h2>
          <p className="mb-3 text-sm text-muted">
            Judged by AI against a fixed rubric. Every quote shown was checked against your transcript.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {report.categories.map((c) => (
              <CategoryCard key={c.categoryId} category={c} />
            ))}
          </div>
        </section>
      )}

      {session && session.turns.length > 0 && (
        <details className="rounded-xl border border-line bg-surface p-5">
          <summary className="cursor-pointer font-semibold">Full transcript ({session.turns.length} turns)</summary>
          <ol className="mt-4 space-y-3">
            {session.turns.map((t) => (
              <li key={t.turnNumber} className="text-sm">
                <span className={`font-semibold ${t.speakerType === "student" ? "text-accent" : "text-muted"}`}>
                  {t.speakerType === "student" ? "You" : getPersona(t.personaId!).name}:
                </span>{" "}
                {t.text}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
