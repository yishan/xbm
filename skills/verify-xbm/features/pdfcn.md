# pdfcn

Themed A4 PDF document layouts (Invoice, Resume, Report Cover, Receipt) with block picker, theme switcher and real PDF export via a Worker.

## Sub-features

- `block-pick` choose Invoice / Resume / Report Cover / Receipt
- `doc-theme` Document theme
- `export` Export PDF (Worker)

## How to get to it (user POV)

- Open `https://li.yishan.app/pdfcn/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/pdfcn/` from `dist/`.
- Choose a block in the left Blocks sidebar.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh pdfcn` succeeded and `dist/pdfcn/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts pdfcn`. The `DRIVES["pdfcn"]` recipe clicks role button /^Resume/. The page shows the resume layout instead of `Northwind Studio LLC` invoice.
- **Proof.** `.verify/<run>/pdfcn/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Export PDF calls the deployed Worker; skip in routine runs.
