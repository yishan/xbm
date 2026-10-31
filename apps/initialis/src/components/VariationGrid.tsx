import { useEffect, useRef, useState } from "react";

import { CapCanvas } from "@/components/CapCanvas";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { mutateCap, type CapSettings } from "@/lib/initialis";
import { themed } from "@/lib/theme";

const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const DEBOUNCE_MS = 120;
const DEFAULT_AMOUNT = 0.35;

type VariationGridProps = {
  base: CapSettings;
  dark: boolean;
  onPick: (s: CapSettings) => void;
};

/** Eight randomised siblings of `base`; clicking one hands it back to the page. */
export function VariationGrid({ base, dark, onPick }: VariationGridProps) {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [batch, setBatch] = useState(1);
  const [variations, setVariations] = useState<CapSettings[]>([]);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  // Keep the freshest `base` without making it an effect dependency: an inline
  // object literal from the parent must not restart the batch on every render.
  const baseRef = useRef(base);
  baseRef.current = base;
  const baseKey = JSON.stringify(base);

  useEffect(() => {
    let cancelled = false;
    const current = baseRef.current;
    const letter = current.text;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const next = await Promise.all(
            SLOTS.map(async (i) => {
              const variant = await mutateCap(current, amount, batch * 1000 + i + 1);
              return letter === undefined ? variant : { ...variant, text: letter };
            }),
          );
          if (cancelled) return;
          setVariations(next);
          setFailed(false);
        } catch {
          if (cancelled) return;
          setFailed(true);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [baseKey, amount, batch]);

  const percent = Math.round(amount * 100);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-medium text-wrap-balance">变体</h2>
        <span className="text-[13px] text-muted-foreground tabular-nums" aria-live="polite">
          {picked === null ? "点一个，换成它" : `已采用变体 ${picked}`}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span id="variation-amount-label" className="text-[13px] text-muted-foreground">
            变化幅度
          </span>
          <span className="text-[13px] text-muted-foreground tabular-nums">{percent}%</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-coarse:min-h-11 pointer-coarse:min-w-11 active:scale-[0.96]"
          onClick={() => setBatch((n) => n + 1)}
        >
          再来一组
        </Button>
      </div>

      <Slider
        aria-labelledby="variation-amount-label"
        min={0}
        max={1}
        step={0.01}
        value={[amount]}
        onValueChange={(next) => setAmount(next[0] ?? 0)}
      />

      {failed ? (
        <p className="text-[13px] text-muted-foreground" role="status">
          这一组没能生成，再点一次「再来一组」试试。
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {variations.length === 0
          ? SLOTS.map((i) => (
              <div key={`pending-${i}`} className="rounded-xl p-2" aria-hidden="true">
                <div className="aspect-square w-full rounded-lg bg-muted" />
              </div>
            ))
          : variations.map((variant, i) => (
              <button
                key={`${batch}-${i}`}
                type="button"
                aria-label={`采用变体 ${i + 1}`}
                onClick={() => {
                  setPicked(i + 1);
                  onPick(variant);
                }}
                className="flex items-center justify-center rounded-xl bg-card p-2 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[var(--elevation-raised)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:translate-y-0 active:scale-[0.96]"
              >
                <CapCanvas settings={themed(variant, dark)} size={150} label={`变体 ${i + 1}`} />
              </button>
            ))}
      </div>
    </section>
  );
}
