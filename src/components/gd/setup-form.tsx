"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, DURATIONS, TOPICS } from "@/lib/mock/topics";
import type { Difficulty } from "@/lib/types";

const CATEGORIES = ["All", ...new Set(TOPICS.map((t) => t.category))];

export function SetupForm() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [duration, setDuration] = useState<number>(5);

  const visibleTopics = category === "All" ? TOPICS : TOPICS.filter((t) => t.category === category);

  function start() {
    const params = new URLSearchParams({ topic: topicId, difficulty, duration: String(duration) });
    router.push(`/gd/session?${params}`);
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 font-semibold">1. Choose a topic</legend>
        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-sm ${
                category === c ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleTopics.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-lg border p-4 ${
                topicId === t.id ? "border-accent bg-accent-soft" : "border-line hover:border-muted"
              }`}
            >
              <input
                type="radio"
                name="topic"
                value={t.id}
                checked={topicId === t.id}
                onChange={() => setTopicId(t.id)}
                className="sr-only"
              />
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 text-xs text-muted">
                {t.category} · {t.difficulty}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-semibold">2. Difficulty</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((d) => (
            <label
              key={d.value}
              className={`cursor-pointer rounded-lg border p-4 ${
                difficulty === d.value ? "border-accent bg-accent-soft" : "border-line hover:border-muted"
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={d.value}
                checked={difficulty === d.value}
                onChange={() => setDifficulty(d.value)}
                className="sr-only"
              />
              <p className="font-medium">{d.label}</p>
              <p className="mt-1 text-xs text-muted">{d.hint}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-semibold">3. Duration</legend>
        <div className="flex gap-3">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m)}
              className={`rounded-lg border px-5 py-2 ${
                duration === m ? "border-accent bg-accent-soft text-accent" : "border-line"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={start}
        className="w-full rounded-lg bg-accent px-5 py-3 font-medium text-white hover:opacity-90 sm:w-auto"
      >
        Enter discussion room
      </button>
    </div>
  );
}
