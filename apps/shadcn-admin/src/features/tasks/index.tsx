// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { tasks } from "./data/tasks"

export function TasksPage() {
  const stats = [
    {
      label: "Total",
      value: tasks.length,
    },
    {
      label: "In progress",
      value: tasks.filter((task) => task.status === "in progress").length,
    },
    {
      label: "Done",
      value: tasks.filter((task) => task.status === "done").length,
    },
    {
      label: "Critical",
      value: tasks.filter((task) => task.priority === "critical").length,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {
              "Here's a list of your tasks for this sprint — filter, sort and paginate (sample data)."
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast("Import (demo)")}
            data-testid="import-tasks"
          >
            <Download />
            Import
          </Button>
          <Button
            onClick={() => toast("Create task (demo)")}
            data-testid="create-task"
          >
            <Plus />
            Create task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={tasks} />
    </div>
  )
}
