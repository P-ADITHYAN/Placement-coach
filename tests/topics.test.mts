import assert from "node:assert/strict";
import { test } from "node:test";
import { TOPIC_CATALOG, TOPIC_CATEGORIES, getTopic, pickRandomTopic } from "../src/lib/topics/index.ts";

test("catalog has 250 topics in 50 categories of 5, with unique ids", () => {
  assert.equal(TOPIC_CATALOG.length, 250);
  assert.equal(TOPIC_CATEGORIES.length, 50);
  assert.equal(new Set(TOPIC_CATALOG.map((t) => t.id)).size, 250);
  for (const c of TOPIC_CATEGORIES) {
    assert.equal(TOPIC_CATALOG.filter((t) => t.categoryId === c.id).length, 5, c.name);
  }
});

test("legacy topics still resolve for old sessions but are never picked", () => {
  assert.equal(getTopic("upi-cashless")?.title, "Is India ready to become a fully cashless economy?");
  for (let i = 0; i < 300; i++) assert.match(pickRandomTopic([]).id, /^t\d{3}$/);
});

test("prefers topics the student hasn't practised", () => {
  const practised = TOPIC_CATALOG.slice(0, 249).map((t) => t.id);
  assert.equal(pickRandomTopic(practised).id, "t250");
});

test("restricts to the chosen category and repeats once all are practised", () => {
  const inCat = TOPIC_CATALOG.filter((t) => t.categoryId === "c49").map((t) => t.id);
  for (let i = 0; i < 50; i++) assert.ok(inCat.includes(pickRandomTopic([], "c49").id));
  assert.ok(inCat.includes(pickRandomTopic(inCat, "c49").id));
});

test("spreads picks across the whole catalog", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i++) seen.add(pickRandomTopic([]).id);
  assert.ok(seen.size > 240, `only ${seen.size} distinct topics`);
});
