import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PendingReport } from "@/components/reports/pending-report";
import { ReportView } from "@/components/reports/report-view";
import { getReport, getSession } from "@/lib/database/sessions";
import { getTopic } from "@/lib/topics";

export const metadata: Metadata = { title: "Your report" };

export default function SessionReportPage(props: PageProps<"/gd/report/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading your report…</p>}>
      <Report params={props.params} />
    </Suspense>
  );
}

async function Report({ params }: Pick<PageProps<"/gd/report/[id]">, "params">) {
  const { id } = await params;
  // Row Level Security returns nothing for another student's session.
  const session = await getSession(id);
  const topic = session ? getTopic(session.topicId) : undefined;

  if (!session || !topic) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium">Report not found</p>
        <p className="mt-1 text-sm text-muted">This report doesn&apos;t exist or belongs to another account.</p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const report = await getReport(session.id, session.topicId);
  if (!report) return <PendingReport sessionId={session.id} />;
  return <ReportView report={report} topic={topic} session={session} />;
}
