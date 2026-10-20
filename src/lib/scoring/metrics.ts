import type { GdTurn, SpeechMetrics } from "@/lib/types";

// Layer A of the assessment (blueprint section 6): numbers counted directly
// from the transcript, with no model judgement involved.

type Turn = Pick<GdTurn, "speakerType" | "text" | "durationSeconds">;

// Hesitation sounds are always fillers. Words like "basically" are counted
// too, since in spoken GD answers they are almost always verbal padding.
const ALWAYS_FILLERS = ["um", "umm", "uh", "uhh", "er", "erm", "hmm", "ah", "basically", "literally"];
const FILLER_PHRASES = ["you know", "i mean", "sort of", "kind of like"];
// "like" and "actually" are only fillers in certain positions (", like,").
const COMMA_FILLERS = ["like", "actually", "so"];

const STOPWORDS = new Set(
  "a an the and or but so to of in on at for with is are was were be been it this that these those i we you they he she my our your their as by from not no do does did have has had will would can could should there here than then".split(
    " ",
  ),
);

/** Lowercase words, keeping apostrophes, for counting. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function countPhrase(words: string[], phrase: string[]) {
  let count = 0;
  for (let i = 0; i + phrase.length <= words.length; i++) {
    if (phrase.every((w, j) => words[i + j] === w)) count++;
  }
  return count;
}

/** Filler words in one piece of text, by filler. */
export function countFillers(text: string): Record<string, number> {
  const words = tokenize(text);
  const counts: Record<string, number> = {};
  const add = (key: string, n: number) => {
    if (n > 0) counts[key] = (counts[key] ?? 0) + n;
  };

  for (const filler of ALWAYS_FILLERS) add(filler, words.filter((w) => w === filler).length);
  for (const phrase of FILLER_PHRASES) add(phrase, countPhrase(words, phrase.split(" ")));

  // ", like," / ", like " / "like, " at a clause boundary.
  const lower = text.toLowerCase();
  for (const word of COMMA_FILLERS) {
    const pattern = new RegExp(`(^|[,.;—-]\\s*)${word}\\s*,|,\\s*${word}\\s*,`, "g");
    add(word, lower.match(pattern)?.length ?? 0);
  }
  return counts;
}

/**
 * Phrases (4-word sequences with at least two content words) the student used
 * in more than one turn — a sign of repeating the same argument.
 */
export function repeatedPhrases(turnTexts: string[], size = 4): string[] {
  const seenIn = new Map<string, Set<number>>();
  turnTexts.forEach((text, turnIndex) => {
    const words = tokenize(text);
    for (let i = 0; i + size <= words.length; i++) {
      const gram = words.slice(i, i + size);
      if (gram.filter((w) => !STOPWORDS.has(w)).length < 2) continue;
      const key = gram.join(" ");
      if (!seenIn.has(key)) seenIn.set(key, new Set());
      seenIn.get(key)!.add(turnIndex);
    }
  });
  const repeated = [...seenIn].filter(([, turns]) => turns.size > 1).map(([gram]) => gram.split(" "));
  // Merge overlapping grams ("a b c d" + "b c d e") into one phrase ("a b c d e").
  const phrases: string[][] = [];
  for (const gram of repeated) {
    const current = phrases.at(-1);
    if (current && current.slice(-(size - 1)).join(" ") === gram.slice(0, -1).join(" ")) {
      current.push(gram.at(-1)!);
    } else {
      phrases.push([...gram]);
    }
  }
  return phrases.map((p) => p.join(" "));
}

export function computeMetrics(turns: Turn[]): SpeechMetrics {
  const student = turns.filter((t) => t.speakerType === "student");
  const studentWords = student.reduce((n, t) => n + tokenize(t.text).length, 0);
  const allWords = turns.reduce((n, t) => n + tokenize(t.text).length, 0);
  const speakingSeconds = student.reduce((n, t) => n + t.durationSeconds, 0);

  const fillerBreakdown: Record<string, number> = {};
  for (const t of student) {
    for (const [filler, n] of Object.entries(countFillers(t.text))) {
      fillerBreakdown[filler] = (fillerBreakdown[filler] ?? 0) + n;
    }
  }

  return {
    wordsSpoken: studentWords,
    speakingRateWpm: speakingSeconds > 0 ? Math.round(studentWords / (speakingSeconds / 60)) : 0,
    fillerWords: Object.values(fillerBreakdown).reduce((a, b) => a + b, 0),
    fillerBreakdown,
    turnCount: student.length,
    averageTurnSeconds: student.length > 0 ? Math.round(speakingSeconds / student.length) : 0,
    talkSharePercent: allWords > 0 ? Math.round((studentWords / allWords) * 100) : 0,
    repeatedPhrases: repeatedPhrases(student.map((t) => t.text)),
  };
}
