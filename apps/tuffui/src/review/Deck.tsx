import {
  ACCENTS,
  ACCENT_HUE,
  BASES,
  DEFAULTS,
  type ReviewState,
} from "./state";
import { Segmented } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/range-slider";
import { Panel, Shell } from "@/components/ui/surface";

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function Deck({
  state,
  set,
}: {
  state: ReviewState;
  set: (p: Partial<ReviewState>) => void;
}) {
  return (
    <Shell aria-label="Controls">
      <Panel className="p-3">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <span
              id="accent-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Accent
            </span>
            <Segmented
              label="Accent"
              value={state.accent}
              onValueChange={(value) =>
                set({ accent: value as ReviewState["accent"] })
              }
              options={ACCENTS.map((accent) => ({
                value: accent,
                label: (
                  <>
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{
                        background: `oklch(0.62 0.19 ${ACCENT_HUE[accent]})`,
                      }}
                    />
                    {cap(accent)}
                  </>
                ),
              }))}
            />
          </div>

          <div className="space-y-2">
            <span
              id="base-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Base
            </span>
            <Segmented
              label="Base"
              value={state.base}
              onValueChange={(value) =>
                set({ base: value as ReviewState["base"] })
              }
              options={BASES.map((base) => ({
                value: base,
                label: cap(base),
              }))}
            />
          </div>

          <Slider
            label="Duration"
            value={state.duration}
            defaultValue={DEFAULTS.duration}
            onValueChange={(value) => set({ duration: value })}
            min={0}
            max={400}
            step={10}
            format={(v) => `\u2066${v} ms\u2069`}
          />

          <Slider
            label="Bounce"
            value={state.bounce}
            defaultValue={DEFAULTS.bounce}
            onValueChange={(value) => set({ bounce: value })}
            min={0}
            max={0.3}
            step={0.05}
            format={(v) => v.toFixed(2)}
          />

          <div className="space-y-2">
            <span
              id="density-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Density
            </span>
            <Segmented
              label="Density"
              value={state.density}
              onValueChange={(value) =>
                set({ density: value as ReviewState["density"] })
              }
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <span
              id="dir-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Direction
            </span>
            <Segmented
              label="Direction"
              value={state.dir}
              onValueChange={(value) =>
                set({ dir: value as ReviewState["dir"] })
              }
              options={[
                { value: "ltr", label: "LTR" },
                { value: "rtl", label: "RTL" },
              ]}
            />
          </div>

          <Slider
            label="Run speed"
            value={state.speed}
            defaultValue={DEFAULTS.speed}
            onValueChange={(value) => set({ speed: value })}
            min={0.5}
            max={4}
            step={0.5}
            format={(v) => `\u2066${v}×\u2069`}
          />

          <Slider
            label="Failure rate"
            value={state.failure}
            defaultValue={DEFAULTS.failure}
            onValueChange={(value) => set({ failure: value })}
            min={0}
            max={60}
            step={5}
            format={(v) => `\u2066${v}%\u2069`}
          />
        </div>
      </Panel>
    </Shell>
  );
}
