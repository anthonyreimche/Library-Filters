// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Library "Filters" panel (catalogue scopes and the rating, label
// and keyword filters). It was core's built-in `core.filters` until Safelight
// 3.2.0 and keeps that panel id, so saved layouts keep it where it was.

import { LibraryFiltersPanel, libraryFiltersCss } from "./LibraryFiltersPanel";
import { initRuntime } from "./rt";
import type { SafelightAPI } from "./safelight";

export const PANEL_ID = "core.filters";
export const STYLESHEET_ID = "safelight.filters.styles";

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerStylesheet({ id: STYLESHEET_ID, css: libraryFiltersCss(host.ui.tokens) });
  host.registerPanel({
    id: PANEL_ID,
    title: "Filters",
    component: LibraryFiltersPanel,
    defaultDock: { module: "library", direction: "left", order: 1, width: 240 },
  });
}
