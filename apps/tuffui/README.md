# TUFFUI

An AI launch review desk built from real TUFFUI components: 20 eval cases worst first, the failing run's trace as a flame graph, a risk-grouped tool approval queue, prompt checkpoints, and a ship / hold decision gated on pass rate, regressions, approvals and the worst three cases — with the theme and motion tokens, density, LTR / RTL, run speed and failure rate on live controls.

- Library: [TUFFUI](https://github.com/yurigdesigner/tuffui) (MIT, © 2026 TUFFUI contributors), installed with `shadcn add https://tuffui.com/r/<item>.json`: eval-results, run-trace, tool-approval-queue, checkpoint-timeline, segmented-control, range-slider, choice-controls, action-button, status-pill, toast-stack (+ their registry deps). License: [THIRD_PARTY_LICENSE-TUFFUI.md](./THIRD_PARTY_LICENSE-TUFFUI.md). Deps: motion, radix-ui, @phosphor-icons/react (MIT); Geist / Geist Mono (OFL).
- Local patch: `src/lib/motion-tokens.ts` makes `spring` / `enter` / `exit` mutable with `setMotionTokens()`, so Duration and Bounce retune every installed component live. `src/index.css` hangs the surface ramp off `--base-h` / `--base-c` and the accent off `--accent-h`.
- Every control lives in the URL hash (`a b d bo den dir sp f c`); the theme follows `prefers-color-scheme`, with a toggle.
- Reduced motion: all TUFFUI motion runs under `MotionConfig reducedMotion="user"`; the simulated runs still play because they are data, not decoration.
- Run: `bun install && bun run dev` → http://localhost:5173/tuffui/
- Code in `src/review/` and `src/App.tsx` was written with DeepSeek through aider (local), not cloud agents.
- All cases, traces, tool requests and checkpoints are 示例数据.
