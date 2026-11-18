import { useEffect, useRef, useState } from "react";
import * as registry from "@/registry/default";
import { GraphFrameProvider } from "@/registry/default/graph-frame/graph-frame";
import { toAscii } from "@/lib/ascii";
import { fence } from "@/registry/default/graph-knap/frame";
import { FigureBoundary, useMdx } from "./useMdx";
import { Segmented } from "./Segmented";
import { IconCheck, IconCopy, IconReplay } from "./icons";
import { withFrame } from "./settings";
import type { Settings, View } from "./settings";

type StageProps = {
  source: string;
  settings: Settings;
  replayKey: number;
  onReplay: () => void;
  onViewChange: (view: View) => void;
  onError?: (message: string | null) => void;
};

const graphComponents = registry as unknown as Record<string, unknown>;

export function Stage({
  source,
  settings,
  replayKey,
  onReplay,
  onViewChange,
  onError,
}: StageProps) {
  const { Content, error, version } = useMdx(source);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "failed" | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    let text = "";
    if (settings.view === "react") {
      text = source;
    } else {
      try {
        text = fence(toAscii(withFrame(source, settings.frame)));
      } catch {
        text = source;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("copied");
    } catch {
      setCopyFeedback("failed");
    }

    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => setCopyFeedback(null), 1600);
  };

  const asciiText = (() => {
    try {
      return toAscii(withFrame(source, settings.frame));
    } catch {
      return source;
    }
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3">
        <Segmented
          label="View"
          value={settings.view}
          options={[
            { value: "react", label: "React" },
            { value: "ascii", label: "ASCII" },
          ]}
          onChange={onViewChange}
          size="sm"
        />

        <div className="flex items-center gap-2">
          {settings.view === "react" ? (
            <button
              type="button"
              onClick={onReplay}
              className="lab-press lab-hit inline-flex h-8 items-center gap-1.5 border border-[var(--border)] px-3 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <IconReplay />
              Replay
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleCopy}
            className="lab-press lab-hit inline-flex h-8 items-center gap-1.5 border border-[var(--border)] px-3 text-[13px] text-muted-foreground hover:text-foreground"
          >
            {copyFeedback === "copied" ? <IconCheck /> : <IconCopy />}
            {copyFeedback === "copied"
              ? "Copied"
              : copyFeedback === "failed"
                ? "Copy failed"
                : settings.view === "react"
                  ? "Copy MDX"
                  : "Copy ASCII"}
          </button>
        </div>

        <span aria-live="polite" className="sr-only">
          {copyFeedback === "copied" ? "Copied" : copyFeedback === "failed" ? "Copy failed" : ""}
        </span>
      </div>

      <div
        className="lab-stage flex-1 overflow-auto p-6 sm:p-10"
        data-density={settings.density}
        data-font={settings.font}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[640px] items-center justify-center">
          {settings.view === "react" ? (
            <FigureBoundary resetKey={`${version}:${replayKey}`} onError={(message) => onError?.(message)}>
              <GraphFrameProvider frame={settings.frame}>
                {Content ? <Content key={`${version}:${replayKey}`} components={graphComponents} /> : null}
              </GraphFrameProvider>
            </FigureBoundary>
          ) : (
            <pre className="lab-ascii" aria-label="ASCII figure">
              {asciiText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
