import { describe, expect, it } from "vitest";
import type { LintIssue } from "../src/types.js";
import { checkUniqueIds } from "../src/rules/unique-ids.js";
import { checkIdExists, checkPermutation } from "../src/rules/answer-references.js";
import { checkPoolBounds } from "../src/rules/pool-bounds.js";

describe("checkUniqueIds", () => {
  it("reports nothing for all-unique ids", () => {
    const issues: LintIssue[] = [];
    checkUniqueIds([{ id: "a" }, { id: "b" }], "items", issues);
    expect(issues).toEqual([]);
  });

  it("reports each repeat, pointing back at the first occurrence", () => {
    const issues: LintIssue[] = [];
    checkUniqueIds([{ id: "a" }, { id: "b" }, { id: "a" }], "items", issues);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "duplicate-id", severity: "error", at: "items[2]" });
    expect(issues[0]!.message).toContain("items[0]");
  });
});

describe("checkIdExists", () => {
  it("reports nothing when the id is present", () => {
    const issues: LintIssue[] = [];
    checkIdExists("a", [{ id: "a" }, { id: "b" }], "answer", issues);
    expect(issues).toEqual([]);
  });

  it("reports a dangling reference", () => {
    const issues: LintIssue[] = [];
    checkIdExists("z", [{ id: "a" }, { id: "b" }], "answer", issues);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "dangling-answer-reference", severity: "error", at: "answer" });
  });
});

describe("checkPermutation", () => {
  const items = [{ id: "s1" }, { id: "s2" }, { id: "s3" }];

  it("accepts an exact permutation", () => {
    const issues: LintIssue[] = [];
    checkPermutation(["s2", "s1", "s3"], items, "correct_order", issues);
    expect(issues).toEqual([]);
  });

  it("rejects a missing id", () => {
    const issues: LintIssue[] = [];
    checkPermutation(["s1", "s2"], items, "correct_order", issues);
    expect(issues).toHaveLength(1);
  });

  it("rejects a duplicate id", () => {
    const issues: LintIssue[] = [];
    checkPermutation(["s1", "s1", "s3"], items, "correct_order", issues);
    expect(issues).toHaveLength(1);
  });

  it("rejects an id not in items", () => {
    const issues: LintIssue[] = [];
    checkPermutation(["s1", "s2", "s4"], items, "correct_order", issues);
    expect(issues).toHaveLength(1);
  });
});

describe("checkPoolBounds", () => {
  it("accepts select within [1, from.length]", () => {
    const issues: LintIssue[] = [];
    checkPoolBounds({ id: "p1", select: 2, from: [{ id: "c1", path: "c1" }, { id: "c2", path: "c2" }] }, "pool", issues);
    expect(issues).toEqual([]);
  });

  it("rejects select > from.length", () => {
    const issues: LintIssue[] = [];
    checkPoolBounds({ id: "p1", select: 3, from: [{ id: "c1", path: "c1" }, { id: "c2", path: "c2" }] }, "pool", issues);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "pool-select-bounds" });
  });

  it("rejects select < 1", () => {
    const issues: LintIssue[] = [];
    checkPoolBounds({ id: "p1", select: 0, from: [{ id: "c1", path: "c1" }] }, "pool", issues);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "pool-select-bounds" });
  });

  it("also flags duplicate candidate ids within from", () => {
    const issues: LintIssue[] = [];
    checkPoolBounds({ id: "p1", select: 1, from: [{ id: "c1", path: "c1" }, { id: "c1", path: "c1-again" }] }, "pool", issues);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "duplicate-id" });
  });
});
