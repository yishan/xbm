# TUFFUI — plan

Pick: TUFFUI (https://x.com/yurygok/status/2120061404615192598), approved 2026-11-26.

## Scope (single page, "AI 功能上线评审台")
- Top bar: Launch review + decision pill; Rerun eval, Copy link (toast), Reset, theme toggle.
- Control deck (TUFFUI Segmented / Slider): Accent, Base, Duration, Bounce, Density, Direction (LTR/RTL), Run speed, Failure rate.
- Row 1: `EvalResults` (20 sample cases, worst first; failure rate reshapes pass / fail / regressed live) + `CasePanel` (`RunTrace` flame / breakdown replaying the selected case at Run speed).
- Row 2: `ToolApprovalQueue` (5 requests grouped by risk), `CheckpointTimeline` (5 prompt checkpoints, restore), Decision (gates + Ship / Hold / Undo).
- State in the URL hash (non-default keys only); approvals, checkpoints, decision and reviewed cases are session state.

## Constraints
- DESIGN.md: no taglines, helper text or secondary labels.
- Light + dark, RTL, reduced motion, 44px touch targets on our controls, no horizontal scroll at 390px.
- Code written with DeepSeek (aider, local) — not cloud agents; hand glue only for config, tokens and small fixes.
- Deps installed under bunfig's 3-day minimumReleaseAge (no exception needed); shadcn CLI pinned to 4.23.0 (> 3 days old).

## Verify
`bash scripts/build-all.sh tuffui && bun scripts/verify.ts tuffui`; Playwright at 1280 / 390, light / dark / reduced motion, RTL.
