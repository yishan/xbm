import { useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { IconReset } from "./icons";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  edited: boolean;
  onReset: () => void;
  error: string | null;
};

const TOKENS = [
  { glyph: "**", label: "Bold — accent", before: "**", after: "**" },
  { glyph: "*", label: "Italic — recedes", before: "*", after: "*" },
  { glyph: "~~", label: "Strike — rewrite", before: "~~", after: "~~" },
  { glyph: "→", label: "Arrow", before: " → ", after: "" },
  { glyph: "—", label: "Side note", before: " — ", after: "" },
] as const;

export function Editor({ value, onChange, edited, onReset, error }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertToken = (token: (typeof TOKENS)[number]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue =
      value.slice(0, start) + token.before + selected + token.after + value.slice(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();

      const isWrapToken = token.before.length > 0 && token.after.length > 0;

      if (isWrapToken) {
        const selectionStart = start + token.before.length;
        const selectionEnd = selectionStart + selected.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        const caret = start + token.before.length + selected.length + token.after.length;
        textarea.setSelectionRange(caret, caret);
      }
    });
  };

  const handleTextareaKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      insertToken(TOKENS[0]);
    } else if (key === "i") {
      event.preventDefault();
      insertToken(TOKENS[1]);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border border-[var(--border)] bg-card has-[textarea:focus-visible]:[outline:2px_solid_var(--ring)] has-[textarea:focus-visible]:[outline-offset:-2px]">
      <div className="flex h-11 items-center justify-between border-b border-[var(--border)] px-3">
        <div className="flex min-w-0 items-center gap-1">
          {TOKENS.map((token) => (
            <button
              key={token.label}
              type="button"
              aria-label={token.label}
              onClick={() => insertToken(token)}
              className="lab-press lab-hit h-8 px-2.5 font-mono text-[13px] text-muted-foreground hover:text-foreground"
            >
              {token.glyph}
            </button>
          ))}
        </div>

        {edited ? (
          <button
            type="button"
            aria-label="Reset to sample"
            onClick={onReset}
            className="lab-press lab-hit inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <IconReset />
          </button>
        ) : null}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleTextareaKeyDown}
        aria-label="MDX source"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        className="min-h-[260px] flex-1 resize-none bg-transparent px-4 py-4 font-mono text-base leading-[1.6] outline-none [tab-size:2] md:text-[13px] lg:min-h-0"
      />

      <p
        role="status"
        aria-live="polite"
        className="min-h-[1.5rem] px-4 pb-2 font-mono text-xs text-[var(--destructive)]"
      >
        {error ?? ""}
      </p>
    </section>
  );
}
