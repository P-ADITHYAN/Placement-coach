import type { Persona, PersonaId } from "@/lib/types";

// Behaviour profiles from the blueprint (section 4). These become the
// system-prompt basis for each AI participant in the orchestrator phase.
export const PERSONAS: Persona[] = [
  {
    id: "structured",
    name: "Aarav",
    role: "Structured thinker",
    behavior: "Opens with a clear argument, organises points and uses examples.",
    tests: "Whether you build on a structured argument rather than repeat it.",
    accent: { avatar: "bg-sky-600", ring: "ring-sky-500" },
  },
  {
    id: "challenger",
    name: "Meera",
    role: "Challenger",
    behavior: "Questions assumptions, asks for evidence and disagrees respectfully.",
    tests: "Rebuttal skill and defending a position under pressure.",
    accent: { avatar: "bg-rose-600", ring: "ring-rose-500" },
  },
  {
    id: "assertive",
    name: "Kabir",
    role: "Assertive speaker",
    behavior: "Enters quickly, speaks confidently and competes for the floor.",
    tests: "Assertiveness, concise speaking and respectful re-entry.",
    accent: { avatar: "bg-amber-600", ring: "ring-amber-500" },
  },
  {
    id: "collaborator",
    name: "Diya",
    role: "Collaborator",
    behavior: "Connects viewpoints, invites quieter people and finds common ground.",
    tests: "Listening, synthesis and moving the discussion forward.",
    accent: { avatar: "bg-emerald-600", ring: "ring-emerald-500" },
  },
];

export function getPersona(id: PersonaId): Persona {
  const persona = PERSONAS.find((p) => p.id === id);
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
}
