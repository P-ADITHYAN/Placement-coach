import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyQuote } from "../src/lib/scoring/evidence.ts";

const turns = [
  "Um, I think financial literacy is the real barrier, because many elderly people don't trust digital payments.",
  "For example, my grandparents only use cash.",
];

test("accepts exact quotes regardless of case and punctuation", () => {
  assert.equal(verifyQuote("financial literacy is the real barrier", turns), "financial literacy is the real barrier");
  assert.equal(verifyQuote("“For example my grandparents only use cash”", turns), "For example my grandparents only use cash");
  assert.ok(verifyQuote("many elderly people don’t trust digital payments", turns));
});

test("rejects invented or paraphrased quotes", () => {
  assert.equal(verifyQuote("financial literacy is the biggest barrier", turns), null);
  assert.equal(verifyQuote("UPI is free for everyone", turns), null);
});

test("rejects quotes too short to be meaningful evidence", () => {
  assert.equal(verifyQuote("I think", turns), null);
});

test("accepts ellipsis-shortened quotes only within one turn and in order", () => {
  assert.ok(verifyQuote("I think financial literacy ... don't trust digital payments", turns));
  assert.equal(verifyQuote("don't trust digital payments ... I think financial literacy", turns), null);
  assert.equal(verifyQuote("the real barrier ... my grandparents only use cash", turns), null);
});
