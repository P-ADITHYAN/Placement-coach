"use client";

import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm text-muted">Your progress has not been lost. Please try again.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
