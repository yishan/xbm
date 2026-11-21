import { Panel, RadioGroup, Radio, Slider, Switch } from "@monohud/react";
import { effectiveSignal } from "./state";
import type { HudState, ThemeName, MotionPref, Hull } from "./state";

type DeckProps = {
  state: HudState;
  set: (p: Partial<HudState>) => void;
  osReducedMotion: boolean;
};

export function Deck({ state, set, osReducedMotion }: DeckProps) {
  const motionValue = osReducedMotion ? "off" : state.motion;

  return (
    <Panel title="Controls" className="hud-deck">
      <div className="hud-deck__grid">
        <div className="hud-ctl">
          <span id="hud-l-theme" className="hud-ctl__label">Theme</span>
          <RadioGroup
            aria-labelledby="hud-l-theme"
            value={state.theme}
            onValueChange={(v) => set({ theme: v as ThemeName })}
            className="hud-radios"
          >
            <Radio value="mono">Mono</Radio>
            <Radio value="sodium">Sodium</Radio>
            <Radio value="ion">Ion</Radio>
            <Radio value="ember">Ember</Radio>
          </RadioGroup>
        </div>

        <div className="hud-ctl">
          <span id="hud-l-alert" className="hud-ctl__label">Alert</span>
          <RadioGroup
            aria-labelledby="hud-l-alert"
            value={state.alert}
            onValueChange={(v) => set({ alert: v as HudState["alert"] })}
            className="hud-radios"
          >
            <Radio value="none">None</Radio>
            <Radio value="caution">Caution</Radio>
            <Radio value="red">Red</Radio>
          </RadioGroup>
        </div>

        <div className="hud-ctl">
          <span id="hud-l-motion" className="hud-ctl__label">Motion</span>
          <RadioGroup
            aria-labelledby="hud-l-motion"
            value={motionValue}
            onValueChange={(v) => set({ motion: v as MotionPref })}
            className="hud-radios"
            disabled={osReducedMotion}
          >
            <Radio value="full">Full</Radio>
            <Radio value="subtle">Subtle</Radio>
            <Radio value="off">Off</Radio>
          </RadioGroup>
        </div>

        <div className="hud-ctl">
          <span id="hud-l-model" className="hud-ctl__label">Hull model</span>
          <RadioGroup
            aria-labelledby="hud-l-model"
            value={state.model}
            onValueChange={(v) => set({ model: v as Hull })}
            className="hud-radios"
          >
            <Radio value="corvette">Corvette</Radio>
            <Radio value="frigate">Frigate</Radio>
            <Radio value="freighter">Freighter</Radio>
            <Radio value="swarm">Swarm</Radio>
          </RadioGroup>
        </div>

        <div className="hud-ctl">
          <Slider
            label="Signal"
            hideScale
            min={0}
            max={100}
            step={1}
            value={state.link ? effectiveSignal(state) : state.signal}
            onValueChange={(v) => set({ signal: v as number })}
            disabled={state.link}
          />
          <Switch checked={state.link} onCheckedChange={(c) => set({ link: c })}>
            Signal follows hull
          </Switch>
        </div>

        <div className="hud-ctl">
          <Slider
            label="Hull"
            hideScale
            min={0}
            max={100}
            step={1}
            value={state.hull}
            onValueChange={(v) => set({ hull: v as number })}
          />
        </div>

        <div className="hud-ctl">
          <Slider
            label="Warp"
            hideScale
            min={0}
            max={100}
            step={1}
            value={state.warp}
            onValueChange={(v) => set({ warp: v as number })}
          />
        </div>

        <div className="hud-ctl">
          <Slider
            label="Planet"
            hideScale
            min={0}
            max={100}
            step={1}
            value={state.planet}
            onValueChange={(v) => set({ planet: v as number })}
          />
        </div>

        <div className="hud-ctl">
          <Slider
            label="Cells"
            hideScale
            min={4}
            max={40}
            step={1}
            value={state.cells}
            onValueChange={(v) => set({ cells: v as number })}
          />
        </div>

        <div className="hud-ctl">
          <Slider
            label="Gap"
            hideScale
            min={0}
            max={6}
            step={1}
            value={state.gap}
            onValueChange={(v) => set({ gap: v as number })}
          />
        </div>
      </div>
    </Panel>
  );
}
