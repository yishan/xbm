import { AsciiFrame } from "@/components/AsciiFrame";
import { FleetPanel } from "@/components/FleetPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useTheme } from "@/lib/theme";
import { PIECES, FLEET } from "@/lib/types";
import type { PieceInfo, Run } from "@/lib/types";

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

const TONIGHT = {
  title: "tonight 10-09",
  start: "19:50",
  flights: [
    ["19:55", "pick", "08", "done"],
    ["22:00", "build", "08", "skipped"],
    ["00:07", "approve", "09", "approved"],
    ["00:25", "build", "09", "running"],
    ["05:53", "report", "09", "scheduled"],
  ],
};

const RUNS: string[][] = FLEET.runs
  .filter((run: Run) => run.at !== null)
  .map((run: Run) => [
    run.at as string,
    run.slug.split("-")[0].slice(0, 9),
    run.date.slice(8, 10),
    run.result,
  ]);

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
            Yishan&apos;s agent fleet as a status page, drawn only with ascii.rest pieces. Numbers come from{" "}
            <code className="font-mono text-xs">git log --first-parent origin/main</code> in xbm (head{" "}
            {FLEET.head}) and the nightly run notes on the build box. Panels marked example data are simulated
            by the piece itself.
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
            <Piece id="big-text" options={{ text: "xbm fleet" }} tone="text-signal" />
          </FleetPanel>

          <FleetPanel
            testId="panel-tonight"
            title="tonight"
            subtitle="nightly pipeline 2026-10-09"
            source={"xbm-nightly/2026-10-09 pick.md + status.md · " + FLEET.sources.schedule}
          >
            <Piece id="split-flap" options={TONIGHT} />
          </FleetPanel>

          <FleetPanel
            testId="panel-runs"
            title="nightly runs"
            subtitle="one row per night, finish time"
            source={FLEET.sources.runs}
          >
            <Piece id="split-flap" options={{ title: "nightly runs", start: RUNS[0][0], flights: RUNS }} />
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
            testId="panel-schedule"
            className="md:col-span-2"
            title="schedule"
            subtitle="Asia/Shanghai"
            source={FLEET.sources.schedule}
          >
            <Piece
              id="typewriter"
              options={{
                prefix: "nightly: ",
                phrases: ["19:55 pick a bookmark.", "22:00 build the demo.", "05:53 report to yishan."],
              }}
            />
          </FleetPanel>

          <FleetPanel
            testId="panel-clock"
            title="local time"
            subtitle="your browser clock"
            source="the reader's clock (live)"
          >
            <Piece id="digital-clock" />
          </FleetPanel>

          <FleetPanel
            testId="panel-health"
            example
            title="routine health"
            subtitle="60-day bars"
            source="example data: ascii.rest uptime-bar draws its own bars; only the three routine names are real"
          >
            <Piece id="uptime-bar" options={{ services: ["pick 19:55", "build 22:00", "report 05:53"] }} />
          </FleetPanel>
        </div>

        <p className="text-xs text-muted-foreground">
          Not used: boot-log and terminal (they play fixed sessions and take no lines), so the pipeline is shown
          on split-flap boards instead.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
