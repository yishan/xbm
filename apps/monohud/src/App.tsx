import { useCallback, useEffect, useRef, useState } from "react";
import { MonohudProvider, Starfield } from "@monohud/react";
import type { LogEntry } from "@monohud/react";
import { Deck } from "./hud/Deck";
import { TopBar } from "./hud/TopBar";
import { Bridge } from "./hud/Bridge";
import { useHashState, useMediaQuery, useMissionClock } from "./hud/prefs";
import { CONTACTS, contactById } from "./hud/data";
import { effectiveSignal } from "./hud/state";
import type { HudState } from "./hud/state";
import "./hud/hud.css";

type LogLevel = "info" | "ok" | "warn" | "danger";

export default function App() {
  const [state, set, reset] = useHashState();
  const osReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const narrow = useMediaQuery("(max-width: 767px)");

  const [schemeOverride, setSchemeOverride] = useState<"light" | "dark" | null>(null);
  const scheme = schemeOverride ?? (systemDark ? "dark" : "light");

  const [integrity, setIntegrity] = useState<Record<string, number>>(() =>
    Object.fromEntries(CONTACTS.map((contact) => [contact.id, 1])),
  );
  const [locked, setLocked] = useState(false);
  const [shot, setShot] = useState(0);
  const [flash, setFlash] = useState(0);
  const [log, setLog] = useState<LogEntry[]>(() => [
    { id: "l1", time: "00:00", text: "Systems online", level: "ok" },
    { id: "l2", time: "00:00", text: "Hostile contact Warden", level: "warn" },
  ]);
  const [jumpReady, setJumpReady] = useState(true);

  const clock = useMissionClock();
  const lastShotRef = useRef(0);
  const jumpTimerRef = useRef<number | null>(null);
  const prevTargetRef = useRef<string | null>(null);

  const pushLog = useCallback(
    (text: string, level: LogLevel) => {
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        time: clock(),
        text,
        level,
      };
      setLog((prev) => [entry, ...prev].slice(0, 6));
    },
    [clock],
  );

  const setWithLog = useCallback(
    (patch: Partial<HudState>) => {
      const nextAlert = patch.alert;
      if (nextAlert !== undefined && nextAlert !== state.alert) {
        const level: LogLevel = nextAlert === "none" ? "info" : nextAlert === "caution" ? "warn" : "danger";
        const text = nextAlert === "none" ? "Alert cleared" : `Alert ${nextAlert}`;
        pushLog(text, level);
      }
      set(patch);
    },
    [pushLog, set, state.alert],
  );

  const handleReset = useCallback(() => {
    reset();
    setIntegrity(Object.fromEntries(CONTACTS.map((contact) => [contact.id, 1])));
    setLocked(false);
  }, [reset]);

  useEffect(() => {
    if (prevTargetRef.current === null) {
      prevTargetRef.current = state.target;
      return;
    }

    if (prevTargetRef.current !== state.target) {
      setLocked(false);
    }

    prevTargetRef.current = state.target;
  }, [state.target]);

  const handleToggleLock = useCallback(() => {
    const next = !locked;
    const target = contactById(state.target);

    if (next) {
      pushLog(`Lock on ${target.label}`, "warn");
    } else {
      pushLog("Lock released", "info");
    }

    setLocked(next);
  }, [locked, pushLog, state.target]);

  const handleFire = useCallback(() => {
    if (!locked) return;

    const now = Date.now();
    if (now - lastShotRef.current < 600) return;
    lastShotRef.current = now;

    const target = contactById(state.target);
    const currentIntegrity = integrity[target.id] ?? 1;
    const nextValue = Math.max(0.05, Number((currentIntegrity - 0.18).toFixed(2)));
    const nextIntegrity = { ...integrity, [target.id]: nextValue };

    setIntegrity(nextIntegrity);
    setShot((current) => current + 1);
    pushLog(`Hit ${target.label} · ${Math.round(nextValue * 100)}%`, "danger");
  }, [integrity, locked, pushLog, state.target]);

  const handleJump = useCallback(() => {
    if (!jumpReady) return;

    setJumpReady(false);
    jumpTimerRef.current = window.setTimeout(() => {
      setJumpReady(true);
      jumpTimerRef.current = null;
    }, 1000);

    const motionOff = osReduced || state.motion === "off";
    if (!motionOff) {
      setFlash((current) => current + 1);
    }

    pushLog("Jump complete", "ok");
  }, [jumpReady, osReduced, pushLog, state.motion]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current !== null) {
        window.clearTimeout(jumpTimerRef.current);
      }
    };
  }, []);

  const onToggleScheme = useCallback(() => {
    const next = scheme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.add("hud-no-transition");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("hud-no-transition");
      });
    });

    setSchemeOverride(next);
  }, [scheme]);

  return (
    <MonohudProvider
      key={scheme}
      data-scheme={scheme}
      className="hud-app"
      theme={state.theme}
      motion={osReduced ? "off" : state.motion}
      detail={narrow ? "minimal" : "full"}
      distortion={effectiveSignal(state) / 100}
      alert={state.alert}
    >
      <Starfield warp={state.warp / 100} body={state.planet / 100} flash={flash} />

      <div className="hud-shell">
        <TopBar state={state} scheme={scheme} onToggleScheme={onToggleScheme} onReset={handleReset} />

        <main className="hud-main">
          <Bridge
            state={state}
            set={setWithLog}
            integrity={integrity}
            locked={locked}
            onToggleLock={handleToggleLock}
            shot={shot}
            onFire={handleFire}
            log={log}
            onJump={handleJump}
            jumpReady={jumpReady}
          />

          <Deck
            state={state}
            set={setWithLog}
            osReducedMotion={osReduced}
          />
        </main>

        <footer className="hud-foot">
          <span>示例数据</span>
          <a href="https://github.com/jshguo-labs/monohud" target="_blank" rel="noreferrer">
            Monohud
          </a>
          <a
            href="https://github.com/jshguo-labs/monohud/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT © 2026 Joshua Guo
          </a>
        </footer>
      </div>
    </MonohudProvider>
  );
}
