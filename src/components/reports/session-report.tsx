"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ReportView } from "@/components/reports/report-view";
import { getTopic } from "@/lib/mock/topics";
import { loadReport, loadSession, saveReport } from "@/lib/session/local-session";
import type { GdReport, GdSessionRecord } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "assessing"; session: GdSessionRecord }
  | { status: "error"; session: GdSessionRecord; message: string }
  | { status: "ready"; session: GdSessionRecord; report: GdReport };

async function requestAssessment(session: GdSessionRecord): Promise<GdReport> {
  const response = await fetch("/api/gd/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      topicId: session.topicId,
      difficulty: session.difficulty,
      turns: session.turns,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as Partial<GdReport> & { error?: string };
  if (!response.ok || typeof body.overallScore !== "number") {
    throw new Error(body.error ?? "The assessment couldn't be generated. Please try again.");
  }
  return body as GdReport;
}

/** Loads a finished GD from this browser tab and generates (or reuses) its report. */
export function SessionReport({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const assess = useCallback(async (session: GdSessionRecord) => {
    setState({ status: "assessing", session });
    try {
      const report = await requestAssessment(session);
      saveReport(report);
      setState({ status: "ready", session, report });
    } catch (error) {
      setState({
        status: "error",
        session,
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    const session = loadSession(sessionId);
    // A cached report avoids paying for a second assessment on refresh.
    const cached = session ? loadReport(sessionId) : null;
    const id = window.setTimeout(() => {
      if (!session) setState({ status: "missing" });
      else if (cached) setState({ status: "ready", session, report: cached });
      else void assess(session);
    }, 0);
    return () => window.clearTimeout(id);
  }, [sessionId, assess]);

  if (state.status === "loading") return <p className="text-muted">Loading your report…</p>;

  if (state.status === "missing") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium">This report isn&apos;t available</p>
        <p className="mt-1 text-sm text-muted">
          Reports are kept in this browser tab until accounts are added. Start a new GD to get a fresh report.
        </p>
        <Link href="/gd/setup" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white">
          Start a GD
        </Link>
      </div>
    );
  }

  if (state.status === "assessing") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center" role="status">
        <span className="mx-auto block size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="mt-4 font-medium">Analysing your discussion…</p>
        <p className="mt-1 text-sm text-muted">Counting your speech metrics and applying the rubric. This takes a few seconds.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium">The assessment didn&apos;t finish</p>
        <p className="mt-1 text-sm text-muted">{state.message}</p>
        <button
          type="button"
          onClick={() => void assess(state.session)}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const topic = getTopic(state.session.topicId);
  if (!topic) return <p className="text-muted">This topic is no longer available.</p>;
  return <ReportView report={state.report} topic={topic} session={state.session} />;
}
