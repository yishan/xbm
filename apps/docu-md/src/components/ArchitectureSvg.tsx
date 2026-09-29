// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

type Layer = {
  index: number;
  title: string;
  detail: string;
  rect: string;
  badge: string;
};

const LAYERS: Layer[] = [
  {
    index: 1,
    title: 'Shell',
    detail: 'sidebar · toolbar · theme · export',
    rect: 'fill-sky-100 stroke-sky-400 dark:fill-sky-950/40 dark:stroke-sky-700',
    badge: 'fill-sky-500',
  },
  {
    index: 2,
    title: 'Documents',
    detail: 'sample .md modules',
    rect: 'fill-violet-100 stroke-violet-400 dark:fill-violet-950/40 dark:stroke-violet-700',
    badge: 'fill-violet-500',
  },
  {
    index: 3,
    title: 'Renderer',
    detail: 'react-markdown · GFM · highlight',
    rect: 'fill-emerald-100 stroke-emerald-400 dark:fill-emerald-950/40 dark:stroke-emerald-700',
    badge: 'fill-emerald-500',
  },
  {
    index: 4,
    title: 'Diagrams',
    detail: 'Mermaid MIT · ArchitectureSvg',
    rect: 'fill-amber-100 stroke-amber-400 dark:fill-amber-950/40 dark:stroke-amber-700',
    badge: 'fill-amber-500',
  },
];

const X = 40;
const W = 480;
const H = 56;
const GAP = 16;
const TOP = 48;
const CX = X + W / 2;
const BOTTOM = TOP + (LAYERS.length - 1) * (H + GAP) + H;
const RULE_X = 528;

export function ArchitectureSvg() {
  return (
    <div
      className="border rounded-xl bg-muted/20 p-2"
      data-testid="architecture-svg"
    >
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label="Architecture map: shell, documents, renderer, and diagrams"
        className="w-full h-auto"
      >
        <text
          x={X}
          y={26}
          fill="currentColor"
          className="text-[13px] font-semibold text-foreground"
        >
          Readable non-crossing layout
        </text>

        {LAYERS.map((layer, i) => {
          const y = TOP + i * (H + GAP);
          return (
            <g key={layer.title}>
              {i > 0 && (
                <line
                  x1={CX}
                  y1={y - GAP}
                  x2={CX}
                  y2={y}
                  strokeWidth={1.5}
                  className="stroke-border"
                />
              )}

              <rect
                x={X}
                y={y}
                width={W}
                height={H}
                rx={12}
                strokeWidth={1.5}
                className={layer.rect}
              />

              <circle cx={X + 36} cy={y + H / 2} r={12} className={layer.badge} />
              <text
                x={X + 36}
                y={y + H / 2 + 4}
                textAnchor="middle"
                fill="currentColor"
                className="text-[12px] font-semibold text-white"
              >
                {layer.index}
              </text>

              <text
                x={X + 64}
                y={y + 24}
                fill="currentColor"
                className="text-[15px] font-semibold text-foreground"
              >
                {layer.title}
              </text>
              <text
                x={X + 64}
                y={y + 42}
                fill="currentColor"
                className="text-[11px] text-muted-foreground"
              >
                {layer.detail}
              </text>
            </g>
          );
        })}

        <line
          x1={RULE_X}
          y1={TOP}
          x2={RULE_X}
          y2={BOTTOM}
          strokeWidth={1}
          strokeDasharray="4 4"
          className="stroke-border"
        />

        <text
          x={RULE_X + 10}
          y={(TOP + BOTTOM) / 2 - 6}
          fill="currentColor"
          className="text-[11px] font-medium text-muted-foreground"
        >
          permissive stack
        </text>
        <text
          x={RULE_X + 10}
          y={(TOP + BOTTOM) / 2 + 10}
          fill="currentColor"
          className="text-[11px] text-muted-foreground"
        >
          no GPL engine
        </text>
      </svg>
    </div>
  );
}
