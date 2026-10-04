# pdfcn

A frontend gallery of themed PDF document layouts — invoice, resume, report cover, and receipt — with a block picker and document theme switcher. Built with shadcn/ui and Vite as a pure client-side preview (mock export only).

> Inspired by **[shadcn-labs/pdfcn](https://github.com/shadcn-labs/pdfcn)** / [pdfcn.dev](https://pdfcn.dev) (MIT License). This is an original, smaller re-implementation for the xbm nightly demo gallery. It does **not** vendor Takumi or Forme binaries. All sample data is fake and stays in the browser.

- Live: https://li.yishan.app/pdfcn/
- Bookmark: https://x.com/shadcnlabs/status/2104840500847263794
- Upstream: https://github.com/shadcn-labs/pdfcn (MIT)

## What it shows

| Block | What it shows |
|-------|---------------|
| Invoice | Line items, tax, totals, payment terms |
| Resume | Experience, skills chips, education |
| Report Cover | Title page with accent band and meta |
| Receipt | Compact merchant receipt with tip/tax |

Six document themes (Professional, Modern, Minimal, Executive, Forest, Blueprint) restyle the preview via CSS variables. Chrome supports light/dark/system. Export PDF is a toast-only mock.

## Run

```bash
bun install && bun run dev   # http://localhost:5173/pdfcn/
bun run build
```

Stack: Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui (radix-nova, neutral), sonner, lucide. No backend, so there is no Cloudflare Worker.

## Artifacts

- `artifacts/screenshot.png`: invoice preview (desktop, light)
- `artifacts/demo.webm`: walkthrough (blocks, themes, dark mode, mock export)

## License / attribution

Design and block ideas follow [pdfcn](https://github.com/shadcn-labs/pdfcn) © shadcn-labs, MIT License. The shadcn/ui components in `src/components/ui` come from [shadcn/ui](https://ui.shadcn.com) (MIT).
