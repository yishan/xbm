# antv-infographic — MVP plan

## Goal

A single-page SVG infographic template gallery that uses the real MIT library `@antv/infographic` as a dependency and showcases a visually strong subset of its ~200 built-in templates.

Source pick: X post [Huahuazo/status/2104558493244281026](https://x.com/Huahuazo/status/2104558493244281026). Repo: [antvis/Infographic](https://github.com/antvis/Infographic) (MIT).

## Single-user MVP

**In scope**

1. **Template gallery** — curated subset (~10–14) across list / sequence / hierarchy / compare / chart / relation
2. **Live SVG preview** — select a template → render sample DSL via `new Infographic({ container }).render(syntax)`
3. **Sample data** — one polished English sample per template (title, desc, icons)
4. **Clean chrome** — shadcn sidebar + card grid + detail pane; light/polished zinc UI; optional dark toggle
5. **Credits** — AntV Infographic MIT attribution in header/footer/README
6. `base: "/antv-infographic/"`; artifacts for PR

**Out of scope**

- AI generation / streaming playground
- Built-in editor / editable DSL textarea (nice-to-have if time)
- PNG/SVG download pipeline beyond what the library exposes cheaply
- Cloudflare Worker (pure frontend)
- Custom template registration

## Outcome-oriented tasks

1. Scaffold Vite React-TS + bunfig + Tailwind v4 + shadcn + `@antv/infographic` + `base`
2. Curated template registry with sample DSL strings (`src/templates/*.ts`)
3. `InfographicCanvas` React wrapper (ref container, destroy on unmount, no loseContext issues)
4. Gallery shell: sidebar categories + template cards + large preview
5. Wire App, README, theme
6. Visual QA (Playwright screenshot + webm)
7. `scripts/build-all.sh` → push → unmerged PR → tracking

## Stack

| Choice | Why |
|--------|-----|
| Vite + React 19 + TS | Sibling demos |
| Bun + `minimumReleaseAge=259200` | Repo rule |
| Tailwind v4 + shadcn radix-nova | Sibling look |
| `@antv/infographic` (MIT) | Real dependency; SVG templates |
| next-themes + sonner + lucide | Theme / toasts / icons |

## Deferred

- Live DSL editor with streaming re-render
- Export PNG/SVG buttons wired to `exportToSVG`
- Full 200-template browser
- Rough/pattern theme playground

## Code layout

```
apps/antv-infographic/
  PLAN.md README.md bunfig.toml vite.config.ts
  artifacts/{screenshot.png,demo.webm}
  src/
    App.tsx main.tsx index.css
    templates/{samples.ts,types.ts,index.ts}
    components/
      InfographicCanvas.tsx
      TemplateSidebar.tsx
      TemplateCard.tsx
      PreviewPane.tsx
      AppHeader.tsx
```
