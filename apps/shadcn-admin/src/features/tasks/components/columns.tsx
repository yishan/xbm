// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import type { ColumnDef } from "@tanstack/react-table"
import { Ellipsis } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { labels, priorities, statuses, type Task } from "../data/tasks"
import { DataTableColumnHeader } from "./data-table-column-header"

const rank = (opts: { value: string }[], v: unknown) =>
  opts.findIndex((o) => o.value === v)

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] font-mono text-xs">
        {row.getValue("id") as string}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find((l) => l.value === row.original.label)

      return (
        <div className="flex gap-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[180px] truncate font-medium sm:max-w-[320px] lg:max-w-[420px]">
            {row.getValue("title") as string}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue("status"))

      if (!status) {
        return null
      }

      const Icon = status.icon

      return (
        <div className="flex w-[110px] items-center gap-2">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      )
    },
    sortingFn: (a, b, id) =>
      rank(statuses, a.getValue(id)) - rank(statuses, b.getValue(id)),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue("priority")
      )

      if (!priority) {
        return null
      }

      const Icon = priority.icon

      return (
        <div className="flex w-[110px] items-center gap-2">
          {Icon && (
            <Icon
              className={cn(
                "size-4 text-muted-foreground",
                priority.value === "critical" && "text-destructive"
              )}
            />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    sortingFn: (a, b, id) =>
      rank(priorities, a.getValue(id)) - rank(priorities, b.getValue(id)),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignee" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("assignee") as string

      return (
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("dueDate") as string

      return (
        <span className="tabular-nums">
          {new Date(value + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 data-[state=open]:bg-muted"
          >
            <Ellipsis className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={() => toast(`Editing ${row.original.id} (demo)`)}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              navigator.clipboard?.writeText(row.original.id)
              toast.success("Copied")
            }}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => toast.error(`${row.original.id} deleted (demo)`)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
