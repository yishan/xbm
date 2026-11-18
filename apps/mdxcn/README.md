# mdxcn

Write Markdown on the left and watch the mdxcn figure draw itself on the right: Flow, Tree, Board, Decision, Matrix, Timeline, Gantt and Heatmap, with live accent, frame, density, font and motion speed, and the same text as a fenced ASCII figure for README, PR or Linear.

- Library: [mdxcn](https://mdxcn.dev) by Shadcn Labs (MIT, © 2026 Keshav Bagaade). The registry source is vendored in `src/registry/` with its `LICENSE`; the page never calls the mdxcn.dev API.
- Local patch: `src/registry/default/graph-frame/graph-motion.ts` adds `setGraphTimeScale()` for the speed control. Everything else in `src/registry/` is upstream @ `884eba5`, except one unused import removed in `graph-comark/from-markdown.tsx` and `index.ts` re-exporting the Knap filters from `graph-knap/filters` (the `knap` package is not installed).
- Every state is a link: figure, settings and edited source live in the URL hash.
- Run: `bun install && bun run dev` → http://localhost:5173/mdxcn/
- All sample content is 示例数据.
