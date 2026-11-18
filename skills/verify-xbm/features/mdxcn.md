# mdxcn

Markdown figure lab: MDX source on the left, the live mdxcn figure on the right (compiled in the browser), React ↔ ASCII view, accent / frame / density / font / speed controls.

## Sub-features

- `figure` radiogroup "Figure": Flow, Tree, Board, Decision, Matrix, Timeline, Gantt, Heatmap
- `editor` textarea "MDX source", grammar buttons, Reset to sample
- `view` radiogroup "View": React / ASCII; Replay; Copy MDX / Copy ASCII
- `controls` Accent swatches, Frame, Density, Font, Speed range
- `theme` Switch to dark/light theme

## How to get to it (user POV)

- Open `https://li.yishan.app/mdxcn/`, locally `http://127.0.0.1:<port>/mdxcn/` from `dist/`.
- Click the `Tree` radio.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh mdxcn` succeeded and `dist/mdxcn/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts mdxcn` clicks radio "Tree"; the figure titled `[ APP ]` renders.
- **Proof.** `.verify/<run>/mdxcn/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server.

## Gotchas

- Figures compile ~180 ms after the last keystroke; wait for the figure before asserting.
- The ASCII view uses upstream `drawMarkdown`; CJK text misaligns the frame (upstream width math).
