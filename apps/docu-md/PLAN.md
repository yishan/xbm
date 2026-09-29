# docu-md — MVP plan

## Goal

A single-page, single-user showcase of the **docu.md product experience**: open sample markdown docs, see a polished live preview (rich MD + Mermaid diagrams), toggle themes, and mock one-click export — without vendoring any GPLv3 rendering engine.

Source pick: X post [kiwiflysky/status/2075195594797453646](https://x.com/kiwiflysky/status/2075195594797453646). Site: [docu.md](https://docu.md/). Inspiration repo (do not copy): [markdown-viewer/markdown-viewer-extension](https://github.com/markdown-viewer/markdown-viewer-extension) (GPLv3).

## Licensing stance

docu.md / markdown-viewer engines are **GPLv3**. This demo must **not** copy or vendor their rendering engine. We showcase the product UX with a permissive stack:

- Markdown: `react-markdown` + `remark-gfm` (MIT)
- Diagrams: Mermaid (MIT) for flow/sequence/class/ER; a hand-written "architecture brief" SVG that demonstrates readable non-crossing layout (PlantUML-*style* clarity, not their engine)
- Attribute docu.md as inspiration in README, header, footer, and PR

## Single-user MVP

**In scope**

1. **Doc gallery** — 3 sample docs selectable from a sidebar:
   - Tech README (badges, install, features table, Mermaid flowchart)
   - API Notes (endpoints table, code blocks, callouts, Mermaid sequence)
   - Architecture Brief (layers, Mermaid class/ER + a clean non-crossing architecture SVG)
2. **Side-by-side pane** — raw markdown source vs rendered preview (primary demo beat); toggle split / preview-only / source-only
3. **Rich markdown** — headings, tables, fenced code with highlight, blockquotes/callouts, lists, links, inline code
4. **Live Mermaid** — render ```mermaid fences in the preview
5. **Theme toggle** — light / dark (and one "Reading" warm option if cheap)
6. **Mock export chips** — DOCX / PDF / HTML / EPUB buttons that toast "Export mocked — demo only"
7. Credits + license note in header/footer; `base: "/docu-md/"`; artifacts for PR

**Out of scope**

- Real DOCX/PDF/EPUB export pipelines
- PlantUML / Vega / drawio / Graphviz engines (GPL or heavy)
- File upload / URL open / Obsidian / VS Code extension shells
- Editing the markdown (view-only gallery)
- Auth, sync, multi-user

## Outcome-oriented tasks

1. Scaffold Vite React-TS + bunfig + Tailwind v4 + shadcn (radix-nova) + path alias + `base: "/docu-md/"`
2. Sample docs as TS modules (`src/docs/*.ts`) with raw markdown strings
3. Markdown renderer component (GFM + code highlight + Mermaid fence handler)
4. Editor shell: sidebar doc list + split panes + toolbar (view mode, theme, export chips)
5. Wire App shell, README, theme provider
6. Visual QA (Playwright screenshots + short webm), hand-fix layout bugs
7. `scripts/build-all.sh` green → commit → push → unmerged PR → tracking entry

## Stack (one-line rationale)

| Choice | Why |
|--------|-----|
| Vite + React 19 + TS | Matches sibling demos; fast HMR |
| Bun + `minimumReleaseAge=259200` | Repo rule |
| Tailwind v4 + shadcn radix-nova | Sibling look; minimal chrome |
| react-markdown + remark-gfm | Permissive MD rendering |
| rehype-pretty-code or highlight.js | Code fence polish |
| mermaid | MIT diagrams; covers the "readable diagrams" beat |
| next-themes + sonner | Theme + export mock toasts |
| lucide-react | Icons for toolbar/export |

## Deferred

- Real export (needs heavy libs / server)
- Editable source with live re-render
- More diagram engines
- Mobile-first responsive polish beyond usable desktop

## Code layout (planned)

```
apps/docu-md/
  PLAN.md README.md bunfig.toml vite.config.ts
  artifacts/{screenshot.png,demo.webm}
  src/
    App.tsx main.tsx index.css
    docs/{tech-readme.ts,api-notes.ts,architecture.ts,index.ts}
    components/
      AppShell.tsx DocSidebar.tsx Toolbar.tsx
      SourcePane.tsx PreviewPane.tsx SplitView.tsx
      MarkdownView.tsx MermaidBlock.tsx ArchitectureSvg.tsx
      ui/… (shadcn)
    lib/utils.ts
```
