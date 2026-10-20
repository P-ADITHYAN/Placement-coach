import type { PersonaId } from "@/lib/types";

// Scripted lines for the mock GD room. Replaced by real AI responses once the
// orchestrator is connected; kept topic-agnostic so any topic reads sensibly.
export const MOCK_AI_LINES: Record<PersonaId, string[]> = {
  structured: [
    "Let me frame this in three parts: the economic impact, the social impact, and who actually benefits.",
    "Building on that, a concrete example is how Indian IT firms adapted after 2020 — the data there is mixed.",
    "To summarise the arguments so far: we agree on the benefits, but disagree on who bears the cost.",
  ],
  challenger: [
    "I'd push back on that. What evidence do we have that this holds outside metro cities?",
    "That sounds convincing, but isn't it an assumption? Can you give a specific example?",
    "I respectfully disagree — the same argument could be used to support the opposite side.",
  ],
  assertive: [
    "I'll jump in here — the real issue is execution, not intent.",
    "Quickly adding one point: cost matters more than anything else for most people.",
    "Let's be clear, the short-term pain is real and we shouldn't ignore it.",
  ],
  collaborator: [
    "Both points are valid. Maybe the common ground is that it depends on the context.",
    "We haven't heard much from you yet — what's your take on the evidence question?",
    "If we connect what Meera and Aarav said, the answer might be a phased approach.",
  ],
};

// Simple rotation for the mock. The real orchestrator will pick the next
// speaker from the discussion state instead.
export const MOCK_SPEAKER_ORDER: PersonaId[] = [
  "structured",
  "challenger",
  "collaborator",
  "assertive",
];
