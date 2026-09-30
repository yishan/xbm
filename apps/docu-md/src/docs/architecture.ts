export const architecture = {
  id: "architecture",
  title: "Architecture Brief",
  subtitle: "Layers, ER sketch, and a clean non-crossing layout",
  filename: "ARCHITECTURE.md",
  markdown: `# Architecture Brief

> **Intention:** Show readable, non-crossing diagrams — the quality people praise in docu.md — using a permissive stack (Mermaid MIT + a hand-drawn SVG). No GPLv3 engine vendored.

## Layers

1. **Shell** — sidebar, toolbar, theme, export (PDF via Cloudflare Worker)
2. **Documents** — typed sample markdown modules
3. **Renderer** — \`react-markdown\` + GFM + highlight + Mermaid fences
4. **Diagrams** — Mermaid for flow/sequence/ER; \`ArchitectureSvg\` for the static map

## Domain sketch

\`\`\`mermaid
erDiagram
  DOC ||--o{ FENCE : contains
  DOC {
    string id
    string title
    string markdown
  }
  FENCE {
    string lang
    string body
  }
  FENCE ||--o| DIAGRAM : may_be
  DIAGRAM {
    string engine
    string svg
  }
\`\`\`

## Class view

\`\`\`mermaid
classDiagram
  class DocMeta {
    +string id
    +string title
    +string filename
    +string markdown
  }
  class MarkdownView {
    +string source
    +render()
  }
  class MermaidBlock {
    +string code
    +mount()
  }
  DocMeta --> MarkdownView : feeds
  MarkdownView --> MermaidBlock : fences
\`\`\`

## Static map

The interactive SVG below (injected by the demo shell when this doc is open) keeps edges **non-crossing** on purpose — the visual beat from the bookmark.

<!-- architecture-svg -->

## Constraints

- Path-based deploy: \`base: "/docu-md/"\`
- No hard-coded root-absolute asset URLs in \`src/\`
- PDF export is rendered by a Cloudflare Worker (Browser Rendering)
`,
} as const
