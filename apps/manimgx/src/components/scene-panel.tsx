import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Scene } from "@/data/scenes";

interface ScenePanelProps {
  scene: Scene;
}

export function ScenePanel({ scene }: ScenePanelProps) {
  const gifSrc = scene.gif;
  const gifAlt = `${scene.titleZh}动画演示`;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{scene.titleZh}</CardTitle>
          <Badge variant="secondary">{scene.titleEn}</Badge>
        </div>
        <CardDescription>{scene.blurbZh}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-md bg-zinc-100 p-2 dark:bg-zinc-900">
            <img
              src={gifSrc}
              alt={gifAlt}
              loading="lazy"
              className="max-h-[420px] w-full rounded-md object-contain"
            />
          </div>
          <pre className="max-h-[420px] overflow-auto rounded-md bg-zinc-100 p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            <code className="font-mono text-xs">{scene.code}</code>
          </pre>
        </div>
        <div className="mt-4">
          <a
            href={scene.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline underline-offset-4 hover:no-underline"
          >
            源码 · GitHub
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
