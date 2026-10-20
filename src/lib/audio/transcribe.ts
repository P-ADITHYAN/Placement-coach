import "server-only";

// Speech-to-text via Groq's OpenAI-compatible Whisper endpoint (free tier).
// Kept behind this one function so the provider can be swapped later.
const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = process.env.GROQ_STT_MODEL ?? "whisper-large-v3-turbo";

// Whisper drops filler words unless its prompt (treated as preceding speech)
// contains them; the report counts fillers, so the prompt models that style.
const STYLE_PROMPT = "Umm, so, like, I think, uh, basically we should, you know, consider both sides.";

// Phrases Whisper is known to invent on silent or near-silent audio.
const KNOWN_HALLUCINATIONS = ["thank you", "thanks for watching", "thank you for watching", "bye", "you"];

function normalise(text: string) {
  return text.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
}

/** True when the "transcript" is really an echo of the prompt or a stock hallucination. */
function isLikelyHallucination(text: string) {
  const t = normalise(text);
  return !t || KNOWN_HALLUCINATIONS.includes(t) || normalise(STYLE_PROMPT).includes(t);
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    readonly kind: "config" | "provider" | "no-speech",
  ) {
    super(message);
  }
}

interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface Transcription {
  text: string;
  /** Spoken length measured by the model, if available. */
  durationSeconds: number | undefined;
}

export async function transcribeAudio(audio: Blob, filename: string): Promise<Transcription> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new TranscriptionError("GROQ_API_KEY is not set", "config");

  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", MODEL);
  form.append("language", "en");
  form.append("response_format", "verbose_json");
  form.append("temperature", "0");
  form.append("prompt", STYLE_PROMPT);

  let response: Response;
  try {
    response = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new TranscriptionError(`Transcription request failed: ${String(error)}`, "provider");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new TranscriptionError(`Groq returned ${response.status}: ${detail.slice(0, 300)}`, "provider");
  }

  const data = (await response.json()) as {
    text?: string;
    duration?: number;
    segments?: WhisperSegment[];
  };

  // Groq reports no_speech_prob as 0 even for silence, so it can't be used.
  // A reliable tell is a segment that extends past the end of the audio itself.
  const audioLength = data.duration ?? Infinity;
  const spoken = (data.segments ?? []).filter((s) => s.end <= audioLength + 1);
  const text = (data.segments ? spoken.map((s) => s.text).join("") : (data.text ?? "")).trim();

  if (isLikelyHallucination(text)) throw new TranscriptionError("No speech detected", "no-speech");

  const lastEnd = spoken.at(-1)?.end;
  return { text, durationSeconds: lastEnd === undefined ? data.duration : Math.min(lastEnd, audioLength) };
}
