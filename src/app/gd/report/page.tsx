import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReportView } from "@/components/reports/report-view";
import { MOCK_REPORT } from "@/lib/mock/report";
import { getTopic } from "@/lib/mock/topics";

export const metadata: Metadata = { title: "Sample report" };

export default function SampleReportPage(props: PageProps<"/gd/report">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <Report searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Report({ searchParams }: Pick<PageProps<"/gd/report">, "searchParams">) {
  const { sample } = await searchParams;
  const topic = getTopic(MOCK_REPORT.topicId);
  if (sample && topic) return <ReportView report={MOCK_REPORT} topic={topic} sample />;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
      <p className="font-medium">No report selected</p>
      <p className="mt-1 text-sm text-muted">Open a report from your practice history on the dashboard.</p>
      <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white">
        Go to dashboard
      </Link>
    </div>
  );
}
