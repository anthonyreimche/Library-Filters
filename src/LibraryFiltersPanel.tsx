// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Library "Filters" panel: quick catalog scopes (All Photos, Picks,
// Rejects, Rated) and the rating, label and keyword filters over the grid.

import type { KeyboardEvent } from "react";
import { isFilterActive } from "./filter";
import { React, api } from "./rt";
import type { ColorLabel, RatingOp, UiTokens } from "./safelight";

const P = "safelight-filters";

export const CLASSES = {
  root: P,
  scopes: `${P}-scopes`,
  item: `${P}-item`,
  itemActive: `${P}-item-active`,
  count: `${P}-count`,
  fields: `${P}-fields`,
  row: `${P}-row`,
  ratingLabel: `${P}-rating-label`,
  op: `${P}-op`,
  fieldLabel: `${P}-field-label`,
  swatches: `${P}-swatches`,
  swatch: `${P}-swatch`,
  swatchActive: `${P}-swatch-active`,
  keyword: `${P}-keyword`,
  chips: `${P}-chips`,
  chip: `${P}-chip`,
  chipRemove: `${P}-chip-remove`,
  inputWrap: `${P}-input-wrap`,
  input: `${P}-input`,
  suggestions: `${P}-suggestions`,
  suggestion: `${P}-suggestion`,
  suggestionActive: `${P}-suggestion-active`,
  clear: `${P}-clear`,
} as const;

type Swatch = Exclude<ColorLabel, "none">;

const LABEL_SWATCHES: readonly Swatch[] = ["red", "yellow", "green", "blue", "purple"];

const swatchClass = (label: Swatch) => `${CLASSES.swatch}-${label}`;

export const RATING_OPS: readonly RatingOp[] = ["lt", "gt", "lte", "gte", "eq", "neq"];
export const RATING_OP_SYMBOL: Record<RatingOp, string> = {
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
  eq: "=",
  neq: "≠",
};

const MAX_SUGGESTIONS = 6;

/** The look core gave this panel with Tailwind utilities, as plain CSS (the
 *  app's Tailwind build never scans an extension). `:where()` drops the rules
 *  to zero specificity, so any stylesheet that restyles buttons or inputs
 *  wins over them as it wins over core's layered utilities. The last rules
 *  repeat core's Accessibility ▸ Larger text rules for 11 px and 10 px text. */
