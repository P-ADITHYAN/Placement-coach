import Link from "next/link";
import type { SessionSummaryRow } from "@/lib/database/sessions";
import { getTopic } from "@/lib/mock/topics";
import { getRubricCategory } from "@/lib/scoring/rubric";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function weakestCategory(scores: SessionSummaryRow["categoryScores"]) {
  if (!scores?.length) return undefined;
  return [...scores].sort((a, b) => a.score - b.score)[0];
}

export function HistoryTable({ sessions }: { sessions: SessionSummaryRow[] }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-8 text-center">
        <p className="font-medium">No practice sessions yet</p>
        <p className="mt-1 text-sm text-muted">Your completed GDs and reports will appear here.</p>
        <Link
          href="/gd/setup"
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Start your first GD
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-medium">Topic</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Length</th>
            <th className="py-2 pr-4 font-medium">Score</th>
            <th className="py-2 pr-4 font-medium">Weakest area</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-line last:border-0">
              <td className="py-3 pr-4">{getTopic(s.topicId)?.title ?? "Retired topic"}</td>
              <td className="py-3 pr-4 whitespace-nowrap text-muted">{dateFormat.format(new Date(s.endedAt))}</td>
              <td className="py-3 pr-4 text-muted">{s.durationMinutes} min</td>
              <td className="py-3 pr-4 font-semibold tabular-nums">
                {s.overallScore ?? <span className="font-normal text-muted">Not assessed</span>}
              </td>
              <td className="py-3 pr-4 text-muted">
                {getRubricCategory(weakestCategory(s.categoryScores)?.categoryId ?? "")?.name ?? "—"}
              </td>
              <td className="py-3 text-right">
                <Link href={`/gd/report/${s.id}`} className="text-accent hover:underline">
                  {s.overallScore === null ? "Get report" : "View"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
