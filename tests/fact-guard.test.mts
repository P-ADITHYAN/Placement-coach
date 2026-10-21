import assert from "node:assert/strict";
import { test } from "node:test";
import { citesStatistic } from "../src/lib/ai/fact-guard.ts";

test("flags invented percentages, quantities and money", () => {
  assert.ok(citesStatistic("Mobile internet penetration is about 55%, but rural access is limited."));
  assert.ok(citesStatistic("Over 70 percent of small retailers lack POS terminals."));
  assert.ok(citesStatistic("Nearly 12.5 per cent of payments fail in villages."));
  assert.ok(citesStatistic("UPI handles over 10 billion transactions a month."));
  assert.ok(citesStatistic("The scheme cost ₹500 crore."));
  assert.ok(citesStatistic("It costs Rs 200 a month."));
  assert.ok(citesStatistic("Roughly 3 in 10 users fear fraud."));
});

test("flags claimed surveys and studies", () => {
  assert.ok(citesStatistic("Surveys show that trust is the main barrier."));
  assert.ok(citesStatistic("According to a recent report, adoption is slowing."));
  assert.ok(citesStatistic("A 2023 survey found most shops prefer cash."));
});

test("allows numbers already in the topic or said by a participant, but not new ones", () => {
  const topic = "India's 30% crypto tax — effective deterrent, revenue strategy, or innovation killer?";
  assert.equal(citesStatistic("Is a 30% tax really a deterrent, or just a revenue grab?", topic), false);
  assert.ok(citesStatistic("A 30% tax pushed 60% of traders offshore.", topic));
  const said = "UPI has 400 million users already.";
  assert.equal(citesStatistic("You said 400 million users, but how many use it daily?", said), false);
});

test("allows reasoning, structure and well-known events", () => {
  assert.equal(citesStatistic("Let me frame this in two parts: access and trust."), false);
  assert.equal(citesStatistic("First, the 2016 demonetisation pushed many shops to UPI."), false);
  assert.equal(citesStatistic("Many small retailers still prefer cash because of fees."), false);
  assert.equal(citesStatistic("Can you give an example from a village you know?"), false);
  assert.equal(citesStatistic("India's net zero by 2070 goal needs interim targets."), false);
});
