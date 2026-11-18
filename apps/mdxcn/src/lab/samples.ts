export const SAMPLES = [
  { id: "flow", label: "Flow", source: `<GraphFlow title="SHIP A FIX">

report → triage → **fix** → *release*

fix → review → merge

</GraphFlow>` },
  { id: "tree", label: "Tree", source: `<GraphTree title="APP">

- app
  - web
    - routes — pages
    - **editor.tsx** — now
  - api
    - auth.ts
    - *export.ts* — next

</GraphTree>` },
  { id: "board", label: "Board", source: `<GraphBoard title="LAUNCH">

### Inbox
- Dark mode toggle
- *CSV export* — if asked twice

### Now
- **Search filters**
- Empty states

### Done
- Sign-in
- Onboarding tour

</GraphBoard>` },
  { id: "decision", label: "Decision", source: `<Decision title="EDITOR" status="accepted" date="Nov 18">

- **Plain textarea** — no runtime, fine on phones
- *Code editor* — 200 kB for syntax colors
- Rich text — loses the Markdown

Revisit if people ask for autocomplete.

</Decision>` },
  { id: "matrix", label: "Matrix", source: `<GraphMatrix title="IMPACT × EFFORT" accent="Big win">

| | Easy | Hard |
| --- | --- | --- |
| Big win | 6 | 3 |
| Small win | 9 | 4 |

</GraphMatrix>` },
  { id: "timeline", label: "Timeline", source: `<GraphTimeline title="RELEASE">

- Nov 02: Beta opens
- Nov 10: Feedback round
- **Nov 18: Public launch**
- *Dec 01: First update*

</GraphTimeline>` },
  { id: "gantt", label: "Gantt", source: `<GraphGantt title="THIS WEEK" columns={20} ticks={["mon", "wed", "fri"]}>

- design: 0 0.35
- **build**: 0.3 0.8
- review: 0.7 0.9
- *ship*: 0.9 1

</GraphGantt>` },
  { id: "heatmap", label: "Heatmap", source: `<GraphHeatmap title="VISITS">

| | 0 | 4 | 8 | 12 | 16 | 20 |
| --- | --- | --- | --- | --- | --- | --- |
| Mon | 0 | 1 | 4 | 8 | 6 | 1 |
| Tue | 0 | 0 | 5 | 9 | 4 | 2 |
| Wed | 1 | 0 | 6 | 12 | 5 | 1 |
| Thu | 0 | 2 | 4 | 7 | 8 | 3 |
| Fri | 0 | 1 | 3 | 5 | 2 | 0 |

</GraphHeatmap>` },
] as const
