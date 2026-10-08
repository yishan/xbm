import { useMemo } from "react";
import { Ascii } from "ascii.rest/react";
import type { PieceName } from "ascii.rest";

import { cn } from "@/lib/utils";
import type { FpsChoice } from "@/lib/types";

export type AsciiFrameProps = {
  piece: PieceName;
  cols: number;
  rows: number;
  canvas: boolean;
  fps?: FpsChoice;
  mono?: boolean;
  options?: Record<string, unknown>;
  label?: string;
  className?: string;
  tone?: string;
  /** Cell height in widths for canvas pieces (meta.cell, 2 by default). */
  cell?: number;
  /** Fit inside a parent with a fixed height (gallery cards) instead of filling the width. */
  box?: boolean;
  /** Largest font size in px for text pieces when filling the width. */
  maxPx?: number;
};

const NATIVE = "native";

export function AsciiFrame(props: AsciiFrameProps) {
  const { piece, cols, rows, canvas, fps = NATIVE, mono, options, label, className, tone, cell = 2, box = false, maxPx = 16 } = props;

  const opts = useMemo(
    () => ({ ...(options ?? {}), ...(fps === NATIVE ? {} : { fps }) }),
    // Only rebuild when the serialised overrides or the fps actually change.
    [JSON.stringify(options), fps],
  );

  return (
    <div
      data-testid="ascii-frame"
      data-piece={piece}
      data-rows={rows}
      className={cn("w-full min-w-0 overflow-hidden", box && "flex h-full items-center justify-center", className)}
      style={{ containerType: box ? "size" : "inline-size" }}
    >
      {!canvas || mono ? (
        <Ascii
          piece={piece}
          options={opts}
          mono={mono}
          label={label}
          className={cn("art mx-auto w-fit", tone)}
          style={{
            // cols characters across the width (and rows lines down the height in a box)
            fontSize: box
              ? `min(calc(100cqw / ${(cols * 0.62).toFixed(2)}), calc(100cqh / ${(rows * 1.22).toFixed(2)}))`
              : `min(${maxPx}px, calc(100cqw / ${(cols * 0.62).toFixed(2)}))`,
          }}
        />
      ) : (
        <Ascii
          piece={piece}
          options={opts}
          label={label}
          className="mx-auto block rounded-md"
          // as wide as fits: the library keeps the aspect ratio cols / (rows * cell)
          style={box ? { width: `min(100cqw, calc(100cqh * ${(cols / (rows * cell)).toFixed(4)}))` } : { width: "100%" }}
        />
      )}
    </div>
  );
}
