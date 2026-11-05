// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/extensions/ui-kit.tsx,
// src/state/ui-store.ts, src/state/catalog-store.ts, src/catalog/types.ts,
// src/modules/library/visible-photos.ts and the Panel and Rating components.
// Extensions are standalone bundles, so the host's source is not on the type
// path; React types come from @types/react (dev only).

import type { ComponentType, ReactNode } from "react";

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

export type ColorLabel = "none" | "red" | "yellow" | "green" | "blue" | "purple";
export type FlagStatus = "none" | "pick" | "reject";

/** A catalogue photo. Core's record carries much more, which this extension
 *  never reads. */
export interface CatalogPhoto {
  rating: number;
  colorLabel: ColorLabel;
  flag: FlagStatus;
  keywords: string[];
}

export interface CatalogStoreState {
  photos: CatalogPhoto[];
}

export type FlagFilter = "any" | "pick" | "reject";
export type LabelFilter = "any" | ColorLabel;
export type RatingOp = "lt" | "lte" | "gt" | "gte" | "eq" | "neq";

/** The Library grid's filter. */
export interface LibraryFilter {
  /** Stars threshold, compared via `ratingOp`. */
  rating: number;
  ratingOp: RatingOp;
  flag: FlagFilter;
  label: LabelFilter;
  /** A photo must carry all of these (case-insensitive). */
  keywords: string[];
}

export interface UIStoreState {
  filter: LibraryFilter;
  setFilter(patch: Partial<LibraryFilter>): void;
  /** Reset the filter, and clear every extension grid filter (the search bar). */
  clearFilters(): void;
  /** Project folder filter: relative path ("" = whole project), null = all. */
  activeFolder: string | null;
  setActiveFolder(path: string | null): void;
}

export interface PanelDockDefault {
  module: "library" | "develop";
  direction: "left" | "right" | "bottom";
  order?: number;
  width?: number;
  height?: number;
}

export interface PanelContribution {
  /** Globally unique, e.g. "core.histogram" or "my-ext.fancy-curves". */
  id: string;
  title: string;
  component: ComponentType;
  defaultDock?: PanelDockDefault;
}

/** A stylesheet applied to every app window after the core styles. Extension
 *  rules are unlayered, so they win over Tailwind utility classes at equal or
 *  lower specificity; disabling the extension removes the sheet. */
export interface StylesheetContribution {
  id: string;
  css: string;
}

/** The theme's CSS variables as `var(--color-…)` strings. */
export interface UiTokens {
  readonly surface1: string;
  readonly surface2: string;
  readonly surface3: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly labelRed: string;
  readonly labelYellow: string;
  readonly labelGreen: string;
  readonly labelBlue: string;
  readonly labelPurple: string;
}

/** A collapsible section. Inside a dock panel of the same title it drops its
 *  own header and renders the content directly. */
export interface PanelProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Five stars; clicking the current rating clears it to 0. */
export interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerPanel(c: PanelContribution): void;
  registerStylesheet(c: StylesheetContribution): void;
  ui: { tokens: UiTokens };
  components: {
    Panel: ComponentType<PanelProps>;
    Rating: ComponentType<RatingProps>;
  };
  stores: {
    useCatalogStore: StoreApi<CatalogStoreState>;
    useUIStore: StoreApi<UIStoreState>;
  };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
