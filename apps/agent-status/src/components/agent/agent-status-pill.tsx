import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, LoaderCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { STATE_META, TONE_CLASSES } from "@/lib/agent";
import type { AgentState } from "@/lib/agent";

export type AgentStatusPillProps = {
  state: AgentState;
  label?: string;
  size?: "sm" | "md";
  showHint?: boolean;
  className?: string;
};

/** Small per-state glyph shown in the 14px indicator box. */
function StateIndicator({ state }: { state: AgentState }) {
  const reduce = useReducedMotion();
  const tone = TONE_CLASSES[STATE_META[state].tone];

  const glyph = (() => {
    switch (state) {
      case "idle":
        return <span className={cn("size-1.5 rounded-full", tone.dot)} />;

      case "thinking":
        return (
          <span className="flex items-center gap-[2px]">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={cn("size-1 rounded-full", tone.dot)}
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }
                }
              />
            ))}
          </span>
        );

      case "tool":
        return (
          <motion.span
            className={cn("flex items-center justify-center", tone.text)}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={reduce ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <LoaderCircle size={14} aria-hidden="true" />
          </motion.span>
        );

      case "approval":
        return (
          <span className="relative flex items-center justify-center">
            <span className={cn("size-1.5 rounded-full", tone.dot)} />
            {!reduce && (
              <motion.span
                className={cn("absolute size-1.5 rounded-full", tone.dot)}
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 2.4 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </span>
        );

      case "done":
        return (
          <motion.span
            className={cn("flex items-center justify-center", tone.text)}
            initial={reduce ? undefined : { scale: 0.5 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <Check size={14} aria-hidden="true" />
          </motion.span>
        );

      case "error":
        return (
          <motion.span
            className={cn("flex items-center justify-center", tone.text)}
            animate={reduce ? undefined : { x: [0, -2, 2, -1, 0] }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <X size={14} aria-hidden="true" />
          </motion.span>
        );

      default:
        return null;
    }
  })();

  return (
    <span aria-hidden="true" className="relative flex size-3.5 shrink-0 items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AgentStatusPill({
  state,
  label,
  size = "md",
  showHint = false,
  className,
}: AgentStatusPillProps) {
  const meta = STATE_META[state];
  const tone = TONE_CLASSES[meta.tone];
  const text = label ?? meta.label;

  return (
    <motion.span
      layout
      data-state={state}
      transition={{ layout: { type: "spring", bounce: 0 } }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        tone.bg,
        tone.text,
        tone.ring,
        className,
      )}
    >
      <StateIndicator state={state} />

      <span role="status" aria-live="polite" className="flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="whitespace-nowrap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>

      {showHint && (
        <>
          <span aria-hidden="true" className="h-3 w-px bg-current opacity-30" />
          <span className="whitespace-nowrap opacity-70" aria-hidden="true">
            {meta.hint}
          </span>
        </>
      )}
    </motion.span>
  );
}
