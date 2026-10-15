# docu.md

Open sample markdown docs, see a live preview (Mermaid diagrams), switch Split / Source / Preview and export PDF/HTML.

## Sub-features

- `doc-pick` Tech README / API Notes / Architecture Brief
- `view-mode` Split, Source, Preview
- `export` PDF (Cloudflare Worker), HTML, DOCX/EPUB mocks

## How to get to it (user POV)

- Open `https://li.yishan.app/docu-md/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/docu-md/` from `dist/`.
- Choose a sample doc card in the SAMPLE DOCS sidebar.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh docu-md` succeeded and `dist/docu-md/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts docu-md`. The `DRIVES["docu-md"]` recipe clicks role button /^API Notes/. Preview switches to API Notes; body text contains `Endpoints`.
- **Proof.** `.verify/<run>/docu-md/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- PDF export calls the deployed Worker (`VITE_PDF_API`); do not drive it in routine runs — it hits the network and the rate limit.
