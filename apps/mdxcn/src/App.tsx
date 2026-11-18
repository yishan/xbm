import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SAMPLES } from "@/lab/samples";
import { setGraphTimeScale } from "@/registry/default/graph-frame/graph-motion";
import {
  readHash,
  writeHash,
} from "@/lab/settings";
import type { FigureId, Settings, View } from "@/lab/settings";
import { Segmented } from "@/lab/Segmented";
import { Editor } from "@/lab/Editor";
import { Stage } from "@/lab/Stage";
import { Controls } from "@/lab/Controls";
import { IconMoon, IconSun } from "@/lab/icons";
import { useTheme } from "@/lab/theme";

const FIGURE_OPTIONS = SAMPLES.map((sample) => ({
  value: sample.id,
  label: sample.label,
}));

export default function App() {
  const initialHash = useMemo(() => readHash(), []);
  const [figure, setFigure] = useState<FigureId>(initialHash.figure);
  const [settings, setSettings] = useState<Settings>(initialHash.settings);
  const [drafts, setDrafts] = useState<Partial<Record<FigureId, string>>>(() => {
    if (initialHash.source !== null) {
      const draft: Partial<Record<FigureId, string>> = {};
      draft[initialHash.figure] = initialHash.source;
      return draft;
    }
    return {};
  });
  const [replayKey, setReplayKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const { dark, toggle } = useTheme();

  const sample = SAMPLES.find((item) => item.id === figure) ?? SAMPLES[0];
  const source = drafts[figure] ?? sample.source;
  const edited = drafts[figure] !== undefined && drafts[figure] !== sample.source;

  const applyGraphSpeed = useCallback(
    (speed: number) => {
      const effective = reduceMotion ? 0.01 : speed;
      setGraphTimeScale(1 / effective);
    },
    [reduceMotion],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      if (patch.speed !== undefined) {
        applyGraphSpeed(patch.speed);
      }
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [applyGraphSpeed],
  );

  useEffect(() => {
    document.documentElement.dataset.accent = settings.accent;
  }, [settings.accent]);

  useEffect(() => {
    applyGraphSpeed(settings.speed);
  }, [settings.speed, applyGraphSpeed]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeHash(figure, edited ? source : null, settings);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [figure, source, edited, settings]);

  const handleSourceChange = useCallback(
    (value: string) => {
      setDrafts((prev) => ({ ...prev, [figure]: value }));
    },
    [figure],
  );

  const handleReset = useCallback(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[figure];
      return next;
    });
    setReplayKey((key) => key + 1);
  }, [figure]);

  const handleError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const handleReplay = useCallback(() => {
    setReplayKey((key) => key + 1);
  }, []);

  const handleViewChange = useCallback(
    (view: View) => {
      updateSettings({ view });
    },
    [updateSettings],
  );

  const handleFigureChange = useCallback((nextFigure: FigureId) => {
    setFigure(nextFigure);
    setReplayKey((key) => key + 1);
  }, []);

  const themeButtonLabel = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        <div className="flex h-14 w-full items-center gap-4">
          <h1 className="font-mono text-[15px] font-semibold">
            <span className="text-[var(--graph-accent)]">md</span>xcn
          </h1>

          <div className="lab-scroll-x hidden min-w-0 flex-1 md:flex">
            <Segmented
              label="Figure"
              value={figure}
              options={FIGURE_OPTIONS}
              onChange={handleFigureChange}
              size="sm"
            />
          </div>

          <button
            type="button"
            aria-label={themeButtonLabel}
            onClick={toggle}
            className="lab-press lab-hit ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--border)] bg-card text-foreground hover:text-[var(--graph-accent)]"
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        <div className="lab-scroll-x pb-2 md:hidden">
          <Segmented
            label="Figure"
            value={figure}
            options={FIGURE_OPTIONS}
            onChange={handleFigureChange}
            size="sm"
          />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 gap-4 px-4 pb-6 sm:px-6 lg:h-[calc(100dvh-7.5rem)] lg:min-h-[600px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
        <Editor
          value={source}
          onChange={handleSourceChange}
          edited={edited}
          onReset={handleReset}
          error={error}
        />

        <div className="order-first flex min-h-0 flex-col overflow-hidden border border-[var(--border)] bg-card lg:order-none">
          <Stage
            source={source}
            settings={settings}
            replayKey={replayKey}
            onReplay={handleReplay}
            onViewChange={handleViewChange}
            onError={handleError}
          />
          <Controls settings={settings} onChange={updateSettings} />
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1440px] justify-end gap-3 px-4 pb-4 sm:px-6">
        <span className="text-xs text-muted-foreground">示例数据</span>
        <span className="text-xs text-muted-foreground">·</span>
        <a
          href="https://mdxcn.dev"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground"
        >
          mdxcn
        </a>
        <span className="text-xs text-muted-foreground">·</span>
        <a
          href="https://github.com/shadcn-labs/mdxcn/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground"
        >
          MIT © 2026 Keshav Bagaade
        </a>
      </footer>
    </div>
  );
}
