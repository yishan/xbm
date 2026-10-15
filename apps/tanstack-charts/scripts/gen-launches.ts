// Generates src/data/xbm-launches.json from tracking/seen-bookmarks.json (built = first release date per demo).
// run from apps/tanstack-charts: bun scripts/gen-launches.ts
import { readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
const APP = resolve(import.meta.dir, "..")
const t = JSON.parse(readFileSync(join(APP, "../../tracking/seen-bookmarks.json"), "utf8")) as { built: { slug?: string; title?: string; built?: string }[] }
const rows = t.built.filter((b) => b.slug && b.built).map((b) => ({ slug: b.slug!, title: b.title ?? b.slug!, built: b.built! })).sort((a, b) => a.built.localeCompare(b.built) || a.slug.localeCompare(b.slug))
writeFileSync(join(APP, "src/data/xbm-launches.json"), JSON.stringify({ source: "tracking/seen-bookmarks.json (built dates, yishan/xbm)", rows }, null, 2) + "\n")
console.log(`${rows.length} launches`)
