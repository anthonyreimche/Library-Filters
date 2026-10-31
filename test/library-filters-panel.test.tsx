// The Filters panel in a DOM, over real zustand UI and catalog stores: the
// catalog scopes with their counts and toggles, the rating operator and stars,
// the colour labels, the keyword field with its suggestions and chips, and
// Clear filters, each writing the UI store's Library filter as core's panel did.

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CLASSES, LibraryFiltersPanel, RATING_OP_SYMBOL } from "../src/LibraryFiltersPanel";
import { React, initRuntime } from "../src/rt";
import type { CatalogPhoto, LibraryFilter } from "../src/safelight";
import { NO_FILTER, fakeApi, photo, type Rig } from "./support/fake-api";

afterEach(cleanup);

function mount(
  opts: { photos?: CatalogPhoto[]; filter?: Partial<LibraryFilter>; activeFolder?: string | null } = {},
): Rig {
  const rig = fakeApi(opts);
  initRuntime(rig.api);
  render(<LibraryFiltersPanel />);
  return rig;
}

const LIBRARY: CatalogPhoto[] = [
  photo({ flag: "pick", rating: 3, keywords: ["sky", "Sea"] }),
  photo({ flag: "pick", keywords: ["sky"] }),
  photo({ flag: "reject", rating: 1, keywords: ["sky", "seal"] }),
  photo({ colorLabel: "red", keywords: ["city"] }),
  photo(),
];

const item = (label: string) => {
  const el = screen.getByText(label).parentElement;
  if (!el) throw new Error(`no ${label} row`);
  return el;
};
const isActive = (label: string) => item(label).classList.contains(CLASSES.itemActive);
const opButton = () => screen.getByTitle<HTMLButtonElement>("Change comparison (<, >, ≤, ≥, =, ≠)");
const clearButton = () => screen.getByText<HTMLButtonElement>("Clear filters");
const keywordInput = () => screen.getByLabelText<HTMLInputElement>("Filter by keyword");
const suggestionLabels = () =>
  [...document.querySelectorAll(`.${CLASSES.suggestion}`)].map((b) => b.firstChild?.textContent);
const filterOf = (rig: Rig) => rig.ui.getState().filter;

