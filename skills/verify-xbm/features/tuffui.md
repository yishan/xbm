# tuffui

AI launch review desk built from real TUFFUI registry components: eval results grid (worst first), run trace flame graph for the selected case, risk-grouped tool approval queue, checkpoint timeline, and a ship / hold decision with gates. A control deck retunes TUFFUI's theme and motion tokens live.

## Sub-features

- `top` h1 "Launch review", decision pill (aria-live: Awaiting decision / Shipped / On hold); Rerun eval, Copy link (toast), Reset, Switch to light/dark theme
- `controls` radiogroups Accent / Base / Density / Direction; sliders Duration, Bounce, Run speed, Failure rate (all in the URL hash: a b d bo den dir sp f)
- `eval` EvalResults "Eval results: Support reply assistant": 20 grid cells (arrow keys move), filters All / Failed / Regressed / Improved; selecting a cell sets `c=<id>` in the hash and shows input / expected / actual
- `trace` CasePanel for the selected case: Trace view Flame / Breakdown, Replay run; RunTrace plays at Run speed
- `approvals` ToolApprovalQueue "Permission requests" (5 pending, grouped by risk; approve / deny / undo)
- `checkpoints` CheckpointTimeline "Checkpoints" (scrub, restore with confirm)
- `decision` gates Pass rate ≥ 85% / No regressions / Approvals cleared / Worst 3 reviewed; Ship (disabled until every gate passes), Hold, Undo

## How to get to it (user POV)

- Open `https://li.yishan.app/tuffui/`, locally `http://127.0.0.1:<port>/tuffui/` from `dist/`.
- Click `Hold` in the Decision panel.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh tuffui` succeeded and `dist/tuffui/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts tuffui` clicks button "Hold"; the top bar pill reads `On hold`.
- **Proof.** `.verify/<run>/tuffui/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server. To make Ship enabled: Failure rate to 0 (slider, ArrowLeft ×4), then approve all five requests.

## Gotchas

- The "Rerun eval" text is visually hidden below 640px; its accessible name stays.
- `Hold` also matches nothing else; `Ship` is disabled at the default 20% failure rate (pass rate 70%).
- Slider values are wrapped in Unicode isolates (U+2066/U+2069) so units stay put under RTL; match aria-valuetext with a regex.
