import { Button, useToast } from "@monohud/react";
import { toJsx } from "./state";
import type { HudState } from "./state";

export function TopBar({ state, scheme, onToggleScheme, onReset }: {
  state: HudState;
  scheme: "light" | "dark";
  onToggleScheme: () => void;
  onReset: () => void;
}) {
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toJsx(state));
      toast({ title: "JSX copied", type: "ok", timeout: 1800 });
    } catch {
      toast({ title: "Copy failed", type: "danger", timeout: 2400 });
    }
  };

  return (
    <header className="hud-top">
      <h1 className="hud-mark">Monohud</h1>
      <div className="hud-spacer" />
      <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
      <Button variant="secondary" size="sm" onClick={copy}>Copy JSX</Button>
      <Button
        variant="ghost"
        size="sm"
        className="hud-icon"
        aria-label={scheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={onToggleScheme}
      >
        {scheme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M14 11.5A6.5 6.5 0 0 1 4.5 2a6.5 6.5 0 1 0 9.5 9.5Z" />
          </svg>
        )}
      </Button>
    </header>
  );
}
