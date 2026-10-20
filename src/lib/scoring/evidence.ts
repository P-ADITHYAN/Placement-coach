// Checks that a quote cited by the AI evaluator really appears in what the
// student said (blueprint: "Validate that cited quotes actually exist").

const MIN_QUOTE_WORDS = 3;

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns the quote cleaned of wrapping quotation marks if it appears in one of
 * the student's turns (ignoring case and punctuation), otherwise null.
 * A quote shortened with "..." is accepted when every part is in the same turn.
 */
export function verifyQuote(quote: string, studentTurns: string[]): string | null {
  const cleaned = quote
    .trim()
    .replace(/^["“'‘]+|["”'’]+$/g, "")
    .replace(/^(\.\.\.|…)\s*|\s*(\.\.\.|…)$/g, "")
    .trim();
  const parts = cleaned
    .split(/\.\.\.|…/)
    .map(normalise)
    .filter(Boolean);
  const wordCount = parts.reduce((n, p) => n + p.split(" ").length, 0);
  if (parts.length === 0 || wordCount < MIN_QUOTE_WORDS) return null;

  const turns = studentTurns.map(normalise);
  const found = turns.some((turn) => {
    let from = 0;
    for (const part of parts) {
      const at = turn.indexOf(part, from);
      if (at === -1) return false;
      from = at + part.length;
    }
    return true;
  });
  return found ? cleaned : null;
}
