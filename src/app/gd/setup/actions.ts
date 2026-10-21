"use server";

import { redirect } from "next/navigation";
import { listPractisedTopicIds } from "@/lib/database/sessions";
import { getUserId } from "@/lib/supabase/server";
import { DURATIONS, isCatalogCategory, pickRandomTopic } from "@/lib/topics";
import { isDifficulty } from "@/lib/validation/discussion";

/**
 * Starts a GD on a random topic, like a real GD where the topic is given on the
 * spot. Topics the student hasn't practised yet are preferred.
 */
export async function startRandomGd(formData: FormData) {
  if (!(await getUserId())) redirect("/login?next=/gd/setup");

  const category = String(formData.get("category") ?? "");
  const difficulty = formData.get("difficulty");
  const duration = Number(formData.get("duration"));

  const topic = pickRandomTopic(await listPractisedTopicIds(), isCatalogCategory(category) ? category : undefined);
  const params = new URLSearchParams({
    topic: topic.id,
    difficulty: isDifficulty(difficulty) ? difficulty : "medium",
    duration: String(DURATIONS.find((d) => d === duration) ?? 5),
  });
  redirect(`/gd/session?${params}`);
}
