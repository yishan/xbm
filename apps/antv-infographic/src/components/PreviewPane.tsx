// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026
import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Code2, Copy } from "lucide-react";
import type { TemplateSample } from "@/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { InfographicCanvas } from "./InfographicCanvas";

type PreviewPaneProps = {
  sample: TemplateSample;
  dark?: boolean;
};

export function PreviewPane({ sample, dark }: PreviewPaneProps) {
  const [showSource, setShowSource] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sample.syntax);
      toast.success("DSL copied to clipboard");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy DSL");
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="preview-pane">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">{sample.name}</h2>
            <Badge variant="secondary">{sample.category}</Badge>
          </div>
          {sample.description ? (
            <p className="max-w-prose text-sm text-muted-foreground">{sample.description}</p>
          ) : null}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="bg-white p-4 dark:bg-zinc-950">
          <InfographicCanvas syntax={sample.syntax} dark={dark} className="min-h-[520px] w-full" />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 px-0 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowSource((prev) => !prev)}
            aria-expanded={showSource}
            data-testid="toggle-syntax"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", showSource && "rotate-180")}
            />
            <Code2 className="size-4" />
            <span>View DSL</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopy}
            data-testid="copy-syntax"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copied ? "Copied" : "Copy DSL"}</span>
          </Button>
        </div>

        {showSource ? (
          <pre
            className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono leading-relaxed text-foreground"
            data-testid="syntax-source"
          >
            <code>{sample.syntax}</code>
          </pre>
        ) : null}
      </div>
    </div>
  );
}
