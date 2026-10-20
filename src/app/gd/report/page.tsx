import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReportView } from "@/components/reports/report-view";
import { SessionReport } from "@/components/reports/session-report";
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

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function Report({ searchParams }: Pick<PageProps<"/gd/report">, "searchParams">) {
  const params = await searchParams;
  const sessionId = first(params.session);
  if (sessionId) return <SessionReport sessionId={sessionId} />;

  // Sample report for the dashboard's demo history (until history is stored).
  const topic = getTopic(MOCK_REPORT.topicId);
  if (first(params.sample) && topic) return <ReportView report={MOCK_REPORT} topic={topic} sample />;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
      <p className="font-medium">No report selected</p>
      <p className="mt-1 text-sm text-muted">Finish a group discussion to see your assessment here.</p>
      <Link href="/gd/setup" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white">
        Start a GD
      </Link>
    </div>
  );
}
