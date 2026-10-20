import { audioExtension } from "@/lib/validation/audio";

export interface TranscribeResult {
  text: string;
  durationSeconds?: number;
}

/** Uploads one recorded turn to the server and returns the transcript, or throws a user-facing message. */
export async function requestTranscription(audio: Blob): Promise<TranscribeResult> {
  const form = new FormData();
  form.append("audio", audio, `turn.${audioExtension(audio.type) ?? "webm"}`);

  let response: Response;
  try {
    response = await fetch("/api/gd/transcribe", { method: "POST", body: form });
  } catch {
    throw new Error("Network problem — check your connection and try again.");
  }

  const body = (await response.json().catch(() => ({}))) as Partial<TranscribeResult> & { error?: string };
  if (!response.ok || !body.text) {
    throw new Error(body.error ?? "Something went wrong while transcribing. Please try again.");
  }
  return { text: body.text, durationSeconds: body.durationSeconds };
}