describe("LibraryFiltersPanel: catalog scopes", () => {
  it("renders the Catalog and Filters sections through core's Panel", () => {
    mount();
    expect(screen.getByRole("region", { name: "Catalog" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Filters" })).toBeTruthy();
  });

  it("counts all photos, picks, rejects and rated photos", () => {
    mount({ photos: LIBRARY });
    const count = (label: string) => item(label).querySelector(`.${CLASSES.count}`)?.textContent;
    expect(count("All Photos")).toBe("5");
    expect(count("Picks")).toBe("2");
    expect(count("Rejects")).toBe("1");
    expect(count("Rated")).toBe("2");
  });

  it("marks All Photos active only with no filter and no folder", () => {
    mount();
    expect(isActive("All Photos")).toBe(true);
    cleanup();
    mount({ activeFolder: "" });
    expect(isActive("All Photos")).toBe(false);
    cleanup();
    mount({ filter: { ratingOp: "eq" } });
    expect(isActive("All Photos")).toBe(false);
  });

  it("All Photos clears the filters and the folder scope", () => {
    const rig = mount({ filter: { flag: "pick" }, activeFolder: "2024" });
    fireEvent.click(screen.getByText("All Photos"));
    expect(rig.calls).toEqual(["clearFilters", { setActiveFolder: null }]);
    expect(filterOf(rig)).toEqual(NO_FILTER);
    expect(isActive("All Photos")).toBe(true);
  });

  it("toggles the pick and reject flag filters", () => {
    const rig = mount();
    fireEvent.click(screen.getByText("Picks"));
    expect(filterOf(rig).flag).toBe("pick");
    expect(isActive("Picks")).toBe(true);
    fireEvent.click(screen.getByText("Rejects"));
    expect(filterOf(rig).flag).toBe("reject");
    expect(isActive("Picks")).toBe(false);
    expect(isActive("Rejects")).toBe(true);
    fireEvent.click(screen.getByText("Rejects"));
    expect(filterOf(rig).flag).toBe("any");
  });

  it("Rated sets '≥ 1 star' and clears any positive rating back to 0", () => {
    const rig = mount({ filter: { ratingOp: "lt" } });
    fireEvent.click(screen.getByText("Rated"));
    expect(rig.calls).toEqual([{ setFilter: { rating: 1, ratingOp: "gte" } }]);
    expect(isActive("Rated")).toBe(true);
    fireEvent.click(screen.getByText("Rated"));
    expect(filterOf(rig)).toMatchObject({ rating: 0, ratingOp: "gte" });
    expect(isActive("Rated")).toBe(false);
  });

  it("does not mark Rated active for a positive rating under another operator", () => {
    mount({ filter: { rating: 2, ratingOp: "eq" } });
    expect(isActive("Rated")).toBe(false);
  });
});

describe("LibraryFiltersPanel: rating", () => {
  it("cycles the comparison <, >, ≤, ≥, =, ≠ and wraps", () => {
    const rig = mount();
    const seen = [opButton().textContent];
    for (let i = 0; i < 6; i++) {
      fireEvent.click(opButton());
      seen.push(opButton().textContent);
    }
    expect(seen).toEqual(["≥", "=", "≠", "<", ">", "≤", "≥"]);
    expect(filterOf(rig).ratingOp).toBe("gte");
    expect(Object.keys(RATING_OP_SYMBOL)).toHaveLength(6);
  });

  it("sets the threshold from the stars and clears it on the same star", () => {
    const rig = mount();
    const stars = within(screen.getByRole("group", { name: "Rating: 0 of 5 stars" }));
    fireEvent.click(stars.getByLabelText("3 stars"));
    expect(filterOf(rig).rating).toBe(3);
    fireEvent.click(screen.getByLabelText("3 stars"));
    expect(filterOf(rig).rating).toBe(0);
  });
});

describe("LibraryFiltersPanel: colour labels", () => {
  it("shows the five label swatches in core's order", () => {
    mount();
    const swatches = [...document.querySelectorAll(`.${CLASSES.swatches} button`)];
    expect(swatches.map((b) => b.getAttribute("aria-label"))).toEqual(["red", "yellow", "green", "blue", "purple"]);
    expect(swatches[0].className).toBe(`${CLASSES.swatch} ${CLASSES.swatch}-red`);
  });

  it("selects a label, swaps to another, and clears on a second click", () => {
    const rig = mount();
    fireEvent.click(screen.getByLabelText("green"));
    expect(filterOf(rig).label).toBe("green");
    expect(screen.getByLabelText("green").classList.contains(CLASSES.swatchActive)).toBe(true);
    fireEvent.click(screen.getByLabelText("blue"));
    expect(filterOf(rig).label).toBe("blue");
    expect(screen.getByLabelText("green").classList.contains(CLASSES.swatchActive)).toBe(false);
    fireEvent.click(screen.getByLabelText("blue"));
    expect(filterOf(rig).label).toBe("any");
  });
});

describe("LibraryFiltersPanel: Clear filters", () => {
  it("is disabled while nothing filters", () => {
    mount();
    expect(clearButton().disabled).toBe(true);
  });

  it("clears an active filter and disables itself", () => {
    const rig = mount({ filter: { label: "red", rating: 2 } });
    expect(clearButton().disabled).toBe(false);
    fireEvent.click(clearButton());
    expect(rig.calls).toEqual(["clearFilters"]);
    expect(clearButton().disabled).toBe(true);
  });

  it("follows filter changes made outside the panel", () => {
    const rig = mount();
    act(() => rig.ui.getState().setFilter({ flag: "reject" }));
    expect(clearButton().disabled).toBe(false);
    expect(isActive("Rejects")).toBe(true);
    expect(isActive("All Photos")).toBe(false);
  });
});

describe("LibraryFiltersPanel: keyword filter", () => {
  it("is hidden while no photo has a keyword, and appears when one does", () => {
    const rig = mount({ photos: [photo()] });
    expect(screen.queryByLabelText("Filter by keyword")).toBeNull();
    act(() => rig.catalog.setState({ photos: [photo({ keywords: ["sky"] })] }));
    expect(keywordInput()).toBeTruthy();
  });

  it("suggests matching keywords, case-insensitively, most-used first", () => {
    mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: "S" } });
    expect(suggestionLabels()).toEqual(["sky", "Sea", "seal"]);
    const counts = [...document.querySelectorAll(`.${CLASSES.suggestion} .${CLASSES.count}`)];
    expect(counts.map((c) => c.textContent)).toEqual(["3", "1", "1"]);
  });

  it("suggests nothing for a blank query and at most six keywords", () => {
    const many = Array.from({ length: 8 }, (_, i) => photo({ keywords: [`tag${i}`] }));
    mount({ photos: many });
    fireEvent.change(keywordInput(), { target: { value: "  " } });
    expect(suggestionLabels()).toEqual([]);
    fireEvent.change(keywordInput(), { target: { value: "tag" } });
    expect(suggestionLabels()).toHaveLength(6);
  });

  it("leaves keywords already in the filter out of the suggestions", () => {
    mount({ photos: LIBRARY, filter: { keywords: ["SKY"] } });
    fireEvent.change(keywordInput(), { target: { value: "s" } });
    expect(suggestionLabels()).toEqual(["Sea", "seal"]);
  });

  it("Enter adds the highlighted suggestion; the arrows move the highlight within bounds", () => {
    const rig = mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: "s" } });
    const highlighted = () => document.querySelector(`.${CLASSES.suggestionActive}`)?.firstChild?.textContent;
    expect(highlighted()).toBe("sky");
    fireEvent.keyDown(keywordInput(), { key: "ArrowUp" });
    expect(highlighted()).toBe("sky");
    fireEvent.keyDown(keywordInput(), { key: "ArrowDown" });
    fireEvent.keyDown(keywordInput(), { key: "ArrowDown" });
    fireEvent.keyDown(keywordInput(), { key: "ArrowDown" });
    expect(highlighted()).toBe("seal");
    fireEvent.keyDown(keywordInput(), { key: "ArrowUp" });
    expect(highlighted()).toBe("Sea");
    fireEvent.keyDown(keywordInput(), { key: "Enter" });
    expect(filterOf(rig).keywords).toEqual(["Sea"]);
    expect(keywordInput().value).toBe("");
    expect(suggestionLabels()).toEqual([]);
  });

  it("hovering a suggestion highlights it and pressing it adds it", () => {
    const rig = mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: "se" } });
    const seal = screen.getByText("seal").parentElement;
    if (!seal) throw new Error("no seal suggestion");
    fireEvent.mouseEnter(seal);
    expect(seal.classList.contains(CLASSES.suggestionActive)).toBe(true);
    fireEvent.mouseDown(seal);
    expect(filterOf(rig).keywords).toEqual(["seal"]);
  });

  it("Enter or a comma with no suggestion adds the typed text, trimmed, once", () => {
    const rig = mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: " dusk " } });
    fireEvent.keyDown(keywordInput(), { key: "," });
    expect(filterOf(rig).keywords).toEqual(["dusk"]);
    fireEvent.change(keywordInput(), { target: { value: "dusk" } });
    fireEvent.keyDown(keywordInput(), { key: "Enter" });
    fireEvent.change(keywordInput(), { target: { value: "   " } });
    fireEvent.keyDown(keywordInput(), { key: "Enter" });
    expect(filterOf(rig).keywords).toEqual(["dusk"]);
  });

  it("Escape hides the suggestions and Enter then adds the typed text", () => {
    const rig = mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: "se" } });
    fireEvent.keyDown(keywordInput(), { key: "Escape" });
    expect(suggestionLabels()).toEqual([]);
    fireEvent.keyDown(keywordInput(), { key: "Enter" });
    expect(filterOf(rig).keywords).toEqual(["se"]);
  });

  it("focusing the field shows the suggestions again; pressing outside hides them", () => {
    mount({ photos: LIBRARY });
    fireEvent.change(keywordInput(), { target: { value: "sky" } });
    fireEvent.mouseDown(document.body);
    expect(suggestionLabels()).toEqual([]);
    fireEvent.focus(keywordInput());
    expect(suggestionLabels()).toEqual(["sky"]);
    fireEvent.mouseDown(keywordInput());
    expect(suggestionLabels()).toEqual(["sky"]);
  });

  it("shows chosen keywords as chips that remove themselves", () => {
    const rig = mount({ photos: LIBRARY, filter: { keywords: ["sky", "city"] } });
    const chips = [...document.querySelectorAll(`.${CLASSES.chip}`)];
    expect(chips.map((c) => c.firstChild?.textContent)).toEqual(["sky", "city"]);
    fireEvent.click(screen.getByLabelText("Remove sky from keyword filter"));
    expect(filterOf(rig).keywords).toEqual(["city"]);
  });

  it("Backspace in an empty field removes the last chip", () => {
    const rig = mount({ photos: LIBRARY, filter: { keywords: ["sky", "city"] } });
    fireEvent.keyDown(keywordInput(), { key: "Backspace" });
    expect(filterOf(rig).keywords).toEqual(["sky"]);
    fireEvent.change(keywordInput(), { target: { value: "x" } });
    fireEvent.keyDown(keywordInput(), { key: "Backspace" });
    expect(filterOf(rig).keywords).toEqual(["sky"]);
  });
});
