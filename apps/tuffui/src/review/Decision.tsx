import {
  CheckCircle,
  PauseCircle,
  RocketLaunch,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/action-button";
import { Panel, Shell, ShellHeader } from "@/components/ui/surface";
import { StatusPill } from "@/components/ui/status-pill";
import { SHIP_THRESHOLD } from "./data";

export type Decision = "pending" | "shipped" | "held";

export type Gate = {
  id: string;
  label: string;
  value: string;
  ok: boolean;
};

export function gatesFor(input: {
  passRate: number;
  regressed: number;
  pendingApprovals: number;
  reviewed: number;
  reviewTarget: number;
}): Gate[] {
  const passRateValue = `${Math.round(input.passRate * 100)}%`;
  const passOk = input.passRate >= SHIP_THRESHOLD;
  const regressionsValue = String(input.regressed);
  const regressionsOk = input.regressed === 0;
  const approvalsValue =
    input.pendingApprovals === 0
      ? "Clear"
      : `${input.pendingApprovals} waiting`;
  const approvalsOk = input.pendingApprovals === 0;
  const worstValue = input.reviewTarget === 0 ? "None" : `${input.reviewed}/${input.reviewTarget}`;
  const worstOk = input.reviewed >= input.reviewTarget;

  return [
    {
      id: "pass",
      label: `Pass rate ≥ ${Math.round(SHIP_THRESHOLD * 100)}%`,
      value: passRateValue,
      ok: passOk,
    },
    {
      id: "regressions",
      label: "No regressions",
      value: regressionsValue,
      ok: regressionsOk,
    },
    {
      id: "approvals",
      label: "Approvals cleared",
      value: approvalsValue,
      ok: approvalsOk,
    },
    {
      id: "worst",
      label: "Worst 3 reviewed",
      value: worstValue,
      ok: worstOk,
    },
  ];
}

export function DecisionPanel({
  gates,
  decision,
  onDecide,
  running,
}: {
  gates: Gate[];
  decision: Decision;
  onDecide: (d: Decision) => void;
  running: boolean;
}) {
  const allOk = gates.every((gate) => gate.ok);
  const blocked = gates.filter((gate) => !gate.ok).length;

  return (
    <Shell>
      <ShellHeader
        as="h2"
        title="Decision"
        aside={
          <StatusPill tone={allOk ? "positive" : "warning"}>
            {allOk ? "Ready" : `${blocked} blocking`}
          </StatusPill>
        }
      />
      <Panel className="p-3">
        <ul className="divide-y divide-border">
          {gates.map((gate) => (
            <li
              key={gate.id}
              className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0"
            >
              <span className="flex items-center gap-2">
                <span className="sr-only">
                  {gate.ok ? "Passed" : "Blocking"}
                </span>
                <span>{gate.label}</span>
              </span>
              <span className="flex items-center gap-2 font-mono tabular-nums">
                <span>{gate.value}</span>
                {gate.ok ? (
                  <CheckCircle
                    weight="fill"
                    className="size-4 text-positive"
                    aria-hidden
                  />
                ) : (
                  <XCircle
                    weight="fill"
                    className="size-4 text-negative"
                    aria-hidden
                  />
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-3">
          <Button
            variant="primary"
            icon={RocketLaunch}
            onClick={() => onDecide("shipped")}
            disabled={!allOk || running}
            type="button"
            className="flex-1 pointer-coarse:h-11"
          >
            Ship
          </Button>
          <Button
            variant="secondary"
            icon={PauseCircle}
            onClick={() => onDecide("held")}
            disabled={running}
            type="button"
            className="flex-1 pointer-coarse:h-11"
          >
            Hold
          </Button>
          {decision !== "pending" && (
            <Button
              variant="quiet"
              onClick={() => onDecide("pending")}
              type="button"
            >
              Undo
            </Button>
          )}
        </div>
      </Panel>
    </Shell>
  );
}
