import type { Metadata } from "next";
import Link from "next/link";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Card, StatTile } from "@/components/ui/card";
import { PERSONAS } from "@/lib/ai/personas";
import { MOCK_HISTORY } from "@/lib/mock/report";
import { getRubricCategory } from "@/lib/scoring/rubric";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const latest = MOCK_HISTORY[0];
  const first = MOCK_HISTORY[MOCK_HISTORY.length - 1];
  const change = latest && first ? latest.overallScore - first.overallScore : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted">Practise a group discussion with four AI participants.</p>
        </div>
        <Link
          href="/gd/setup"
          className="rounded-lg bg-accent px-5 py-2.5 text-center font-medium text-white hover:opacity-90"
        >
          Start a new GD
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Latest score" value={latest ? `${latest.overallScore}/100` : "—"} />
        <StatTile
          label="Progress"
          value={change >= 0 ? `+${change}` : `${change}`}
          hint={`Since your first of ${MOCK_HISTORY.length} sessions`}
        />
        <StatTile
          label="Focus area"
          value={latest ? (getRubricCategory(latest.weakestCategoryId)?.name ?? "—") : "—"}
          hint="Weakest category in your latest GD"
        />
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Practice history</h2>
        <HistoryTable sessions={MOCK_HISTORY} />
      </Card>

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
