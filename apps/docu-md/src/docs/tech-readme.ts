export const techReadme = {
  id: "tech-readme",
  title: "Tech README",
  subtitle: "Product overview with install steps & flowchart",
  filename: "README.md",
  markdown: `# Aurora CLI

> **Callout:** A tiny TypeScript CLI that turns markdown drafts into shareable previews.

![status](https://img.shields.io/badge/status-demo-sky) ![license](https://img.shields.io/badge/license-MIT-green)

Aurora CLI is a **single-binary** tool for local markdown previews. It is the kind of README AI assistants write every day — tables, code, and a diagram included.

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| Live reload | ✅ | Watches \`*.md\` |
| Mermaid diagrams | ✅ | Client-side render |
| Theme pack | ✅ | Light / Dark / Reading |
| Cloud sync | ❌ | Out of scope for MVP |

## Install

\`\`\`bash
bun add -g aurora-cli
aurora preview ./docs
\`\`\`

## Quick start

1. Drop a markdown file into \`./docs\`
2. Run \`aurora preview\`
3. Open the local URL and toggle themes

\`\`\`ts
import { preview } from "aurora-cli"

await preview({
  root: "./docs",
  theme: "reading",
})
\`\`\`

## Pipeline

\`\`\`mermaid
flowchart LR
  A[AI draft .md] --> B[Aurora CLI]
  B --> C{Valid?}
  C -->|yes| D[Live preview]
  C -->|no| E[Lint errors]
  D --> F[Export mock]
\`\`\`

## Why this demo

Inspired by [docu.md](https://docu.md/) — the beat is **raw markdown → polished document**, not a GPL rendering engine.
`,
} as const
