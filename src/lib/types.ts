export type Difficulty = "easy" | "medium" | "hard";

export type PersonaId = "structured" | "challenger" | "assertive" | "collaborator";

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  behavior: string;
  tests: string;
  /** Tailwind classes for the persona's accent (avatar + speaking ring). */
  accent: { avatar: string; ring: string };
  /** Speaking-style instructions given to the language model. */
  style: string;
  /** Browser text-to-speech preferences. */
  voice: { gender: "female" | "male"; pitch: number; rate: number };
}

export type AiIntent = "open" | "build" | "challenge" | "counter" | "invite" | "synthesize" | "summarize";

/** Why the client is asking for an AI turn. */
export type RespondReason = "student-turn" | "silence" | "closing";

export interface RespondRequest {
  topicId: string;
  difficulty: Difficulty;
  remainingSeconds: number;
  reason: RespondReason;
  turns: Pick<GdTurn, "speakerType" | "personaId" | "text">[];
}

export interface RespondResponse {
  personaId: PersonaId;
  intent: AiIntent;
  text: string;
}

export interface GdTopic {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  prompt: string;
}

export type SpeakerType = "student" | "ai";

export interface GdTurn {
  turnNumber: number;
  speakerType: SpeakerType;
  /** Persona id for AI turns; undefined for the student. */
  personaId?: PersonaId;
  text: string;
  durationSeconds: number;
}

export interface Evidence {
  quote: string;
  observation: string;
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  evidence: Evidence[];
  recommendations: string[];
}

export interface SpeechMetrics {
  wordsSpoken: number;
  speakingRateWpm: number;
  fillerWords: number;
  turnCount: number;
  averageTurnSeconds: number;
}

export interface GdReport {
  sessionId: string;
  topicId: string;
  overallScore: number;
  metrics: SpeechMetrics;
  categories: CategoryScore[];
  priorityImprovements: string[];
  practiceTask: string;
  rubricVersion: string;
}

export interface SessionSummary {
  id: string;
  topicId: string;
  date: string;
  durationMinutes: number;
  overallScore: number;
  weakestCategoryId: string;
}
