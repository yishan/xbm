// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

import type { SampleDoc } from "@/docs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type DocSidebarProps = {
  docs: SampleDoc[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function DocSidebar({ docs, activeId, onSelect }: DocSidebarProps) {
  return (
    <nav className="flex h-full w-full flex-col" aria-label="Sample docs">
      <h2 className="px-3 pb-2 pt-3 text-xs uppercase tracking-wide text-muted-foreground">
        Sample docs
      </h2>
      <ScrollArea className="flex-1">
        <ul className="flex flex-col gap-1 px-2 pb-3">
          {docs.map((doc) => {
            const isActive = doc.id === activeId;

            return (
              <li key={doc.id}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSelect(doc.id)}
                  data-testid={`doc-item-${doc.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "h-auto w-full flex-col items-start justify-start gap-0.5 whitespace-normal rounded-xl border border-transparent px-3 py-2 text-left",
                    isActive ? "border-sky-500/40 bg-accent" : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium leading-snug">{doc.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {doc.filename}
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {doc.subtitle}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </nav>
  );
}
