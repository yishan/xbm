// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

import { Badge } from "@/components/ui/badge";

type SourcePaneProps = {
  source: string;
  filename: string;
};

export function SourcePane({ source, filename }: SourcePaneProps) {
  return (
    <div
      data-testid="source-pane"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
        <span className="truncate font-mono text-[12.5px] font-medium text-zinc-300">
          {filename}
        </span>
        <Badge
          variant="outline"
          className="shrink-0 border-zinc-700 bg-zinc-800/60 font-mono text-[10.5px] uppercase tracking-wide text-zinc-400"
        >
          raw markdown
        </Badge>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <code className="block whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-zinc-100">
          {source}
        </code>
      </pre>
    </div>
  );
}
