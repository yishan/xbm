# Shadcn Admin

Frontend-only shadcn-admin dashboard: sidebar shell, KPI/chart dashboard, tasks table, settings, sign-in, theme.

## Sub-features

- `dashboard-tabs` Overview / Analytics / Reports / Notifications
- `routes` hash routes `#/tasks`, `#/settings`, `#/sign-in`
- `search` Search… ⌘K
- `theme` Toggle theme

## How to get to it (user POV)

- Open `https://li.yishan.app/shadcn-admin/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/shadcn-admin/` from `dist/`.
- Choose a dashboard tab, or a sidebar link.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh shadcn-admin` succeeded and `dist/shadcn-admin/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts shadcn-admin`. The `DRIVES["shadcn-admin"]` recipe clicks role tab "Analytics". Analytics tab is selected and its panel renders.
- **Proof.** `.verify/<run>/shadcn-admin/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Hash router: deep links are `/shadcn-admin/#/tasks`. Sample people use `@email.com` placeholder addresses (allowed by the scan).
