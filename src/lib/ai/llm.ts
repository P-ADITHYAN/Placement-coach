import "server-only";

// Text generation with JSON output. Groq is the default (fast free tier);
// Gemini is the fallback. LLM_PROVIDER switches the order without code changes.
type Provider = "groq" | "gemini";

const GROQ_MODEL = process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const TIMEOUT_MS = 12_000;

export class LlmError extends Error {}

export interface JsonRequest {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

async function callGroq({ system, user, maxTokens = 800, temperature = 0.8 }: JsonRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new LlmError("GROQ_API_KEY is not set");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      // gpt-oss models reason before answering; "low" keeps latency around a second.
      ...(GROQ_MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      max_completion_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new LlmError(`Groq ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini({ system, user, maxTokens = 800, temperature = 0.8 }: JsonRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new LlmError("GEMINI_API_KEY is not set");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: maxTokens,
          temperature,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!response.ok) throw new LlmError(`Gemini ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

const CALLERS: Record<Provider, (req: JsonRequest) => Promise<string>> = {
  groq: callGroq,
  gemini: callGemini,
};

function providerOrder(): Provider[] {
  const primary: Provider = process.env.LLM_PROVIDER === "gemini" ? "gemini" : "groq";
  return primary === "groq" ? ["groq", "gemini"] : ["gemini", "groq"];
}

/** Returns the parsed JSON object from the first provider that answers validly. */
export async function generateJson(request: JsonRequest): Promise<{ data: unknown; provider: Provider }> {
  const failures: string[] = [];
  for (const provider of providerOrder()) {
    try {
      const raw = await CALLERS[provider](request);
      return { data: JSON.parse(raw), provider };
    } catch (error) {
      failures.push(`${provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new LlmError(failures.join(" | "));
}
