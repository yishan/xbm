import {
  Button,
  Cockpit,
  DataList,
  Gauge,
  Hologram,
  LogStream,
  Meter,
  Panel,
  Progress,
  Radar,
  Readout,
  TacticalVolume,
  Wing,
} from "@monohud/react";
import type { LogEntry, Tone } from "@monohud/react";
import { CONTACTS, SCOPE_RANGE, contactById } from "./data";
import type { HudState } from "./state";

export type LogItem = LogEntry;

type BridgeProps = {
  state: HudState;
  set: (patch: Partial<HudState>) => void;
  integrity: Record<string, number>;
  locked: boolean;
  onToggleLock: () => void;
  shot: number;
  onFire: () => void;
  log: LogEntry[];
  onJump: () => void;
  jumpReady: boolean;
};

export function Bridge({
  state,
  set,
  integrity,
  locked,
  onToggleLock,
  shot,
  onFire,
  log,
  onJump,
  jumpReady,
}: BridgeProps) {
  const target = contactById(state.target);
  const kind = target.kind ?? "neutral";
  const kindLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
  const kindTone: Tone = kind === "hostile" ? "danger" : kind === "friendly" ? "ok" : "info";

  const targetIntegrity = integrity[target.id] ?? 1;
  const targetPct = Math.round(targetIntegrity * 100);
  const integrityTone: Tone = targetPct < 30 ? "danger" : targetPct < 60 ? "warn" : "ok";

  const velocity = Math.round(12 + state.warp * 2987).toLocaleString("en-US");

  const rows = [
    { label: "Name", value: target.label },
    { label: "Class", value: target.klass },
    { label: "Range", value: `${(target.range * SCOPE_RANGE).toFixed(1)} km` },
    { label: "Bearing", value: `${String(target.bearing).padStart(3, "0")}°` },
    { label: "Stance", value: kindLabel, tone: kindTone },
  ];

  return (
    <Cockpit className="hud-bridge">
      <Wing side="left" className="hud-wing">
        <Panel title="Ship">
          <div className="hud-stack">
            <Hologram
              model={state.model}
              label="Ship hull"
              integrity={state.hull / 100}
              className="hud-holo"
            />
            <Meter
              label="Hull"
              value={state.hull}
              cells={state.cells}
              gap={state.gap}
              hideScale
              tone={state.hull < 30 ? "danger" : state.hull < 60 ? "warn" : "ok"}
            />
            <Progress
              label="Shields"
              value={Math.round(state.hull * 0.9)}
              cells={state.cells}
              gap={state.gap}
              hideScale
              tone="info"
            />
            <Progress
              label="Jump charge"
              value={state.warp}
              cells={state.cells}
              gap={state.gap}
              hideScale
            />
            <div className="hud-readouts">
              <Readout label="Velocity" value={velocity} unit="km/s" size="sm" />
              <Gauge
                label="Reactor"
                value={Math.round(35 + state.warp * 0.6)}
                unit="%"
                size={112}
                tone={state.alert === "red" ? "danger" : "accent"}
              />
            </div>
          </div>
        </Panel>
      </Wing>

      <div className="hud-center">
        <Panel title="Tactical" className="hud-tactical-panel">
          <div className="hud-stack">
            <TacticalVolume
              contacts={CONTACTS}
              label="Tactical volume"
              range={SCOPE_RANGE}
              selected={state.target}
              locked={locked}
              shot={shot}
              onSelect={(contact) => set({ target: contact.id })}
              className="hud-tactical"
            />
            <div className="hud-actions">
              <Button variant="secondary" aria-pressed={locked} onClick={onToggleLock}>
                Lock
              </Button>
              <Button variant="danger" onClick={onFire} disabled={!locked}>
                Fire
              </Button>
              <Button variant="primary" onClick={onJump} disabled={!jumpReady} className="hud-jump">
                Jump
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <Wing side="right" className="hud-wing">
        <Panel title="Target">
          <div className="hud-stack">
            <DataList rows={rows} />
            <Meter
              label="Integrity"
              value={targetPct}
              cells={state.cells}
              gap={state.gap}
              hideScale
              tone={integrityTone}
            />
          </div>
        </Panel>

        <Panel title="Scope">
          <div className="hud-stack">
            <Radar
              contacts={CONTACTS}
              label="Short-range radar"
              range={SCOPE_RANGE}
              onSelect={(contact) => set({ target: contact.id })}
              className="hud-radar"
            />
          </div>
        </Panel>

        <Panel title="Log">
          <div className="hud-stack">
            <LogStream entries={log} label="Event log" className="hud-log" />
          </div>
        </Panel>
      </Wing>
    </Cockpit>
  );
}
