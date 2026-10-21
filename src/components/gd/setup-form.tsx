"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { startRandomGd } from "@/app/gd/setup/actions";
import { DIFFICULTIES, DURATIONS, TOPIC_CATALOG, TOPIC_CATEGORIES } from "@/lib/topics";
import type { Difficulty } from "@/lib/types";

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Picking your topic…" : "Get a random topic & start"}
    </button>
  );
}

export function SetupForm() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [duration, setDuration] = useState<number>(5);

  return (
    <form action={startRandomGd} className="space-y-8">
      <fieldset>
        <legend className="mb-1 font-semibold">1. Topic area</legend>
        <p className="mb-3 text-sm text-muted">
          Your topic is picked at random from {TOPIC_CATALOG.length} placement topics and revealed when the
          discussion starts — just like a real GD. Topics you haven&apos;t practised yet come first.
        </p>
        <select
          name="category"
          defaultValue=""
          className="w-full rounded-lg border border-line bg-background px-3 py-2.5"
          aria-label="Topic area"
        >
          <option value="">Any category (all {TOPIC_CATEGORIES.length} areas)</option>
          {TOPIC_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
            <label
              key={m}
              className={`cursor-pointer rounded-lg border px-5 py-2 ${
                duration === m ? "border-accent bg-accent-soft text-accent" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="duration"
                value={m}
                checked={duration === m}
                onChange={() => setDuration(m)}
                className="sr-only"
              />
              {m} min
            </label>
          ))}
        </div>
      </fieldset>

      <StartButton />
    </form>
  );
}
