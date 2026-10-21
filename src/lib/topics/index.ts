import type { Difficulty, GdTopic, TopicCategory } from "@/lib/types";
import { TOPIC_CATALOG, TOPIC_CATEGORIES } from "./catalog.ts";

export { TOPIC_CATALOG, TOPIC_CATEGORIES };

// The five sample topics used before the full catalog was added. They are never
// picked for new GDs, but older saved sessions still refer to them.
const LEGACY_CATEGORY: TopicCategory = { id: "legacy", name: "Practice topics" };
const LEGACY_TOPICS: GdTopic[] = [
  { id: "remote-work", categoryId: "legacy", title: "Remote work is better than working from office" },
  { id: "ai-jobs", categoryId: "legacy", title: "AI will create more jobs than it destroys" },
  { id: "upi-cashless", categoryId: "legacy", title: "Is India ready to become a fully cashless economy?" },
  { id: "social-media-reg", categoryId: "legacy", title: "Social media should be regulated like a public utility" },
  { id: "abstract-red", categoryId: "legacy", title: "Red" },
];

const ALL_TOPICS = new Map([...TOPIC_CATALOG, ...LEGACY_TOPICS].map((t) => [t.id, t]));
const ALL_CATEGORIES = new Map([...TOPIC_CATEGORIES, LEGACY_CATEGORY].map((c) => [c.id, c]));

export const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "easy", label: "Easy", hint: "Patient participants, more room to speak" },
  { value: "medium", label: "Medium", hint: "Balanced, realistic discussion" },
  { value: "hard", label: "Hard", hint: "Assertive peers who compete for the floor" },
];

export const DURATIONS = [3, 5, 8] as const;

export function getTopic(id: string | undefined): GdTopic | undefined {
  return id ? ALL_TOPICS.get(id) : undefined;
}

export function getCategory(id: string | undefined): TopicCategory | undefined {
  return id ? ALL_CATEGORIES.get(id) : undefined;
}

export function isCatalogCategory(id: string | undefined): boolean {
  return TOPIC_CATEGORIES.some((c) => c.id === id);
}

/**
 * Picks a random catalog topic (optionally within one category), preferring
 * topics the student hasn't practised yet. Once every candidate has been
 * practised, it picks from all of them again.
 */
export function pickRandomTopic(
  practisedIds: Iterable<string>,
  categoryId?: string,
  random: () => number = Math.random,
): GdTopic {
  const practised = new Set(practisedIds);
  const candidates = categoryId ? TOPIC_CATALOG.filter((t) => t.categoryId === categoryId) : TOPIC_CATALOG;
  const fresh = candidates.filter((t) => !practised.has(t.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(random() * pool.length)];
}
