import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryCard } from "@/components/reports/category-card";
import { Card, StatTile } from "@/components/ui/card";
import { MOCK_REPORT } from "@/lib/mock/report";
import { getTopic } from "@/lib/mock/topics";

export const metadata: Metadata = { title: "Your report" };

export default function ReportPage(props: PageProps<"/gd/report">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading your report…</p>}>
      <Report searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Report({ searchParams }: Pick<PageProps<"/gd/report">, "searchParams">) {
  const { topic: topicParam } = await searchParams;
  // Mock: the same sample report is shown for every session until scoring is built.
  const report = MOCK_REPORT;
  const topic =
    getTopic(Array.isArray(topicParam) ? topicParam[0] : topicParam) ?? getTopic(report.topicId);
  const { metrics } = report;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">GD report · sample data</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{topic?.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/gd/session?topic=${topic?.id}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Retry this topic
          </Link>
          <Link href="/gd/setup" className="rounded-lg border border-line px-4 py-2 text-sm hover:border-muted">
            New topic
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Overall score</p>
          <p className="mt-2 text-5xl font-semibold tabular-nums">
            {report.overallScore}
            <span className="text-xl text-muted">/100</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            Weighted from six rubric categories · rubric {report.rubricVersion}
          </p>
        </Card>
        <Card className="md:col-span-2">
          <h2 className="font-semibold">Top priorities</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
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

      <section>
        <h2 className="font-semibold">Measured from your transcript</h2>
        <p className="mb-3 text-sm text-muted">
          Counted directly from what you said. Transcription errors can affect these numbers.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatTile label="Words spoken" value={String(metrics.wordsSpoken)} />
          <StatTile label="Speaking rate" value={`${metrics.speakingRateWpm} wpm`} />
          <StatTile label="Filler words" value={String(metrics.fillerWords)} />
          <StatTile label="Your turns" value={String(metrics.turnCount)} />
          <StatTile label="Avg. turn" value={`${metrics.averageTurnSeconds}s`} />
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Rubric assessment</h2>
        <p className="mb-3 text-sm text-muted">
          Judged against a fixed rubric. Each score cites the exact words it is based on.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {report.categories.map((c) => (
            <CategoryCard key={c.categoryId} category={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
