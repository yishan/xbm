import { useMemo } from "react";
import { Ascii } from "ascii.rest/react";
import { barChart, typewriter } from "ascii.rest/kit";
import { AsciiFrame } from "@/components/AsciiFrame";
import { FleetPanel } from "@/components/FleetPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useTheme } from "@/lib/theme";
import { PIECES, FLEET } from "@/lib/types";
import type { PieceInfo } from "@/lib/types";

const info = (id: PieceInfo["id"]) => PIECES.find((p) => p.id === id)!;

function Piece({
  id,
  options,
  tone,
}: {
  id: PieceInfo["id"];
  options?: Record<string, unknown>;
  tone?: string;
}) {
  return (
    <AsciiFrame
      piece={id}
      cols={info(id).cols}
      rows={info(id).rows}
      canvas={info(id).canvas}
      options={options}
      tone={tone}
    />
  );
}

const TREE =
  FLEET.demos
    .map((demo) => `${demo.slug}/\n  pr-${demo.pr} ${demo.merged.slice(5, 10)}`)
    .join("\n");

const BARS = {
  title: "merged/week",
  labels: FLEET.perWeek.labels,
  datasets: [
    { name: "demos", values: FLEET.perWeek.demos },
    { name: "prs", values: FLEET.perWeek.prs },
  ],
};

/** A piece made with ascii.rest/kit (new in 0.4). Coloured kit pieces draw on a canvas, so size it by the piece's own cols. */
function KitPiece({ make, label, className, cellPx = 14, deps }: { make: () => ReturnType<typeof barChart>; label: string; className?: string; cellPx?: number; deps: unknown[] }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const piece = useMemo(make, deps);
  const cols = (piece as unknown as { meta: { cols: number } }).meta.cols;
  return (
    <div className="w-full min-w-0 overflow-hidden" style={{ containerType: "inline-size" }}>
      <Ascii piece={piece} label={label} className={"art mx-auto block w-fit " + (className ?? "")} style={{ width: `min(100cqw, ${Math.round(cols * cellPx * 0.62)}px)`, fontSize: `min(${cellPx}px, calc(100cqw / ${(cols * 0.62).toFixed(2)}))` }} />
    </div>
  );
}

const SHIPPED: Record<string, number> = Object.fromEntries(
  FLEET.shippedPerWeek.labels.map((label, i) => [label, FLEET.shippedPerWeek.demos[i]]),
);
const SHIPPED_TOTAL = FLEET.shippedPerWeek.demos.reduce((a, b) => a + b, 0);

const firstDay = FLEET.demos[0].merged.slice(0, 10);

export function Fleet() {
  const [theme] = useTheme();

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader page="fleet" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-xl font-semibold" data-testid="typewriter-title">
            <span className="sr-only">agent fleet terminal</span>
            <span aria-hidden="true" className="block min-h-[1.6em]">
              <KitPiece key={theme} make={() => typewriter("agent fleet terminal_", { speed: "slow", width: 24, hold: 4 })} cellPx={20} label="agent fleet terminal, typed out" deps={[]} />
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            The xbm demo gallery as a status page, drawn only with ascii.rest pieces: demos per week and merged
            PRs, from{" "}
            <code className="font-mono text-xs">git log --first-parent origin/main</code> in xbm (head{" "}
            {FLEET.head}).
          </p>
        </div>

        <div key={theme} className="grid gap-3 md:grid-cols-2">
          <FleetPanel
            testId="panel-banner"
            className="md:col-span-2"
            title="fleet"
            subtitle={`${FLEET.demos.length} live demos · ${FLEET.merges.length} merged PRs · since ${firstDay}`}
            source={FLEET.sources.demos}
          >
            <Piece id="big-text" options={{ text: "xge fleet" }} tone="text-signal" />
          </FleetPanel>

          <FleetPanel
            testId="panel-shipped"
            className="md:col-span-2"
            title="demos shipped per week"
            subtitle={`ascii.rest/kit barChart · ${SHIPPED_TOTAL} demos · weeks start monday`}
            source={FLEET.sources.shipped}
          >
            <KitPiece
              key={theme}
              make={() => barChart(SHIPPED, { values: true, size: 9, color: { light: "#15803d", dark: "#4ade80" }, name: "demos shipped per week" })}
              cellPx={22}
              label={`demos shipped per week: ${FLEET.shippedPerWeek.labels.map((l, i) => `${l} ${FLEET.shippedPerWeek.demos[i]}`).join(", ")}`}
              deps={[]}
            />
          </FleetPanel>

          <FleetPanel
            testId="panel-demos"
            title="live demos"
            subtitle="apps/ on main"
            source={FLEET.sources.demos}
          >
            <Piece id="file-tree" options={{ root: "apps", entries: TREE }} />
          </FleetPanel>

          <FleetPanel
            testId="panel-weeks"
            title="merged per week"
            subtitle="weeks start monday"
            source={`${FLEET.sources.demos}; ${FLEET.sources.prs}`}
          >
            <Piece id="bar-chart" options={BARS} />
          </FleetPanel>

          <FleetPanel
            testId="panel-clock"
            title="local time"
            subtitle="your browser clock"
            source="the reader's clock (live)"
          >
            <Piece id="digital-clock" />
          </FleetPanel>

        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
