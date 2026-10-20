import type { RespondRequest, RespondResponse } from "@/lib/types";

/** Asks the server for the next AI participant's turn, or throws a user-facing message. */
export async function requestAiTurn(request: RespondRequest): Promise<RespondResponse> {
  let response: Response;
  try {
    response = await fetch("/api/gd/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("Network problem — the AI participants couldn't respond.");
  }
  const body = (await response.json().catch(() => ({}))) as Partial<RespondResponse> & { error?: string };
  if (!response.ok || !body.text || !body.personaId) {
    throw new Error(body.error ?? "The AI participants couldn't respond. You can keep speaking.");
  }
  return body as RespondResponse;
}
