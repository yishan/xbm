// Generates src/data/xbm-timeline.json from the git history of yishan/xbm.
// One row per merged PR on main (first-parent merge commits), dated in Asia/Shanghai.
// kind: "infra" / "fix" from the branch prefix (infra/*, fix/*); otherwise "demo" if the PR
// added a new apps/<slug>/package.json, else "update" (a change to an existing demo).
// Usage (from apps/tanstack-charts/): git fetch origin main && bun scripts/gen-timeline.ts [ref]
// ref defaults to origin/main.
import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"

const git = (args: string) =>
  execSync(`git ${args}`, { encoding: "utf8", env: { ...process.env, TZ: "Asia/Shanghai" } }).trim()

const ref = process.argv[2] ?? "origin/main"
const log = git(
  `log --merges --first-parent ${ref} --date=format-local:%Y-%m-%dT%H:%M --pretty=%h%x09%ad%x09%s`,
)
const rows = log
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [sha, at, subject] = line.split("\t")
    const pr = Number(/#(\d+)/.exec(subject)?.[1] ?? 0)
    const branch = /from \S+?\/(\S+)/.exec(subject)?.[1] ?? ""
    const files = git(`diff --name-status ${sha}^1 ${sha}`).split("\n")
    const added = files
      .map((f) => /^A\tapps\/([^/]+)\/package\.json$/.exec(f)?.[1])
      .filter((s): s is string => Boolean(s))
    const touched = new Set(
      files.map((f) => /^\w+\tapps\/([^/]+)\//.exec(f)?.[1]).filter((s): s is string => Boolean(s)),
    )
    const prefix = branch.split("/")[0]
    const kind =
      prefix === "infra" || prefix === "fix" ? prefix : added.length > 0 ? "demo" : touched.size > 0 ? "update" : "infra"
    return { pr, sha, mergedAt: at, day: at.slice(0, 10), branch, kind, apps: added.length > 0 ? added : [...touched] }
  })
  .reverse()

writeFileSync(
  new URL("../src/data/xbm-timeline.json", import.meta.url),
  JSON.stringify({ source: `git log --merges --first-parent ${ref} (yishan/xbm)`, generatedAt: git(`log -1 --format=%h ${ref}`), rows }, null, 2) + "\n",
)
console.log(`wrote ${rows.length} merged PRs`)
