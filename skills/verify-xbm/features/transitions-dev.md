# transitions-dev

12 essential UI transitions (number pop-in, toast, tabs, save button …) each with Code (CSS/React) and Copy.

## Sub-features

- `number-pop` Next value
- `toast` Toggle toast
- `tabs` Plan / Build / Review
- `replay` Replay all / Reduce motion

## How to get to it (user POV)

- Open `https://li.yishan.app/transitions-dev/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/transitions-dev/` from `dist/`.
- Choose `Next value` on the Number pop-in card.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh transitions-dev` succeeded and `dist/transitions-dev/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts transitions-dev`. The `DRIVES["transitions-dev"]` recipe clicks role button "Next value". The `aria-live` number (`.t-num`, its `aria-label` is the value) changes.
- **Proof.** `.verify/<run>/transitions-dev/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Contains a sample `ada@studio.dev` address in a demo form; the scan reports it as an email to review (it is placeholder content).
