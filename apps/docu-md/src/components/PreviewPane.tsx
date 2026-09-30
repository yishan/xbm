// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.
import { MarkdownView } from "@/components/MarkdownView";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type PreviewPaneProps = {
  source: string;
};

export function PreviewPane({ source }: PreviewPaneProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col bg-background"
      data-testid="preview-pane"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">Preview</span>
        <Badge variant="secondary">rendered</Badge>
      </div>
      <ScrollArea className="flex-1">
        <article
          className="mx-auto max-w-3xl px-6 py-8"
          data-export-root=""
        >
          <MarkdownView source={source} />
        </article>
      </ScrollArea>
    </div>
  );
}
