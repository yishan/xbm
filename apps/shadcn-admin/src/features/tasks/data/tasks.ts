// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import type { LucideIcon } from "lucide-react"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CircleCheck,
  CircleHelp,
  CircleX,
  Timer,
  TriangleAlert,
} from "lucide-react"

export type TaskStatus = "backlog" | "todo" | "in progress" | "done" | "canceled"
export type TaskPriority = "low" | "medium" | "high" | "critical"
export type TaskLabel = "bug" | "feature" | "documentation"

export type Task = {
  id: string
  title: string
  status: TaskStatus
  label: TaskLabel
  priority: TaskPriority
  assignee: string
  dueDate: string
}

export type Option<T extends string = string> = {
  value: T
  label: string
  icon?: LucideIcon
}

export const statuses: Option<TaskStatus>[] = [
  { value: "backlog", label: "Backlog", icon: CircleHelp },
  { value: "todo", label: "Todo", icon: Circle },
  { value: "in progress", label: "In Progress", icon: Timer },
  { value: "done", label: "Done", icon: CircleCheck },
  { value: "canceled", label: "Canceled", icon: CircleX },
]

export const priorities: Option<TaskPriority>[] = [
  { value: "low", label: "Low", icon: ArrowDown },
  { value: "medium", label: "Medium", icon: ArrowRight },
  { value: "high", label: "High", icon: ArrowUp },
  { value: "critical", label: "Critical", icon: TriangleAlert },
]

export const labels: Option<TaskLabel>[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
]

const statusValues: TaskStatus[] = statuses.map((option) => option.value)
const priorityValues: TaskPriority[] = priorities.map((option) => option.value)
const labelValues: TaskLabel[] = labels.map((option) => option.value)

const assignees: string[] = [
  "Ava",
  "Noah",
  "Mia",
  "Liam",
  "Emma",
  "Ethan",
  "Sofia",
  "Kai",
]

const titleVerbs: string[] = [
  "Refactor",
  "Migrate",
  "Optimize",
  "Document",
  "Fix",
  "Redesign",
  "Add tests for",
  "Investigate",
  "Deprecate",
  "Instrument",
  "Harden",
  "Simplify",
  "Cache",
  "Automate",
  "Audit",
  "Rewrite",
]

const titleSubjects: string[] = [
  "the billing webhook handler",
  "the user onboarding flow",
  "the search indexing pipeline",
  "the authentication middleware",
  "the notification service",
  "the dashboard chart components",
  "the GraphQL resolver layer",
  "the CI release workflow",
  "the rate limiting logic",
  "the email template renderer",
  "the data export endpoint",
  "the permission checks",
  "the session refresh logic",
  "the image upload queue",
  "the audit log writer",
  "the feature flag client",
]

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DUE_DATE_START_MS = Date.UTC(2026, 8, 1)
const DUE_DATE_SPAN_DAYS = 91

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T
}

function toIsoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

function createTasks(): Task[] {
  const rng = mulberry32(42)
  const generated: Task[] = []

  for (let i = 0; i < 64; i++) {
    const verb = pick(rng, titleVerbs)
    const subject = pick(rng, titleSubjects)
    const status = pick(rng, statusValues)
    const label = pick(rng, labelValues)
    const priority = pick(rng, priorityValues)
    const assignee = pick(rng, assignees)
    const dueOffset = Math.floor(rng() * DUE_DATE_SPAN_DAYS)

    generated.push({
      id: `TASK-${1000 + ((i * 37) % 9000)}`,
      title: `${verb} ${subject}`,
      status,
      label,
      priority,
      assignee,
      dueDate: toIsoDate(DUE_DATE_START_MS + dueOffset * DAY_IN_MS),
    })
  }

  return generated
}

export const tasks: Task[] = createTasks()
