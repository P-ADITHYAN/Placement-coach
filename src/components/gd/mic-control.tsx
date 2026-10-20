import { MAX_TURN_SECONDS } from "@/lib/validation/audio";

export type MicState = "idle" | "starting" | "recording" | "processing";

export function MicControl({
  state,
  elapsed,
  disabled,
  onStart,
  onSubmit,
  onCancel,
}: {
  state: MicState;
  elapsed: number;
  disabled: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (state === "processing" || state === "starting") {
    return (
      <div className="flex items-center gap-3 text-sm text-muted" role="status">
        <span className="size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        {state === "starting" ? "Waiting for microphone access…" : "Transcribing your turn…"}
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-rose-600" role="status">
          <span className="size-2.5 animate-pulse rounded-full bg-rose-600" />
          Recording {elapsed}s / {MAX_TURN_SECONDS}s
        </span>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Submit turn
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line px-4 py-2 text-sm hover:border-muted"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      </svg>
      Speak
    </button>
  );
}
