// What activate() registers: the Filters panel under core's old panel id,
// title and dock spot (so saved layouts keep it), and the stylesheet that
// gives it core's look.

import { describe, expect, it } from "vitest";
import { CLASSES, LibraryFiltersPanel } from "../src/LibraryFiltersPanel";
import { PANEL_ID, STYLESHEET_ID, activate } from "../src/index";
import { fakeApi } from "./support/fake-api";

describe("activate", () => {
  it("registers exactly the Filters panel, as core's core.filters did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.filters",
        title: "Filters",
        component: LibraryFiltersPanel,
        defaultDock: { module: "library", direction: "left", order: 1, width: 240 },
      },
    ]);
    expect(PANEL_ID).toBe("core.filters");
  });

  it("registers one stylesheet for the panel's classes, coloured from the theme tokens", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    const css = rig.stylesheets[0].css;
    for (const name of Object.values(CLASSES)) expect(css).toContain(`.${name}`);
    expect(css).toContain(`:where(.${CLASSES.itemActive}) { background-color: var(--color-surface-3); color: var(--color-text-primary); }`);
    expect(css).toContain("background-color: color-mix(in oklab, var(--color-accent) 20%, transparent)");
    expect(css).toContain("box-shadow: 0 0 0 2px var(--color-text-primary)");
    expect(css).toContain(`:where(.${CLASSES.clear}:disabled) { cursor: not-allowed; opacity: 0.4; }`);
    for (const label of ["red", "yellow", "green", "blue", "purple"]) {
      expect(css).toContain(`:where(.${CLASSES.swatch}-${label}) { background-color: var(--color-label-${label}); }`);
    }
  });

  it("keeps every rule at zero specificity except core's Larger text overrides", () => {
    const rig = fakeApi();
    activate(rig.api);
    const rules = rig.stylesheets[0].css.split("\n").filter((line) => line.includes("safelight-filters"));
    const plain = rules.filter((line) => !line.includes(":where(") && !line.startsWith("html.sl-larger-text"));
    expect(plain).toEqual([]);
  });

  it("repeats core's Larger text sizes for the 11 px and 10 px text", () => {
    const rig = fakeApi();
    activate(rig.api);
    const css = rig.stylesheets[0].css;
    expect(css).toContain(`html.sl-larger-text .${CLASSES.clear}`);
    expect(css).toContain("{ font-size: 13px !important; line-height: 1.45 !important; }");
    expect(css).toContain(`html.sl-larger-text .${CLASSES.chip} { font-size: 12px !important; }`);
  });
});
