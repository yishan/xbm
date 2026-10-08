#!/usr/bin/env bun
/**
 * Regenerates the committed data files from real sources (run from apps/ascii-rest):
 *   src/data/pieces.json  every piece's meta, read from the installed ascii.rest package
 *   src/data/fleet.json   xbm demos from `git log --first-parent origin/main` and the
 *                         nightly run notes in /workspace/xbm-nightly/<date>/status.md
 *   bun scripts/gen-data.ts
 */
import { load, names, canvas } from "ascii.rest"
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const APP = resolve(import.meta.dir, "..")
const REPO = resolve(APP, "../..")
const NIGHTLY = process.env.XBM_NIGHTLY ?? "/workspace/xbm-nightly"
const sh = (cmd: string[]) => new TextDecoder().decode(Bun.spawnSync(cmd, { cwd: REPO }).stdout).trim()

// 1. pieces
const pieces = []
for (const id of names) {
  const m = (await (load as Record<string, () => Promise<any>>)[id]()).meta
  pieces.push({ id, name: m.name, category: m.category, note: m.note, cols: m.cols, rows: m.rows, fps: m.fps, canvas: canvas.has(id), clock: !!m.clock, cell: m.cell ?? 2 })
}
writeFileSync(join(APP, "src/data/pieces.json"), JSON.stringify(pieces, null, 1) + "\n")

// 2. demos: first first-parent commit on origin/main that added apps/<slug>/package.json
const head = sh(["git", "rev-parse", "--short", "origin/main"])
const demos = readdirSync(join(REPO, "apps"))
  .filter((s) => s !== "ascii-rest")
  .map((slug) => {
    const line = sh(["git", "log", "--first-parent", "origin/main", "--diff-filter=A", "--date=format:%Y-%m-%d %H:%M", "--format=%ad|%h|%s", "--", `apps/${slug}/package.json`]).split("\n").pop() ?? ""
    const [when, hash, subject] = line.split("|")
    if (!when) return null
    const pr = subject.match(/#(\d+)/)?.[1] ?? ""
    return { slug, merged: when, commit: hash, pr: pr ? Number(pr) : null }
  })
  .filter((d) => d !== null)
  .sort((a, b) => a.merged.localeCompare(b.merged))

const merges = sh(["git", "log", "--first-parent", "origin/main", "--merges", "--date=format:%Y-%m-%d", "--format=%ad|%s"]).split("\n").filter(Boolean)
  .map((l) => { const [date, s] = l.split("|"); return { date, pr: Number(s.match(/#(\d+)/)?.[1] ?? 0), branch: s.replace(/^.* from yishan\//, "") } })

// weeks (Monday start) from the first demo
const monday = (d: string) => { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10) }
const weeks = [...new Set([...demos.map((d) => monday(d.merged.slice(0, 10))), ...merges.map((m) => monday(m.date))])].sort()
const perWeek = {
  labels: weeks.map((w) => w.slice(5)),
  demos: weeks.map((w) => demos.filter((d) => monday(d.merged.slice(0, 10)) === w).length),
  prs: weeks.map((w) => merges.filter((m) => monday(m.date) === w).length),
}

// 3. nightly runs: one line per dated folder, read from its status.md
const runs = existsSync(NIGHTLY) ? readdirSync(NIGHTLY).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().map((date) => {
  const f = join(NIGHTLY, date, "status.md")
  const pick = join(NIGHTLY, date, "pick.md")
  const text = existsSync(f) ? readFileSync(f, "utf8") : ""
  const slug = (text.match(/\(`?([a-z0-9-]+)`?\)/) ?? (existsSync(pick) ? readFileSync(pick, "utf8").match(/\*\*slug:\*\*\s*([a-z0-9-]+)/) : null))?.[1] ?? ""
  const finished = text.match(/\*\*finished:\*\*\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/)
  const manual = /manual/i.test(text)
  let result = "running"
  if (/not finished/i.test(text)) result = "stopped"
  else if (finished) result = manual ? "manual" : "done"
  // HH:MM shown on the board: finish time, else when it stopped or started
  const at = finished?.[2] ?? text.match(/stopped around (\d{2}:\d{2})/)?.[1] ?? text.match(/(\d{2}:\d{2}) Manual build started/)?.[1] ?? null
  return { date, slug, finished: finished ? `${finished[1]} ${finished[2]}` : null, at, result }
}) : []

const fleet = {
  generated: new Date().toISOString(),
  sources: {
    demos: `git log --first-parent origin/main (head ${head}), first commit adding apps/<slug>/package.json`,
    prs: "git log --first-parent --merges origin/main",
    runs: "/workspace/xbm-nightly/<date>/status.md (nightly run notes on the build box)",
    schedule: "nightly pipeline: 19:55 pick, 22:00 build, 05:53 report (Asia/Shanghai)",
  },
  head,
  demos,
  merges,
  perWeek,
  runs,
}
writeFileSync(join(APP, "src/data/fleet.json"), JSON.stringify(fleet, null, 1) + "\n")
console.log(`pieces ${pieces.length}, demos ${demos.length}, merges ${merges.length}, runs ${runs.length}`)
