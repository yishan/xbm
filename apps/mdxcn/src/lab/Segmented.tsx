import { useRef } from "react";
import type { KeyboardEvent } from "react";

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
  size = "md",
}: SegmentedProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusOption = (index: number) => {
    buttonRefs.current[index]?.focus();
  };

  const move = (index: number, delta: number, event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    requestAnimationFrame(() => focusOption(next));
  };

  const moveHome = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onChange(options[0].value);
    requestAnimationFrame(() => focusOption(0));
  };

  const moveEnd = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onChange(options[options.length - 1].value);
    requestAnimationFrame(() => focusOption(options.length - 1));
  };

  const heightClass = size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex items-center border border-[var(--border)] p-0.5 gap-0.5 ${className}`}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => {
              onChange(option.value);
              focusOption(index);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                move(index, 1, event);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                move(index, -1, event);
              } else if (event.key === "Home") {
                moveHome(event);
              } else if (event.key === "End") {
                moveEnd(event);
              }
            }}
            className={`lab-press lab-hit whitespace-nowrap font-mono ${heightClass} ${
              checked
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
