// A stand-in Safelight API over real React and zustand. The UI store keeps the
// Library filter the way core's does (setFilter merges a patch, clearFilters
// resets to the inert filter), every filter action is recorded, and so is
// every registration. Panel and Rating stand in for core's components with
// the same markup contract: Panel renders its title and children, Rating
// renders five star buttons that toggle the clicked rating.

import * as React from "react";
import { create } from "zustand";
import type {
  CatalogPhoto,
  CatalogStoreState,
  LibraryFilter,
  PanelContribution,
  PanelProps,
  RatingProps,
  SafelightAPI,
  StoreApi,
  StylesheetContribution,
  UIStoreState,
  UiTokens,
} from "../../src/safelight";

export const TOKENS: UiTokens = {
  surface1: "var(--color-surface-1)",
  surface2: "var(--color-surface-2)",
  surface3: "var(--color-surface-3)",
  border: "var(--color-border)",
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  accent: "var(--color-accent)",
  labelRed: "var(--color-label-red)",
  labelYellow: "var(--color-label-yellow)",
  labelGreen: "var(--color-label-green)",
  labelBlue: "var(--color-label-blue)",
  labelPurple: "var(--color-label-purple)",
};

export const NO_FILTER: LibraryFilter = {
  rating: 0,
  ratingOp: "gte",
  flag: "any",
  label: "any",
  keywords: [],
};

export type UIAction =
  | { setFilter: Partial<LibraryFilter> }
  | "clearFilters"
  | { setActiveFolder: string | null };

export interface Rig {
  api: SafelightAPI;
  ui: StoreApi<UIStoreState>;
  catalog: StoreApi<CatalogStoreState>;
  /** Every UI store action called, in order. */
  calls: UIAction[];
  panels: PanelContribution[];
  stylesheets: StylesheetContribution[];
}

export function photo(p: Partial<CatalogPhoto> = {}): CatalogPhoto {
  return { rating: 0, colorLabel: "none", flag: "none", keywords: [], ...p };
}

function FakePanel({ title, children }: PanelProps) {
  return React.createElement(
    "section",
    { "aria-label": title },
    React.createElement("h3", null, title),
    children,
  );
}

function FakeRating({ value, onChange }: RatingProps) {
  return React.createElement(
    "div",
    { role: "group", "aria-label": `Rating: ${value} of 5 stars` },
    [1, 2, 3, 4, 5].map((star) =>
      React.createElement(
        "button",
        {
          key: star,
          onClick: () => onChange?.(value === star ? 0 : star),
          "aria-label": `${star} star${star === 1 ? "" : "s"}`,
          "aria-pressed": star <= value,
          disabled: !onChange,
        },
        star <= value ? "★" : "☆",
      ),
    ),
  );
}

export function fakeApi({
  photos = [],
  filter = {},
  activeFolder = null,
}: { photos?: CatalogPhoto[]; filter?: Partial<LibraryFilter>; activeFolder?: string | null } = {}): Rig {
  const calls: UIAction[] = [];
  const panels: PanelContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const catalog: StoreApi<CatalogStoreState> = create<CatalogStoreState>()(() => ({ photos }));
  const ui: StoreApi<UIStoreState> = create<UIStoreState>()((set) => ({
    filter: { ...NO_FILTER, ...filter },
    setFilter: (patch) => {
      calls.push({ setFilter: patch });
      set((s) => ({ filter: { ...s.filter, ...patch } }));
    },
    clearFilters: () => {
      calls.push("clearFilters");
      set({ filter: NO_FILTER });
    },
    activeFolder,
    setActiveFolder: (path) => {
      calls.push({ setActiveFolder: path });
      set({ activeFolder: path });
    },
  }));
  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.filters",
    react: React,
    registerPanel: (c) => void panels.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    ui: { tokens: TOKENS },
    components: { Panel: FakePanel, Rating: FakeRating },
    stores: { useCatalogStore: catalog, useUIStore: ui },
  };
  return { api, ui, catalog, calls, panels, stylesheets };
}
