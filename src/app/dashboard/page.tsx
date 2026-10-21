import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HistoryTable, weakestCategory } from "@/components/dashboard/history-table";
import { ScoreTrendChart, type TrendPoint } from "@/components/dashboard/score-trend-chart";
import { Card, StatTile } from "@/components/ui/card";
import { PERSONAS } from "@/lib/ai/personas";
import { getDisplayName, listSessions } from "@/lib/database/sessions";
import { getTopic } from "@/lib/mock/topics";
import { RUBRIC, getRubricCategory } from "@/lib/scoring/rubric";

export const metadata: Metadata = { title: "Dashboard" };

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<p className="text-muted">Loading your progress…</p>}>
        <Progress />
      </Suspense>

      <Card>
        <h2 className="font-semibold">Your AI discussion partners</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p) => (
            <div key={p.id} className="rounded-lg border border-line p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-9 place-items-center rounded-full text-sm font-semibold text-white ${p.accent.avatar}`}
                >
                  {p.name[0]}
                </span>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{p.behavior}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

async function Progress() {
  const [name, sessions] = await Promise.all([getDisplayName(), listSessions()]);
  // Oldest first, assessed sessions only, for trends.
  const assessed = sessions.filter((s) => s.overallScore !== null && s.categoryScores).reverse();
  const first = assessed[0];
  const latest = assessed.at(-1);
  const focus = getRubricCategory(weakestCategory(latest?.categoryScores ?? null)?.categoryId ?? "");
  const best = assessed.reduce((max, s) => Math.max(max, s.overallScore ?? 0), 0);

  const trend: TrendPoint[] = assessed.slice(-12).map((s) => ({
    label: shortDate.format(new Date(s.endedAt)),
    topic: getTopic(s.topicId)?.title ?? "Retired topic",
    score: s.overallScore!,
  }));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name ? `Welcome back, ${name}` : "Welcome back"}</h1>
          <p className="mt-1 text-muted">Practise a group discussion with four AI participants.</p>
        </div>
        <Link
          href="/gd/setup"
          className="rounded-lg bg-accent px-5 py-2.5 text-center font-medium text-white hover:opacity-90"
        >
          Start a new GD
        </Link>
      </div>

      {latest && first && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Latest score" value={`${latest.overallScore}/100`} hint={`Best so far: ${best}`} />
          <StatTile
            label="Progress"
            value={assessed.length > 1 ? signed(latest.overallScore! - first.overallScore!) : "—"}
            hint={
              assessed.length > 1 ? `Since your first of ${assessed.length} assessed GDs` : "Complete another GD to see progress"
            }
          />
          <StatTile label="Focus area" value={focus?.name ?? "—"} hint="Weakest category in your latest GD" />
        </div>
      )}

      {assessed.length >= 2 && first && latest && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-semibold">Overall score over time</h2>
            <p className="mb-3 text-sm text-muted">Scores on different topics aren&apos;t perfectly comparable.</p>
            <ScoreTrendChart points={trend} />
          </Card>
          <Card>
            <h2 className="font-semibold">By category</h2>
            <p className="mb-3 text-sm text-muted">Latest score and change since your first GD.</p>
            <ul className="space-y-2 text-sm">
              {RUBRIC.map((c) => {
                const now = latest.categoryScores!.find((s) => s.categoryId === c.id)?.score;
                const then = first.categoryScores!.find((s) => s.categoryId === c.id)?.score;
                if (now === undefined) return null;
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span>{c.name}</span>
                    <span className="tabular-nums">
                      <span className="font-semibold">{now}</span>
                      {then !== undefined && <span className="ml-2 text-xs text-muted">{signed(now - then)}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}

      <Card>
        <h2 className="mb-4 font-semibold">Practice history</h2>
        <HistoryTable sessions={sessions} />
      </Card>
    </>
  );
}

function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}
