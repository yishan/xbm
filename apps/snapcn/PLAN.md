# PLAN — snapcn

**Goal:** Show snapcn's Remotion product-demo components playing live in the browser, plus one composed launch clip.

**MVP:** Vite + React page; hero `LaunchScene` (TextReveal → AnswerStream → KaraokeCaptions); gallery of 5 components each in a Remotion Player; light/dark from `prefers-color-scheme` with toggle, passed as `mode` into every composition.
**Out:** video export/rendering, Remotion Lambda/Cloud, `@snapcn/mcp`, editing props in UI, real AI calls.

## Tasks
1. Scaffold Vite react-ts, bunfig 3-day rule, base `/snapcn/`.
2. Vendor snapcn core (`lib/snap-cn-ui`) + 5 components from the registry source (MIT notice kept).
3. App: theme hook, hero scene, gallery, credits.
4. build-all, shoot, video, PR.

## Stack
- Vite + React + Tailwind v4 — repo standard, single screen.
- remotion / @remotion/player / @remotion/google-fonts 4.0.473 — age-safe pin, free in-browser preview.
- culori — required by snapcn color helpers.

## Deferred
- Prop customizer, webm export via Player — not needed for the demo.