export function libraryFiltersCss(t: UiTokens): string {
  const c = CLASSES;
  const tint = `color-mix(in oklab, ${t.accent} 20%, transparent)`;
  const labelColor: Record<Swatch, string> = {
    red: t.labelRed,
    yellow: t.labelYellow,
    green: t.labelGreen,
    blue: t.labelBlue,
    purple: t.labelPurple,
  };
  const swatchColors = LABEL_SWATCHES.map(
    (l) => `:where(.${swatchClass(l)}) { background-color: ${labelColor[l]}; }`,
  ).join("\n");
  const small = [c.item, c.ratingLabel, c.fieldLabel, c.input, c.suggestion, c.clear];
  return `
:where(.${c.root}) { display: flex; flex-direction: column; }
:where(.${c.scopes} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.25rem; }
:where(.${c.item}) { display: flex; align-items: center; justify-content: space-between; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textSecondary}; cursor: pointer; }
:where(.${c.itemActive}) { background-color: ${t.surface3}; color: ${t.textPrimary}; }
@media (hover: hover) { :where(.${c.item}:not(.${c.itemActive}):hover) { background-color: ${t.surface2}; color: ${t.textPrimary}; } }
:where(.${c.count}) { color: ${t.textMuted}; }
:where(.${c.fields} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.75rem; }
:where(.${c.row}) { display: flex; align-items: center; justify-content: space-between; }
:where(.${c.ratingLabel}) { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; color: ${t.textSecondary}; }
:where(.${c.op}) { width: 1.25rem; border-radius: 0.25rem; background-color: ${t.surface2}; padding-block: 0.125rem; text-align: center; color: ${t.textPrimary}; }
@media (hover: hover) { :where(.${c.op}:hover) { background-color: ${t.surface3}; } }
:where(.${c.fieldLabel}) { font-size: 11px; color: ${t.textSecondary}; }
:where(.${c.swatches}) { display: flex; gap: 0.375rem; }
:where(.${c.swatch}) { height: 0.875rem; width: 0.875rem; border-radius: 9999px; opacity: 0.6; }
${swatchColors}
:where(.${c.swatchActive}) { opacity: 1; box-shadow: 0 0 0 2px ${t.textPrimary}; }
@media (hover: hover) { :where(.${c.swatch}:hover) { opacity: 1; } }
:where(.${c.keyword} > :not(:last-child)) { margin-block-start: 0; margin-block-end: 0.375rem; }
:where(.${c.chips}) { display: flex; flex-wrap: wrap; gap: 0.25rem; }
:where(.${c.chip}) { display: inline-flex; align-items: center; gap: 0.125rem; border-radius: 0.25rem; background-color: ${tint}; padding: 0.125rem 0.375rem; font-size: 10px; color: ${t.textPrimary}; }
:where(.${c.chipRemove}) { margin-left: 0.125rem; color: ${t.textMuted}; }
@media (hover: hover) { :where(.${c.chipRemove}:hover) { color: ${t.textPrimary}; } }
:where(.${c.inputWrap}) { position: relative; }
:where(.${c.input}) { width: 100%; border-radius: 0.25rem; background-color: ${t.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textPrimary}; outline-style: none; }
:where(.${c.input})::placeholder { color: ${t.textMuted}; }
:where(.${c.input}:focus) { box-shadow: 0 0 0 1px ${t.accent}; }
:where(.${c.suggestions}) { position: absolute; left: 0; right: 0; top: 100%; z-index: 50; margin-top: 0.125rem; border: 1px solid ${t.border}; border-radius: 0.25rem; background-color: ${t.surface1}; padding-block: 0.125rem; box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a; }
:where(.${c.suggestion}) { display: flex; width: 100%; align-items: center; justify-content: space-between; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textSecondary}; }
:where(.${c.suggestionActive}) { background-color: ${tint}; color: ${t.textPrimary}; }
@media (hover: hover) { :where(.${c.suggestion}:not(.${c.suggestionActive}):hover) { background-color: ${t.surface2}; } }
:where(.${c.clear}) { width: 100%; border-radius: 0.25rem; background-color: ${t.surface2}; padding: 0.25rem 0.5rem; font-size: 11px; color: ${t.textSecondary}; }
@media (hover: hover) { :where(.${c.clear}:hover) { background-color: ${t.surface3}; color: ${t.textPrimary}; } }
:where(.${c.clear}:disabled) { cursor: not-allowed; opacity: 0.4; }
${small.map((n) => `html.sl-larger-text .${n}`).join(", ")} { font-size: 13px !important; line-height: 1.45 !important; }
html.sl-larger-text .${c.chip} { font-size: 12px !important; }
`;
}

export function LibraryFiltersPanel() {
  const { Panel, Rating } = api.components;
  const { useCatalogStore, useUIStore } = api.stores;
  const photos = useCatalogStore((s) => s.photos);
  const filter = useUIStore((s) => s.filter);
  const setFilter = useUIStore((s) => s.setFilter);
  const clearFilters = useUIStore((s) => s.clearFilters);
  const activeFolder = useUIStore((s) => s.activeFolder);
  const setActiveFolder = useUIStore((s) => s.setActiveFolder);

  const picks = photos.filter((p) => p.flag === "pick").length;
  const rejects = photos.filter((p) => p.flag === "reject").length;
  const rated = photos.filter((p) => p.rating > 0).length;
  const active = isFilterActive(filter);

  const cycleRatingOp = () => {
    const i = RATING_OPS.indexOf(filter.ratingOp);
    setFilter({ ratingOp: RATING_OPS[(i + 1) % RATING_OPS.length] });
  };

  return (
    <div className={CLASSES.root}>
      <Panel title="Catalog">
        <div className={CLASSES.scopes}>
          <SidebarItem
            label="All Photos"
            count={photos.length}
            active={!active && activeFolder === null}
            onClick={() => {
              clearFilters();
              setActiveFolder(null);
            }}
          />
          <SidebarItem
            label="Picks"
            count={picks}
            active={filter.flag === "pick"}
            onClick={() => setFilter({ flag: filter.flag === "pick" ? "any" : "pick" })}
          />
          <SidebarItem
            label="Rejects"
            count={rejects}
            active={filter.flag === "reject"}
            onClick={() => setFilter({ flag: filter.flag === "reject" ? "any" : "reject" })}
          />
          <SidebarItem
            label="Rated"
            count={rated}
            active={filter.ratingOp === "gte" && filter.rating > 0}
            onClick={() => setFilter({ rating: filter.rating > 0 ? 0 : 1, ratingOp: "gte" })}
          />
        </div>
      </Panel>

      <Panel title="Filters">
        <div className={CLASSES.fields}>
          <div className={CLASSES.row}>
            <div className={CLASSES.ratingLabel}>
              <span>Rating</span>
              <button
                onClick={cycleRatingOp}
                title="Change comparison (<, >, ≤, ≥, =, ≠)"
                className={CLASSES.op}
              >
                {RATING_OP_SYMBOL[filter.ratingOp]}
              </button>
            </div>
            <Rating value={filter.rating} onChange={(rating) => setFilter({ rating })} size="md" />
          </div>

          <div className={CLASSES.row}>
            <span className={CLASSES.fieldLabel}>Label</span>
            <div className={CLASSES.swatches}>
              {LABEL_SWATCHES.map((label) => (
                <button
                  key={label}
                  onClick={() => setFilter({ label: filter.label === label ? "any" : label })}
                  className={`${CLASSES.swatch} ${swatchClass(label)}${
                    filter.label === label ? ` ${CLASSES.swatchActive}` : ""
                  }`}
                  aria-label={label}
                />
              ))}
            </div>
          </div>

          <KeywordFilterField />

          <button onClick={clearFilters} disabled={!active} className={CLASSES.clear}>
            Clear filters
          </button>
        </div>
      </Panel>
    </div>
  );
}

