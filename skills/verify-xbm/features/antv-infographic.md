# AntV Infographic gallery

Pick a curated `@antv/infographic` template by category, preview the live SVG, and copy its DSL.

## Sub-features

- `category-filter` All / List / Sequence / Hierarchy / Compare / Chart / Relation
- `template-pick` choose a template card to preview
- `dsl-copy` copy the declarative DSL

## How to get to it (user POV)

- Open `https://li.yishan.app/antv-infographic/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/antv-infographic/` from `dist/`.
- Choose a category chip, then a template card.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh antv-infographic` succeeded and `dist/antv-infographic/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts antv-infographic`. The `DRIVES["antv-infographic"]` recipe clicks role button "Sequence" (first). The template list narrows to Sequence templates (e.g. `Ascending Steps Sequence`) and the text `Sequence` is present.
- **Proof.** `.verify/<run>/antv-infographic/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- `Sequence` matches both the chip and template names; the recipe takes the first (the chip).
