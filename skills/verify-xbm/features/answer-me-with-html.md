# Answer me with HTML

A gallery of offline single-page HTML answers rendered by the upstream `am` CLI from short Markdown drafts; the user picks a page and previews it next to its draft.

## Sub-features

- `page-pick` opens one of the 7 rendered pages from the list
- `theme-pick` switches render theme (Blueprint / Card / Long-read)
- `compare` shows 草稿 vs 页面 side by side
- `raw-links` opens `/answer-me-with-html/pages/*.html` and `drafts/*.md` directly

## How to get to it (user POV)

- Open `https://li.yishan.app/answer-me-with-html/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/answer-me-with-html/` from `dist/`.
- Choose a numbered entry (`01 xbm demo pipeline` … `07`) in the list.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh answer-me-with-html` succeeded and `dist/answer-me-with-html/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts answer-me-with-html`. The `DRIVES["answer-me-with-html"]` recipe clicks role button /^02 Vercel/. The preview iframe source / headings switch to the Vercel vs Cloudflare Worker comparison page.
- **Proof.** `.verify/<run>/answer-me-with-html/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Pages load in an iframe; assert on the iframe `src` or headings, not body text of the outer page.
