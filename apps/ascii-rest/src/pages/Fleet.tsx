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
    .join("\n") + "\nascii-rest/\n  this pr (open)";

const BARS = {
  title: "merged/week",
  labels: FLEET.perWeek.labels,
  datasets: [
    { name: "demos", values: FLEET.perWeek.demos },
    { name: "prs", values: FLEET.perWeek.prs },
  ],
};

const firstDay = FLEET.demos[0].merged.slice(0, 10);

export function Fleet() {
  const [theme] = useTheme();

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader page="fleet" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-xl font-semibold">agent fleet terminal</h1>
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
            testId="panel-demos"
            title="live demos"
            subtitle="apps/ on main + this PR"
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
