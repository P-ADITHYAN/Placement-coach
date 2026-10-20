// Shared limits for recorded student turns (checked in the browser and on the server).
export const MAX_TURN_SECONDS = 30;
export const MIN_AUDIO_BYTES = 1_000;
// ~30s of browser-recorded Opus/AAC is well under 1 MB; this leaves headroom.
export const MAX_AUDIO_BYTES = 2_000_000;

const AUDIO_EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

/** "audio/webm;codecs=opus" -> "audio/webm" */
export function baseMimeType(type: string) {
  return type.split(";")[0].trim().toLowerCase();
}

/** File extension for a supported audio type, or undefined if unsupported. */
export function audioExtension(type: string): string | undefined {
  return AUDIO_EXTENSIONS[baseMimeType(type)];
}
