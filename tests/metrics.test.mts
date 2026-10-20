import assert from "node:assert/strict";
import { test } from "node:test";
import { computeMetrics, countFillers, repeatedPhrases } from "../src/lib/scoring/metrics.ts";

test("counts hesitation sounds and filler phrases", () => {
  assert.deepEqual(countFillers("Um, I mean, basically we should, uh, you know, decide."), {
    um: 1,
    uh: 1,
    basically: 1,
    "you know": 1,
    "i mean": 1,
  });
});

test("counts 'like' only when used as a filler", () => {
  assert.deepEqual(countFillers("I like this idea."), {});
  assert.deepEqual(countFillers("It is, like, really important."), { like: 1 });
  assert.deepEqual(countFillers("Like, the cost matters."), { like: 1 });
});

test("finds phrases repeated across turns but ignores stopword-only overlaps", () => {
  const turns = [
    "Rural internet access is the main barrier for this.",
    "Again, rural internet access is the main problem.",
    "It is in the end of the day.",
  ];
  assert.deepEqual(repeatedPhrases(turns), ["rural internet access is the main"]);
  assert.deepEqual(repeatedPhrases(["it is in the", "it is in the"]), []);
});

test("computes student metrics and ignores AI turns for speaking stats", () => {
  const metrics = computeMetrics([
    { speakerType: "ai", text: "Let me open with three points about cost.", durationSeconds: 4 },
    { speakerType: "student", text: "Um, I think cost matters most for small shops.", durationSeconds: 6 },
    { speakerType: "student", text: "For example, UPI is free for users.", durationSeconds: 4 },
  ]);
  assert.equal(metrics.wordsSpoken, 16);
  assert.equal(metrics.turnCount, 2);
  assert.equal(metrics.averageTurnSeconds, 5);
  assert.equal(metrics.speakingRateWpm, 96);
  assert.equal(metrics.fillerWords, 1);
  assert.equal(metrics.talkSharePercent, 67);
});

test("handles a student who never spoke", () => {
  const metrics = computeMetrics([{ speakerType: "ai", text: "Hello everyone.", durationSeconds: 1 }]);
  assert.equal(metrics.wordsSpoken, 0);
  assert.equal(metrics.speakingRateWpm, 0);
  assert.equal(metrics.averageTurnSeconds, 0);
});
