export const apiNotes = {
  id: "api-notes",
  title: "API Notes",
  subtitle: "Endpoints, auth, and a sequence diagram",
  filename: "API.md",
  markdown: `# Preview API Notes

> **Info:** Internal notes for the mock Preview Service. All examples are fictional.

## Auth

Requests use a bearer token. Tokens expire after **24h**.

\`\`\`http
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/v1/docs\` | List sample documents |
| \`GET\` | \`/v1/docs/:id\` | Fetch one document |
| \`POST\` | \`/v1/render\` | Render markdown → HTML |
| \`POST\` | \`/v1/export\` | Export (PDF real, DOCX/EPUB mocked) |

### \`POST /v1/render\`

\`\`\`json
{
  "markdown": "# Hello",
  "theme": "dark",
  "diagrams": true
}
\`\`\`

Response:

\`\`\`json
{
  "html": "<article>…</article>",
  "diagrams": 1,
  "ms": 42
}
\`\`\`

> **Warning:** In this demo only PDF (Cloudflare Worker) and HTML (client-side) export are real; DOCX / EPUB are mocked.

## Sequence

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant A as App Shell
  participant R as Renderer
  participant M as Mermaid
  U->>A: Select doc
  A->>R: markdown string
  R->>M: fence body
  M-->>R: SVG
  R-->>A: HTML + SVG
  A-->>U: Preview pane
\`\`\`

## Error codes

| Code | Meaning |
|------|---------|
| \`400\` | Invalid markdown payload |
| \`404\` | Unknown document id |
| \`429\` | Rate limited (demo never hits this) |
`,
} as const
