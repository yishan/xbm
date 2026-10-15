# PLAN — manimgx

**Goal:** Curated gallery of official ManimGX showcase scenes with playback beside the Python scene code.

**MVP:** Vite + React page at `/manimgx/`; 3 official scenes (quadratic formula, Fourier π, Lorenz attractor); GIF playback from public showcase assets; syntax-highlighted Python beside each clip; `prefers-color-scheme` on first load with an optional toggle; credit Academa Labs / ManimGX (MIT).
**Out:** In-browser Python editor; live Pyodide/WebGPU render via npm `manimgx`; custom scenes; video export.

## Tasks
1. Scaffold Vite react-ts + bunfig 3-day rule + `base: "/manimgx/"`.
2. Vendor official showcase GIFs + scene `.py` sources (MIT; keep notices).
3. App shell: theme hook, scene picker/gallery cards, code panel, credits.
4. build-all, shoot light/dark, demo.webm, verify-xbm, tracking entry, unmerged PR.

## Stack
- Vite + React + Tailwind v4 — repo standard, single-screen gallery.
- shadcn/ui (button, card, tabs/badge as needed) — minimal chrome.
- Official ManimGX showcase GIFs + examples/*.py — public MIT samples only (「示例数据」 where synthetic).

## Deferred
- npm `manimgx` 0.1.1 browser/WASM path (WebGPU + Pyodide) — heavy for headless verify; GIFs are the reliable gallery path tonight.
- In-browser editor — explicitly out of scope for this build.
