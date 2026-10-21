"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Shown for a saved session that has no report yet: asks the server to assess
 * it, then re-renders the page, which now finds the stored report.
 */
export function PendingReport({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/gd/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "The assessment couldn't be generated. Please try again.");
      }
      router.refresh();
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Network problem — check your connection and try again."
          : e instanceof Error
            ? e.message
            : "Something went wrong.",
      );
    }
  }, [router, sessionId]);

  useEffect(() => {
    const id = window.setTimeout(() => void assess(), 0);
    return () => window.clearTimeout(id);
  }, [assess]);

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium">The assessment didn&apos;t finish</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
        <button
          type="button"
          onClick={() => void assess()}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center" role="status">
      <span className="mx-auto block size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      <p className="mt-4 font-medium">Analysing your discussion…</p>
      <p className="mt-1 text-sm text-muted">
        Counting your speech metrics and applying the rubric. This takes a few seconds.
      </p>
    </div>
  );
}
