# Shadcn Admin

A frontend-only showcase of the shadcn-admin dashboard pattern: a collapsible sidebar shell, a KPI and chart dashboard, a TanStack Table task list with faceted filters, sorting and pagination, settings forms, a sign-in page, and light/dark/system themes. Built with shadcn/ui, Vite and TanStack Router.

> Inspired by **[satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin)** by Sat Naing (MIT License). This is an original, smaller re-implementation for the xbm nightly demo gallery. It is not a copy of the upstream code. All data is fake and stays in the browser.

- Live: https://li.yishan.app/shadcn-admin/
- Bookmark: https://x.com/fhwofjow51260/status/2104904784637739452
- Upstream: https://github.com/satnaing/shadcn-admin (MIT)

## Pages

| Route | What it shows |
|-------|---------------|
| `#/` Dashboard | 4 KPI cards, a monthly revenue bar chart, recent sales, and an Analytics tab with a stacked/expanded visitors area chart and top pages |
| `#/tasks` Tasks | 64 seeded tasks in a TanStack Table: text filter, Status/Priority faceted filters, column sorting, column visibility, row selection, pagination |
| `#/settings` Settings | Profile form (react-hook-form + zod validation), Appearance (live theme picker), Notifications (radio, switches) |
| `#/sign-in` Sign in | Split-screen auth page with a validated form (mock submit, then redirect) |

The sidebar collapses to icons on desktop (⌘/Ctrl+B or the header trigger) and becomes a sheet on mobile. The theme (light/dark/system) is saved in `localStorage`.

## Run

```bash
bun install && bun run dev   # http://localhost:5173/shadcn-admin/
bun run build
```

Stack: Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui (radix-nova, neutral), @tanstack/react-router (hash history, because the static host has no SPA rewrites), @tanstack/react-table v8, Recharts via shadcn `chart`, react-hook-form + zod, sonner. No backend, so there is no Cloudflare Worker.

## Artifacts

- `artifacts/screenshot.png`: dashboard (desktop, light)
- `artifacts/demo.webm`: walkthrough (dashboard, tasks filtering/sorting/paging, settings and theme switch, sign-in, collapsed sidebar, mobile)

## License / attribution

The UI design and page set follow [shadcn-admin](https://github.com/satnaing/shadcn-admin) © Sat Naing, MIT License. The shadcn/ui components in `src/components/ui` come from [shadcn/ui](https://ui.shadcn.com) (MIT).
