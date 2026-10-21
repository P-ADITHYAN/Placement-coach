import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GdRoom } from "@/components/gd/gd-room";
import { DIFFICULTIES, DURATIONS, getTopic } from "@/lib/topics";
import type { Difficulty } from "@/lib/types";

export const metadata: Metadata = { title: "Discussion room" };

export default function SessionPage(props: PageProps<"/gd/session">) {
  return (
    <Suspense fallback={<p className="text-muted">Preparing the discussion room…</p>}>
      <Room searchParams={props.searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function Room({ searchParams }: Pick<PageProps<"/gd/session">, "searchParams">) {
  const params = await searchParams;
  const topic = getTopic(first(params.topic));

  if (!topic) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium">That topic could not be found</p>
        <p className="mt-1 text-sm text-muted">Choose a topic to start a new discussion.</p>
        <Link href="/gd/setup" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white">
          Back to setup
        </Link>
      </div>
    );
  }

  const requestedDifficulty = first(params.difficulty);
  const difficulty: Difficulty =
    DIFFICULTIES.find((d) => d.value === requestedDifficulty)?.value ?? "medium";
  const requestedDuration = Number(first(params.duration));
  const duration = DURATIONS.find((d) => d === requestedDuration) ?? 5;

  return <GdRoom topic={topic} difficulty={difficulty} durationMinutes={duration} />;
}
