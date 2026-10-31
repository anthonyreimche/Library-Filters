// isFilterActive, ported from core's visible-photos.test.ts: whether the
// Library filter narrows the grid, which drives "All Photos" and "Clear
// filters" in the panel.

import { describe, expect, it } from "vitest";
import { isFilterActive, ratingFilterActive } from "../src/filter";
import type { LibraryFilter } from "../src/safelight";
import { NO_FILTER } from "./support/fake-api";

const filter = (over: Partial<LibraryFilter> = {}): LibraryFilter => ({ ...NO_FILTER, ...over });

describe("isFilterActive", () => {
  it("is inert at the default '≥ 0 stars'", () => {
    expect(isFilterActive(NO_FILTER)).toBe(false);
  });

  it("counts a non-gte operator as active even at threshold 0", () => {
    // "= 0 stars" (show only unrated) is a real filter, unlike "≥ 0 stars".
    expect(isFilterActive(filter({ ratingOp: "eq" }))).toBe(true);
    expect(isFilterActive(filter({ ratingOp: "gte", rating: 1 }))).toBe(true);
  });

  it("counts flag, label and keyword criteria", () => {
    expect(isFilterActive(filter({ flag: "pick" }))).toBe(true);
    expect(isFilterActive(filter({ label: "red" }))).toBe(true);
    expect(isFilterActive(filter({ keywords: ["sky"] }))).toBe(true);
  });
});

describe("ratingFilterActive", () => {
  it("ignores flag, label and keywords", () => {
    expect(ratingFilterActive(filter({ flag: "pick", label: "red", keywords: ["sky"] }))).toBe(false);
  });

  it("is active for a positive threshold or any operator but '≥'", () => {
    expect(ratingFilterActive(filter({ rating: 3 }))).toBe(true);
    for (const ratingOp of ["lt", "lte", "gt", "eq", "neq"] as const) {
      expect(ratingFilterActive(filter({ ratingOp }))).toBe(true);
    }
  });
});
