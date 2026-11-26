import {
  ArrowClockwise,
  ArrowCounterClockwise,
  LinkSimple,
  Moon,
  PauseCircle,
  RocketLaunch,
  Sun,
} from "@phosphor-icons/react";
import { Button, IconButton } from "@/components/ui/action-button";
import { StatusPill } from "@/components/ui/status-pill";
import type { Decision } from "./Decision";

export function TopBar({
  decision,
  dark,
  onToggleTheme,
  onRerun,
  running,
  onCopyLink,
  onReset,
}: {
  decision: Decision;
  dark: boolean;
  onToggleTheme: () => void;
  onRerun: () => void;
  running: boolean;
  onCopyLink: () => void;
  onReset: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-balance">
          Launch review
        </h1>
        <div aria-live="polite">
          <StatusPill
            size="md"
            tone={
              decision === "pending"
                ? "neutral"
                : decision === "shipped"
                  ? "positive"
                  : "warning"
            }
            icon={
              decision === "shipped"
                ? RocketLaunch
                : decision === "held"
                  ? PauseCircle
                  : undefined
            }
          >
            {decision === "pending"
              ? "Awaiting decision"
              : decision === "shipped"
                ? "Shipped"
                : "On hold"}
          </StatusPill>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          icon={ArrowClockwise}
          loading={running}
          onClick={onRerun}
          type="button"
          className="pointer-coarse:h-11"
        >
          <span className="max-sm:sr-only">Rerun eval</span>
        </Button>
        <IconButton
          icon={LinkSimple}
          iconWeight="bold"
          label="Copy link"
          onClick={onCopyLink}
          type="button"
          tooltip={true}
          className="pointer-coarse:size-11"
        />
        <IconButton
          icon={ArrowCounterClockwise}
          label="Reset"
          onClick={onReset}
          type="button"
          tooltip={true}
          className="pointer-coarse:size-11"
        />
        <IconButton
          icon={dark ? Sun : Moon}
          label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={onToggleTheme}
          type="button"
          tooltip={true}
          className="pointer-coarse:size-11"
        />
      </div>
    </header>
  );
}
