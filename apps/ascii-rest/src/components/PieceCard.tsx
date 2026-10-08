import { AsciiFrame } from "@/components/AsciiFrame";
import type { FpsChoice, PieceInfo } from "@/lib/types";

export function PieceCard({ piece, fps, mono }: { piece: PieceInfo; fps: FpsChoice; mono: boolean }) {
  const meta = [
    `${piece.cols}×${piece.rows}`,
    piece.fps === 0 ? "still" : `${piece.fps} fps`,
    piece.canvas ? "colour" : "text",
    ...(piece.clock ? ["live clock"] : []),
  ].join(" · ");

  return (
    <article
      data-testid="piece-card"
      data-piece={piece.id}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card"
    >
      <div className="aspect-[16/10] border-b border-border bg-background p-3">
        <AsciiFrame
          piece={piece.id}
          cols={piece.cols}
          rows={piece.rows}
          canvas={piece.canvas}
          cell={piece.cell}
          box
          fps={fps}
          mono={mono}
          label={piece.note}
        />
      </div>

      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate font-mono text-sm font-medium">{piece.name}</span>
          <a
            href={`https://ascii.rest/${piece.id}/`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${piece.name} on ascii.rest`}
            className="shrink-0 font-mono text-[11px] text-muted-foreground hover:text-foreground"
          >
            ascii.rest ↗
          </a>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground">{piece.note}</p>

        <p className="font-mono text-[11px] text-muted-foreground">{meta}</p>
      </div>
    </article>
  );
}
