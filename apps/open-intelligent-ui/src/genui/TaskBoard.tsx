import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { TaskBoardProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Filter = "all" | "todo" | "done";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("").toUpperCase();
  return (Array.from(parts[0])[0] + Array.from(parts[1])[0]).toUpperCase();
}

export function TaskBoard({ title, tasks }: TaskBoardProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(
    () => new Set(tasks.filter((t) => t.done).map((t) => t.id)),
  );
  const [filter, setFilter] = useState<Filter>("all");

  const toggle = (id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = tasks.length;
  const doneCount = tasks.reduce((acc, t) => acc + (doneIds.has(t.id) ? 1 : 0), 0);
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const visible = useMemo(
    () =>
      tasks.filter((t) => {
        const done = doneIds.has(t.id);
        if (filter === "todo") return !done;
        if (filter === "done") return done;
        return true;
      }),
    [tasks, doneIds, filter],
  );

  return (
    <Card className="w-full">
      <CardHeader className="gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {doneCount}/{total} 已完成
          </span>
        </div>
        <Progress value={pct} data-testid="task-progress" />
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="w-full" data-testid="task-filter">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="todo">未完成</TabsTrigger>
            <TabsTrigger value="done">已完成</TabsTrigger>
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无任务</p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((task) => {
              const done = doneIds.has(task.id);
              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/50"
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    aria-label={task.label}
                    data-testid={`task-toggle-${task.id}`}
                    onClick={() => toggle(task.id)}
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent hover:border-foreground/40",
                    )}
                  >
                    {done && <Check className="size-3" strokeWidth={3} />}
                  </button>

                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm transition-colors",
                      done && "text-muted-foreground line-through",
                    )}
                  >
                    {task.label}
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                      {initials(task.owner)}
                    </span>
                    <span className="hidden max-w-[88px] truncate text-xs text-muted-foreground sm:inline">
                      {task.owner}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
