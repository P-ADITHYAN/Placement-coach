import { RUBRIC_VERSION, weightedOverall } from "@/lib/scoring/rubric";
import type { CategoryScore, GdReport, SessionSummary } from "@/lib/types";

const categories: CategoryScore[] = [
  {
    categoryId: "contribution",
    score: 78,
    evidence: [
      {
        quote: "one example is how UPI adoption grew because it was free for users",
        observation: "Strong, concrete example that directly supported your argument.",
      },
    ],
    recommendations: ["Keep pairing each claim with one specific example like this."],
  },
  {
    categoryId: "critical",
    score: 62,
    evidence: [
      {
        quote: "the cost point is important, like, for small businesses especially",
        observation: "The claim was relevant but not backed by reasoning or data.",
      },
    ],
    recommendations: ["Answer 'why?' once before moving on: claim → reason → example."],
  },
  {
    categoryId: "listening",
    score: 81,
    evidence: [
      {
        quote: "I agree with Diya, but I'd add that rural access is the biggest gap",
        observation: "You acknowledged a peer and extended the point with something new.",
      },
    ],
    recommendations: ["Name the person you are responding to — you did this well."],
  },
  {
    categoryId: "communication",
    score: 68,
    evidence: [
      {
        quote: "Um, I feel like, basically, the cost point is important, like,",
        observation: "Four filler words in one sentence weakened an otherwise good point.",
      },
    ],
    recommendations: ["Pause silently instead of saying 'like' or 'basically'."],
  },
  {
    categoryId: "leadership",
    score: 74,
    evidence: [
      {
        quote: "I think we should first define what success looks like here",
        observation: "You tried to set direction for the group early on.",
      },
    ],
    recommendations: ["After defining terms, propose the order the group should discuss them in."],
  },
  {
    categoryId: "turns",
    score: 70,
    evidence: [
      {
        quote: "So to conclude, I believe a gradual approach with clear safeguards",
        observation: "Good use of the closing window to summarise.",
      },
    ],
    recommendations: ["Keep each turn under 25 seconds so others can respond."],
  },
];

export const MOCK_REPORT: GdReport = {
  sessionId: "mock-session",
  topicId: "upi-cashless",
  overallScore: weightedOverall(categories),
  metrics: {
    wordsSpoken: 312,
    speakingRateWpm: 138,
    fillerWords: 9,
    fillerBreakdown: { like: 4, basically: 2, um: 3 },
    turnCount: 5,
    averageTurnSeconds: 27,
    talkSharePercent: 31,
    repeatedPhrases: [],
  },
  categories,
  strengths: ["Used a concrete example (UPI adoption)", "Acknowledged other participants by name"],
  priorityImprovements: [
    "Support every claim with a reason and an example",
    "Reduce filler words ('like', 'basically', 'um')",
  ],
  improvedExample: {
    original: "Um, I feel like, basically, the cost point is important, like, for small businesses especially.",
    improved: "Cost matters most for small businesses, because even a small transaction fee eats into thin margins.",
    why: "States the claim directly, adds the reason, and drops the fillers.",
  },
  practiceTask:
    "Retry the same topic and make each contribution follow: claim → reason → example, in under 25 seconds.",
  rubricVersion: RUBRIC_VERSION,
  limitedEvidence: false,
  droppedQuotes: 0,
};

export const MOCK_HISTORY: SessionSummary[] = [
  { id: "s3", topicId: "upi-cashless", date: "2026-10-18", durationMinutes: 5, overallScore: MOCK_REPORT.overallScore, weakestCategoryId: "critical" },
  { id: "s2", topicId: "ai-jobs", date: "2026-10-15", durationMinutes: 5, overallScore: 66, weakestCategoryId: "communication" },
  { id: "s1", topicId: "remote-work", date: "2026-10-12", durationMinutes: 3, overallScore: 58, weakestCategoryId: "critical" },
];