function KeywordFilterField() {
  const { useCatalogStore, useUIStore } = api.stores;
  const photos = useCatalogStore((s) => s.photos);
  const filter = useUIStore((s) => s.filter);
  const setFilter = useUIStore((s) => s.setFilter);
  const [input, setInput] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const allKeywords = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of photos) {
      for (const k of p.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return counts;
  }, [photos]);

  const suggestions = React.useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    const chosen = new Set(filter.keywords.map((k) => k.toLowerCase()));
    return [...allKeywords.entries()]
      .filter(([k]) => k.toLowerCase().includes(q) && !chosen.has(k.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SUGGESTIONS);
  }, [input, allKeywords, filter.keywords]);

  React.useEffect(() => setSelectedIdx(0), [suggestions.length]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const box = containerRef.current;
      if (box && !(e.target instanceof Node && box.contains(e.target))) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addKeywordFilter = (keyword: string) => {
    const k = keyword.trim();
    if (!k || filter.keywords.includes(k)) return;
    setFilter({ keywords: [...filter.keywords, k] });
    setInput("");
    setShowSuggestions(false);
  };

  const removeKeywordFilter = (keyword: string) => {
    setFilter({ keywords: filter.keywords.filter((k) => k !== keyword) });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) addKeywordFilter(suggestions[selectedIdx][0]);
      else addKeywordFilter(input);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Backspace" && input === "" && filter.keywords.length > 0) {
      removeKeywordFilter(filter.keywords[filter.keywords.length - 1]);
    }
  };

  if (allKeywords.size === 0) return null;

  return (
    <div ref={containerRef} className={CLASSES.keyword}>
      <span className={CLASSES.fieldLabel}>Keyword</span>
      {filter.keywords.length > 0 && (
        <div className={CLASSES.chips}>
          {filter.keywords.map((k) => (
            <span key={k} className={CLASSES.chip}>
              {k}
              <button
                onClick={() => removeKeywordFilter(k)}
                className={CLASSES.chipRemove}
                aria-label={`Remove ${k} from keyword filter`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={CLASSES.inputWrap}>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Filter by keyword…"
          aria-label="Filter by keyword"
          className={CLASSES.input}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className={CLASSES.suggestions}>
            {suggestions.map(([keyword, count], i) => (
              <button
                key={keyword}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addKeywordFilter(keyword);
                }}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`${CLASSES.suggestion}${i === selectedIdx ? ` ${CLASSES.suggestionActive}` : ""}`}
              >
                <span>{keyword}</span>
                <span className={CLASSES.count}>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className={`${CLASSES.item}${active ? ` ${CLASSES.itemActive}` : ""}`}>
      <span>{label}</span>
      <span className={CLASSES.count}>{count}</span>
    </div>
  );
}
