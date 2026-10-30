# Module: Colors (`colors`)

Status: **Phase 6a ✅** (6b next). Scope confirmed 2026-10-30: split into 6a (browse, search, nearest, copy, favorites) and 6b (pick a color from a photo).

## Job

The owner uses Sanzo Wada's *A Dictionary of Color Combinations* as a reference for design and everyday choices (clothes, rooms, gifts). They use the module in three moments:

1. **Browse** the 348 combinations for inspiration.
2. **Look up** a color by name or code, then see every combination that uses it.
3. **Match** a color they already have (a HEX code now, a photo in 6b) to the nearest Wada colors.

Mode: **Reference.** It is quick to open, quiet, and the colors carry the screen.

## Data

- Source: [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations), `colors.json`, **MIT** (© 2020 Matt DesLauriers). It is stored verbatim in `modules/colors/shared/data/wada-colors.json`, next to its license notice.
  - Never extract colors or images from a scanned copy of the book.
- 159 colors and 348 combinations (120 pairs, 120 trios, 108 quads). Each color has an English name, HEX, RGB, CMYK, CIELAB (D50), the swatch group (0–5) and the numbers of its combinations.
- The values were converted from CMYK and may differ slightly from the printed book. The About line says so.
- Names are English only (there are no Japanese names in the dataset). Thai UI text comes through i18n; color names stay as published.
- Ids: a color's id is the kebab-case slug of its name (`hermosa-pink`). A combination's id is its number (1–348). Colors inside a combination are listed in dataset order.
- The data is static and bundled with the module (`shared/`, isomorphic). It is not stored in the database.

## Color math (`shared/color-math.ts`)

- `parseHex`: accepts `#abc`, `abc`, `#aabbcc` and `aabbcc`, case-insensitive.
- sRGB → **OKLab**. Distance is **ΔE OK**, the Euclidean distance in OKLab.
- `nearestColors(hex, n = 5)`: the closest Wada colors, each with its ΔE. A match with ΔE < 0.02 is shown as "almost exact".
- `readableTextOn(hex)`: black or white text, whichever has the higher WCAG contrast. Swatches are data, so their text color is computed; this is the one place outside semantic tokens.

## Screens

1. **`/colors`**
   - Search field at the top. A name matches by contains. A HEX code shows the nearest colors.
   - Segmented control: **Combinations** | **Colors** | **Favorites**.
     - Combinations: a list of palette strips, numbered, with a filter for All / 2 / 3 / 4 colors.
     - Colors: a grid of swatches with names.
     - Favorites: favorite combinations and colors.
2. **`/colors/[slug]`: color**
   - Large swatch and the name.
   - HEX, RGB and CMYK rows, each with a copy button that confirms "Copied".
   - Favorite toggle.
   - Every combination that uses the color.
3. **`/colors/combinations/[n]`: combination**
   - "No. n" with the colors stacked as large bands, each with its name and HEX. A band opens that color.
   - Copy all HEX codes.
   - Favorite toggle.

The empty state for favorites is friendly: "Tap ♡ on a color or combination to keep it here."

## Favorites (server)

- Table `colors_favorites`: `ownedColumns` + `kind` (`COLOR` | `COMBINATION`) + `ref` (slug or number as text). Unique per (owner, kind, ref) among rows that are not deleted.
- GraphQL:
  - `Query.colorFavorites: [ColorFavorite!]!` returns `{ id, kind, ref, createdAt }`, newest first.
  - `setColorFavorite(input: { kind, ref, isFavorite })` adds the favorite or soft-deletes it. It is idempotent and returns the current list.
- Errors: `VALIDATION_FAILED` for an unknown ref (checked against the bundled dataset) and `UNAUTHENTICATED`.

## Copy to clipboard

`expo-clipboard` (works on web too).

## Phase 6b (later)

Pick a color from a photo: tap a point (or use the average of a region), then see the nearest Wada colors and their combinations. Needs pixel sampling on native and on web; it gets its own spec section before code.
