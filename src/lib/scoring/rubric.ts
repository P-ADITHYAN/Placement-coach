// Qualitative rubric (blueprint section 6, Layer B). Weights are illustrative
// starting values; validate them with faculty before treating scores as reliable.
export const RUBRIC_VERSION = "v0.1-draft";

export interface RubricCategory {
  id: string;
  name: string;
  weight: number;
  evaluates: string;
}

export const RUBRIC: RubricCategory[] = [
  {
    id: "contribution",
    name: "Contribution quality",
    weight: 0.25,
    evaluates: "Relevance, clarity, examples and useful original points.",
  },
  {
    id: "critical",
    name: "Critical thinking",
    weight: 0.2,
    evaluates: "Logical reasoning, respectful disagreement and response to counterarguments.",
  },
  {
    id: "listening",
    name: "Listening and collaboration",
    weight: 0.2,
    evaluates: "Building on others' ideas and connecting viewpoints.",
  },
  {
    id: "communication",
    name: "Communication",
    weight: 0.15,
    evaluates: "Organisation, clarity, grammar and appropriate vocabulary.",
  },
  {
    id: "leadership",
    name: "Leadership and initiative",
    weight: 0.1,
    evaluates: "Starting useful discussion, moving it forward and summarising.",
  },
  {
    id: "turns",
    name: "Turn management",
    weight: 0.1,
    evaluates: "Conciseness, timing and avoiding unnecessary repetition.",
  },
];

export function getRubricCategory(id: string): RubricCategory | undefined {
  return RUBRIC.find((c) => c.id === id);
}

/** Weighted overall score from per-category scores (0-100). */
export function weightedOverall(scores: { categoryId: string; score: number }[]): number {
  let total = 0;
  for (const { categoryId, score } of scores) {
    total += (getRubricCategory(categoryId)?.weight ?? 0) * score;
  }
  return Math.round(total);
}
