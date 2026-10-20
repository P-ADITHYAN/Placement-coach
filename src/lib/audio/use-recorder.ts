"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export type RecorderErrorKind = "unsupported" | "permission-denied" | "no-microphone" | "unknown";

export class RecorderError extends Error {
  constructor(readonly kind: RecorderErrorKind) {
    super(kind);
  }
}

export interface Recording {
  audio: Blob;
  /** Loudest RMS level seen while recording (0-1); near zero means silence. */
  peakLevel: number;
}

/** Below this peak level a recording is treated as silent and not uploaded. */
export const SILENCE_LEVEL = 0.01;

const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
const LEVEL_SAMPLE_MS = 100;

function pickMimeType() {
  return PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * Records one student turn at a time with the browser MediaRecorder API.
 * The microphone is opened per turn and released afterwards, so the browser's
 * "mic in use" indicator is only on while the student is actually speaking.
 */
export function useRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const meterRef = useRef<{ context: AudioContext; interval: number } | null>(null);
  const peakRef = useRef(0);

  const release = useCallback(() => {
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    chunksRef.current = [];
    if (meterRef.current) {
      window.clearInterval(meterRef.current.interval);
      void meterRef.current.context.close();
      meterRef.current = null;
    }
  }, []);

  useEffect(() => release, [release]);

  // Tracks the loudest level during the turn so silent recordings can be caught
  // before they are uploaded (Whisper tends to invent text for silence).
  const startMeter = useCallback((stream: MediaStream) => {
    peakRef.current = 0;
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const interval = window.setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const s of samples) sum += s * s;
        peakRef.current = Math.max(peakRef.current, Math.sqrt(sum / samples.length));
      }, LEVEL_SAMPLE_MS);
      meterRef.current = { context, interval };
    } catch {
      // Metering is a convenience; without it every recording is treated as non-silent.
      peakRef.current = 1;
    }
  }, []);

  const start = useCallback(async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new RecorderError("unsupported");
    }
    release();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") throw new RecorderError("permission-denied");
      if (name === "NotFoundError" || name === "OverconstrainedError") throw new RecorderError("no-microphone");
      throw new RecorderError("unknown");
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    recorderRef.current = recorder;
    startMeter(stream);
  }, [release, startMeter]);

  /** Stops recording and resolves with the captured audio (null if nothing was recording). */
  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      release();
      return Promise.resolve(null);
    }
    return new Promise<Recording | null>((resolve) => {
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType });
        const peakLevel = peakRef.current;
        release();
        resolve({ audio, peakLevel });
      };
      recorder.stop();
    });
  }, [release]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    release();
  }, [release]);

  return useMemo(() => ({ start, stop, cancel }), [start, stop, cancel]);
}
