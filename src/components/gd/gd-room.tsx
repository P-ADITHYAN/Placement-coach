"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PERSONAS } from "@/lib/ai/personas";
import { MOCK_AI_LINES, MOCK_SPEAKER_ORDER, MOCK_STUDENT_LINES } from "@/lib/mock/discussion";
import type { Difficulty, GdTopic, GdTurn, PersonaId } from "@/lib/types";
import { MAX_TURN_SECONDS, MicControl, type MicState } from "./mic-control";
import { ParticipantCard } from "./participant-card";
import { TranscriptPanel } from "./transcript-panel";

const PREP_SECONDS = 20;
const AI_OPENS_AFTER_SECONDS = 15;
const CLOSING_WINDOW_SECONDS = 30;
// Mock latencies standing in for transcription and AI generation + speech.
const MOCK_TRANSCRIBE_MS = 900;
const MOCK_AI_SPEAK_MS = 1800;

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GdRoom({
  topic,
  difficulty,
  durationMinutes,
}: {
  topic: GdTopic;
  difficulty: Difficulty;
  durationMinutes: number;
}) {
  // A single clock drives preparation, the discussion timer and recording time.
  // In the real build the server owns the session timer (blueprint phase 6).
  const [clock, setClock] = useState(0);
  const [endedEarly, setEndedEarly] = useState(false);
  const [mic, setMic] = useState<MicState>("idle");
  const [recordingStartedAt, setRecordingStartedAt] = useState(0);
  const [speaking, setSpeaking] = useState<PersonaId | null>(null);
  const [turns, setTurns] = useState<GdTurn[]>([]);

  const discussionSeconds = Math.max(0, clock - PREP_SECONDS);
  const remaining = Math.max(0, durationMinutes * 60 - discussionSeconds);
  const finished = endedEarly || remaining === 0;
  const phase = finished ? "finished" : clock < PREP_SECONDS ? "preparing" : "active";
  const elapsed = clock - recordingStartedAt;

  const timeouts = useRef<number[]>([]);
  const finishedRef = useRef(false);
  const recordingToken = useRef(0);
  const counters = useRef({ ai: 0, student: 0 });

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setClock((c) => c + 1), 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    finishedRef.current = finished;
    if (finished) recordingToken.current++;
  }, [finished]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  }, []);

  const addTurn = useCallback((turn: Omit<GdTurn, "turnNumber">) => {
    setTurns((prev) => [...prev, { ...turn, turnNumber: prev.length + 1 }]);
  }, []);

  const aiRespond = useCallback(() => {
    const n = counters.current.ai++;
    const personaId = MOCK_SPEAKER_ORDER[n % MOCK_SPEAKER_ORDER.length];
    const lines = MOCK_AI_LINES[personaId];
    const text = lines[Math.floor(n / MOCK_SPEAKER_ORDER.length) % lines.length];
    setSpeaking(personaId);
    schedule(() => {
      setSpeaking(null);
      if (finishedRef.current) return;
      addTurn({
        speakerType: "ai",
        personaId,
        text,
        durationSeconds: Math.round(text.split(/\s+/).length / 2.5),
      });
    }, MOCK_AI_SPEAK_MS);
  }, [addTurn, schedule]);

  const submitTurn = useCallback(
    (durationSeconds: number) => {
      recordingToken.current++;
      setMic("processing");
      schedule(() => {
        setMic("idle");
        if (finishedRef.current) return;
        const text = MOCK_STUDENT_LINES[counters.current.student++ % MOCK_STUDENT_LINES.length];
        addTurn({ speakerType: "student", text, durationSeconds });
        aiRespond();
      }, MOCK_TRANSCRIBE_MS);
    },
    [addTurn, aiRespond, schedule],
  );

  function startRecording() {
    const token = ++recordingToken.current;
    setRecordingStartedAt(clock);
    setMic("recording");
    schedule(() => {
      if (recordingToken.current === token) submitTurn(MAX_TURN_SECONDS);
    }, MAX_TURN_SECONDS * 1000);
  }

  function cancelRecording() {
    recordingToken.current++;
    setMic("idle");
  }

  // If the student hasn't opened the discussion, an AI participant opens it.
  useEffect(() => {
    if (phase !== "active" || turns.length > 0 || mic !== "idle" || speaking) return;
    const id = window.setTimeout(aiRespond, AI_OPENS_AFTER_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [phase, turns.length, mic, speaking, aiRespond]);

  const studentTurns = turns.filter((t) => t.speakerType === "student").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {topic.category} · {difficulty} · {durationMinutes} min
          </p>
          <h1 className="mt-1 text-lg font-semibold">{topic.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted">
              {phase === "preparing" ? "Preparation" : phase === "finished" ? "Finished" : "Time left"}
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {phase === "preparing" ? formatClock(PREP_SECONDS - clock) : formatClock(remaining)}
            </p>
          </div>
          {phase === "active" && (
            <button
              type="button"
              onClick={() => setEndedEarly(true)}
              className="rounded-lg border border-line px-3 py-2 text-sm hover:border-muted"
            >
              End discussion
            </button>
          )}
        </div>
      </div>

      {phase === "active" && remaining <= CLOSING_WINDOW_SECONDS && (
        <p className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Less than {CLOSING_WINDOW_SECONDS} seconds left — this is a good moment to summarise the discussion.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {PERSONAS.map((p) => (
              <ParticipantCard key={p.id} persona={p} speaking={speaking === p.id} />
            ))}
          </div>

          <div className="rounded-xl border-2 border-accent/40 bg-surface p-5">
            {phase === "preparing" && (
              <div className="space-y-3">
                <p className="font-medium">Organise your thoughts</p>
                <p className="text-sm text-muted">{topic.prompt}</p>
                <button
                  type="button"
                  onClick={() => setClock((c) => Math.max(c, PREP_SECONDS))}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  I&apos;m ready — start now
                </button>
              </div>
            )}

            {phase === "active" && (
              <div className="space-y-3">
                <p className="font-medium">You</p>
                <p className="text-sm text-muted">
                  {speaking
                    ? "Listen — another participant is speaking."
                    : turns.length === 0
                      ? "Open the discussion, or an AI participant will start shortly."
                      : `Press Speak to contribute. Keep each turn under ${MAX_TURN_SECONDS} seconds.`}
                </p>
                <MicControl
                  state={mic}
                  elapsed={elapsed}
                  disabled={speaking !== null}
                  onStart={startRecording}
                  onSubmit={() => submitTurn(Math.max(1, elapsed))}
                  onCancel={cancelRecording}
                />
                <p className="text-xs text-muted">
                  Demo mode: no real microphone yet — a sample response is used for your turn.
                </p>
              </div>
            )}

            {phase === "finished" && (
              <div className="space-y-3">
                <p className="font-medium">Discussion finished</p>
                <p className="text-sm text-muted">
                  You made {studentTurns} contribution{studentTurns === 1 ? "" : "s"} in {turns.length} total
                  turns.
                </p>
                <Link
                  href={`/gd/report?topic=${topic.id}`}
                  className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  View your report
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="h-[28rem] lg:h-auto">
          <TranscriptPanel turns={turns} />
        </div>
      </div>
    </div>
  );
}
