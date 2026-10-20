"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PERSONAS } from "@/lib/ai/personas";
import type { PersonaId } from "@/lib/types";

// Voice gender isn't exposed by the Web Speech API, so we infer it from common
// voice names (Windows, macOS, Chrome and Android). Check "female" first.
const FEMALE =
  /female|heera|neerja|swara|kalpana|veena|zira|aria|jenny|sonia|libby|hazel|susan|samantha|karen|moira|tessa|fiona|serena|victoria|emma|ava|michelle|natasha/i;
const MALE = /\bmale\b|ravi|prabhat|madhur|hemant|rishi|david|mark|george|ryan|guy|daniel|alex|fred|thomas|james|eric|brian|william/i;

function genderOf(voice: SpeechSynthesisVoice) {
  if (FEMALE.test(voice.name)) return "female";
  if (MALE.test(voice.name)) return "male";
  return undefined;
}

function rank(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  if (lang === "en-in") return 0;
  if (lang === "en-gb") return 1;
  if (lang === "en-us") return 2;
  return 3;
}

/** Gives each persona a distinct English voice that matches its gender where possible. */
function assignVoices(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en")).sort((a, b) => rank(a) - rank(b));
  const used = new Set<SpeechSynthesisVoice>();
  const assigned = {} as Record<PersonaId, SpeechSynthesisVoice | undefined>;
  for (const persona of PERSONAS) {
    const pick =
      english.find((v) => !used.has(v) && genderOf(v) === persona.voice.gender) ??
      english.find((v) => !used.has(v) && genderOf(v) === undefined) ??
      english.find((v) => genderOf(v) === persona.voice.gender) ??
      english[0];
    if (pick) used.add(pick);
    assigned[persona.id] = pick;
  }
  return assigned;
}

/** Roughly how long the text takes to read aloud, for the muted/unsupported fallback. */
function readingMs(text: string) {
  return Math.max(1_500, (text.split(/\s+/).length / 2.6) * 1_000);
}

/** Speaks AI participant turns with the browser's built-in text-to-speech. */
export function useSpeech(enabled: boolean) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [blocked, setBlocked] = useState(false);
  // Holding the utterance avoids a Chrome bug where `onend` never fires after GC.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const settleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const voiceFor = useMemo(() => assignVoices(voices), [voices]);

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    settleRef.current?.();
  }, [supported]);

  /** Resolves when the persona has finished speaking (or was cancelled). */
  const speak = useCallback(
    (personaId: PersonaId, text: string) =>
      new Promise<void>((resolve) => {
        let done = false;
        let safety = 0;
        const settle = () => {
          if (done) return;
          done = true;
          window.clearTimeout(safety);
          settleRef.current = null;
          resolve();
        };
        settleRef.current = settle;

        if (!enabled || !supported) {
          safety = window.setTimeout(settle, readingMs(text));
          return;
        }

        const persona = PERSONAS.find((p) => p.id === personaId)!;
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voiceFor[personaId];
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }
        utterance.pitch = persona.voice.pitch;
        utterance.rate = persona.voice.rate;
        utterance.onend = () => {
          setBlocked(false);
          settle();
        };
        utterance.onerror = (event) => {
          // Browsers refuse speech until the user has interacted with the page.
          if (event.error === "not-allowed") setBlocked(true);
          settle();
        };
        utteranceRef.current = utterance;
        // Some engines occasionally never fire onend; don't let the GD stall.
        safety = window.setTimeout(settle, readingMs(text) * 2 + 4_000);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }),
    [enabled, supported, voiceFor],
  );

  return useMemo(() => ({ speak, cancel, supported, blocked }), [speak, cancel, supported, blocked]);
}
