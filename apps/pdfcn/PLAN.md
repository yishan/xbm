# pdfcn — MVP plan

## Goal

A frontend-only gallery of themed PDF document layouts (invoice, resume, report cover, receipt) inspired by [pdfcn](https://pdfcn.dev) / [shadcn-labs/pdfcn](https://github.com/shadcn-labs/pdfcn) (MIT), with a theme switcher and block picker — no proprietary Takumi/Forme binaries.

Source pick: X post [shadcnlabs/status/2104840500847263794](https://x.com/shadcnlabs/status/2104840500847263794). Approved 2026-10-04 20:52 +08.

## Single-user MVP

**In scope**

1. **Block gallery** — 4 sample document layouts: Invoice, Resume, Report Cover, Receipt
2. **Document themes** — 6 CSS-variable presets (Professional, Modern, Minimal, Executive, Forest, Blueprint) applied to the preview page
3. **Chrome** — shadcn sidebar (block picker) + header (theme toggle, mock Export) + A4-ish live preview
4. **Mock export** — toast only; client-side HTML preview, no real PDF backend
5. **Credits** — pdfcn MIT attribution in README / header / footer
6. `base: "/pdfcn/"`; artifacts for PR

**Out of scope**

- Installing / vendoring Takumi or Forme WASM/binaries
- Real PDF generation / Cloudflare Worker
- Full 40+ upstream blocks or all registry components
- Multi-page pagination / print CSS pipeline
- Editable form fields that mutate document data (static seeded data is fine)

## Outcome-oriented tasks

1. Scaffold Vite React-TS + bunfig + Tailwind v4 + shadcn + `base: "/pdfcn/"`
2. Document theme tokens + `PdfThemeProvider` (CSS vars on preview root)
3. Four block components with seeded English sample data
4. App shell: sidebar block list, theme select, preview pane, mock Export
5. Wire App / README / light-dark chrome theme
6. Visual QA (Playwright screenshot + webm)
7. `scripts/build-all.sh` → push → unmerged PR → tracking

## Stack

| Choice | Why |
|--------|-----|
| Vite + React 19 + TS | Sibling demos |
| Bun + `minimumReleaseAge=259200` | Repo rule |
| Tailwind v4 + shadcn radix-nova | Sibling look |
| CSS-variable PDF themes | Open, no proprietary renderer |
| next-themes + sonner + lucide | Chrome theme / toasts / icons |
| Hash history (no router lib if single page) | Static host has no SPA rewrites; single-page gallery is enough |

## Deferred

- Real PDF export via a free client path (html2canvas/jspdf) if time
- More blocks (quote, packing slip, certificate)
- Takumi/Forme registry install once license path is crystal clear
- Cloudflare Worker

## Code layout

```
apps/pdfcn/
  PLAN.md README.md bunfig.toml vite.config.ts
  artifacts/{screenshot.png,demo.webm}
  src/
    App.tsx main.tsx index.css
    lib/{utils.ts,pdf-themes.ts,blocks.ts}
    components/
      theme-provider.tsx
      app-header.tsx
      block-sidebar.tsx
      preview-pane.tsx
      pdf-page.tsx
      blocks/{invoice.tsx,resume.tsx,report-cover.tsx,receipt.tsx}
      ui/…
```
