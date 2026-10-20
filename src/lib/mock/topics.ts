import type { Difficulty, GdTopic } from "@/lib/types";

// Seed topic library. Moves to the gd_topics table in the database phase.
export const TOPICS: GdTopic[] = [
  {
    id: "remote-work",
    title: "Remote work is better than working from office",
    category: "Business",
    difficulty: "easy",
    prompt: "Discuss whether remote work improves productivity and wellbeing compared to office work.",
  },
  {
    id: "ai-jobs",
    title: "AI will create more jobs than it destroys",
    category: "Technology",
    difficulty: "medium",
    prompt: "Debate the long-term effect of artificial intelligence on employment in India.",
  },
  {
    id: "upi-cashless",
    title: "Is India ready to become a fully cashless economy?",
    category: "Economy",
    difficulty: "medium",
    prompt: "Evaluate the readiness of India's population and infrastructure for a cashless economy.",
  },
  {
    id: "social-media-reg",
    title: "Social media should be regulated like a public utility",
    category: "Current affairs",
    difficulty: "hard",
    prompt: "Discuss whether governments should regulate social media platforms like utilities.",
  },
  {
    id: "abstract-red",
    title: "Red",
    category: "Abstract",
    difficulty: "hard",
    prompt: "An abstract topic: interpret it in any direction and build a meaningful discussion.",
  },
];

export const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "easy", label: "Easy", hint: "Patient participants, more room to speak" },
  { value: "medium", label: "Medium", hint: "Balanced, realistic discussion" },
  { value: "hard", label: "Hard", hint: "Assertive peers who compete for the floor" },
];

export const DURATIONS = [3, 5, 8] as const;

export function getTopic(id: string | undefined): GdTopic | undefined {
  return TOPICS.find((t) => t.id === id);
}
