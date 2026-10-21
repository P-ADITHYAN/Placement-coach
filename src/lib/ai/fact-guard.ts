// AI participants must not invent figures: students may repeat them in a real
// GD. This catches statistic-like phrasing so the reply can be regenerated.
// Ordinal or structural numbers ("two parts", "first", a year like 2016) pass.

const PATTERNS: RegExp[] = [
  // 55%, 55 %, 55 percent, 12.5 per cent
  /\d[\d,.]*\s*(%|percent\b|per\s+cent\b)/i,
  // "3 in 10", "70 out of 100"
  /\b\d[\d,.]*\s+(out\s+of|in)\s+(every\s+)?\d[\d,.]*\b/i,
  // 3 crore, 40 lakh, 2.5 million/billion/trillion
  /\d[\d,.]*\s*(crore|lakh|million|billion|trillion|mn|bn)\b/i,
  // Currency amounts: ₹500, $20, Rs 500
  /([₹$]|\brs\.?)\s?\d/i,
  // Claimed sources: "surveys show", "a study found", "according to a report"
  /\b(surveys?|stud(y|ies)|reports?|data|research)\s+(show|shows|showed|found|finds|suggests?|indicates?)\b/i,
  /\baccording\s+to\s+(a|an|the|recent)\b/i,
  /\b(19|20)\d{2}\s+(survey|study|report|census)\b/i,
];

/**
 * True if the text appears to cite a specific statistic or study. Numbers that
 * already appear in `context` (the topic title, or something a participant
 * said) are allowed: quoting or questioning them isn't inventing them.
 */
export function citesStatistic(text: string, context = ""): boolean {
  const known = new Set(context.match(/\d[\d,.]*\d|\d/g) ?? []);
  const checked = text.replace(/\d[\d,.]*\d|\d/g, (n) => (known.has(n) ? "N" : n));
  return PATTERNS.some((p) => p.test(checked));
}
