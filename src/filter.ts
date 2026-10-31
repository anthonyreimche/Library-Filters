// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Whether the Library filter narrows the grid at all, copied from core's
// src/modules/library/visible-photos.ts (core keeps the filtering itself).

import type { LibraryFilter } from "./safelight";

/** The rating filter is inert at "≥ 0" (matches everything); any other
 *  operator or a positive threshold means it is filtering. */
export function ratingFilterActive(f: LibraryFilter): boolean {
  return f.rating > 0 || f.ratingOp !== "gte";
}

export function isFilterActive(f: LibraryFilter): boolean {
  return ratingFilterActive(f) || f.flag !== "any" || f.label !== "any" || f.keywords.length > 0;
}
