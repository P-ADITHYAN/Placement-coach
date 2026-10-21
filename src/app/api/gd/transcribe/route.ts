import { TranscriptionError, transcribeAudio } from "@/lib/audio/transcribe";
import { getUserId } from "@/lib/supabase/server";
import { MAX_AUDIO_BYTES, MIN_AUDIO_BYTES, audioExtension } from "@/lib/validation/audio";

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!(await getUserId())) return fail(401, "Please sign in again.");

  let audio: FormDataEntryValue | null;
  try {
    audio = (await request.formData()).get("audio");
  } catch {
    return fail(400, "Expected a multipart form with an audio file.");
  }

  if (!(audio instanceof File)) return fail(400, "No audio file was sent.");

  const extension = audioExtension(audio.type);
  if (!extension) return fail(415, "This audio format is not supported.");
  if (audio.size < MIN_AUDIO_BYTES) return fail(422, "The recording was empty. Please try again.");
  if (audio.size > MAX_AUDIO_BYTES) return fail(413, "The recording is too long.");

  try {
    const result = await transcribeAudio(audio, `turn.${extension}`);
    return Response.json(result);
  } catch (error) {
    if (error instanceof TranscriptionError) {
      if (error.kind === "no-speech") {
        return fail(422, "We couldn't hear any speech. Check your microphone and try again.");
      }
      console.error("[transcribe]", error.message);
      return fail(
        error.kind === "config" ? 500 : 502,
        "Transcription is unavailable right now. Please try again.",
      );
    }
    throw error;
  }
}
