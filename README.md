# Library Filters for Safelight

The Library **Filters** panel: narrow the grid by flag, rating, colour label
and keyword.

- **Catalog:** All Photos, Picks, Rejects and Rated, each with its photo
  count. Picks, Rejects and Rated toggle on and off. All Photos clears every
  filter and the folder scope.
- **Rating:** pick a star threshold and a comparison. The button beside
  "Rating" cycles through <, >, ≤, ≥, = and ≠. Clicking the chosen star again
  clears it.
- **Label:** click a colour to show only photos with that label, and click it
  again to show all.
- **Keyword:** type to see matching keywords, most-used first. Enter or a
  comma adds one, and a photo must carry every keyword you add. Backspace in
  the empty field removes the last one. The field shows only once a photo in
  the project has a keyword.
- **Clear filters:** reset all of the above, and the search bar.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.filters`), so layouts saved before then keep it where it was.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

Safelight hands the extension its own React through `api.react`, so the
bundle never includes React. `src/safelight.d.ts` mirrors the part of the
app's extension API the extension uses.

## License

GPL-3.0-only with an attribution term (GPL v3 §7b), the same licence as Safelight; see LICENSE. Copyright (C) 2026 Anthony Reimche.
