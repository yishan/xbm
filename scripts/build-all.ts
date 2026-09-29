#!/usr/bin/env bun
/**
 * Build every demo under apps/<slug>/ and assemble one static site in ./dist:
 *
 *   dist/index.html        index page listing all demos
 *   dist/<slug>/           apps/<slug>/dist (each app sets vite `base: "/<slug>/"`)
 *   dist/_thumbs/<slug>.png  copied from apps/<slug>/artifacts/screenshot.png (if present)
 *
 * Used by the root vercel.json (via scripts/build-all.sh). Run locally with:
 *   bash scripts/build-all.sh            # all apps
 *   bash scripts/build-all.sh obsidian-ui  # only some apps (index still lists built ones)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const APPS = join(ROOT, "apps")
const OUT = join(ROOT, "dist")
const SITE = "https://li.yishan.app"

type Demo = { slug: string; name: string; description: string; thumb: string | null }

function run(cmd: string[], cwd: string): boolean {
  console.log(`[build-all] (${cwd.replace(ROOT + "/", "")}) $ ${cmd.join(" ")}`)
  const p = Bun.spawnSync(cmd, { cwd, stdout: "inherit", stderr: "inherit", env: process.env })
  return p.exitCode === 0
}

function stripMd(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|[.,;:!?)]|$)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim()
}

/** Name = first "# heading"; description = first paragraph after it (falls back to the heading). */
function readMeta(dir: string, slug: string): { name: string; description: string } {
  const readme = join(dir, "README.md")
  if (!existsSync(readme)) return { name: slug, description: "" }
  const lines = readFileSync(readme, "utf8").split(/\r?\n/)
  let name = slug
  let i = 0
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)/)
    if (m) { name = stripMd(m[1]); i++; break }
    if (lines[i].trim()) { i = 0; break }
  }
  const para: string[] = []
  for (; i < lines.length; i++) {
    const l = lines[i].trim()
    if (!l) { if (para.length) break; continue }
    if (/^(#|```|\||<|>|-{3,}|!\[)/.test(l)) { if (para.length) break; continue }
    para.push(l)
  }
  let description = stripMd(para.join(" "))
  if (description.length > 240) description = description.slice(0, 237).replace(/\s+\S*$/, "") + "…"
  return { name, description }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

function buildApp(slug: string): boolean {
  const dir = join(APPS, slug)
  if (!run(["bun", "install", "--frozen-lockfile"], dir)) {
    console.warn(`[build-all] ${slug}: frozen install failed, retrying with plain bun install`)
    if (!run(["bun", "install"], dir)) return false
  }
  if (!run(["bun", "run", "build"], dir)) return false
  const appDist = join(dir, "dist")
  if (!existsSync(join(appDist, "index.html"))) {
    console.error(`[build-all] ${slug}: no dist/index.html after build`)
    return false
  }
  const html = readFileSync(join(appDist, "index.html"), "utf8")
  if (!html.includes(`/${slug}/`)) {
    console.warn(`[build-all] ${slug}: dist/index.html has no "/${slug}/" asset paths — is vite \`base: "/${slug}/"\` set?`)
  }
  cpSync(appDist, join(OUT, slug), { recursive: true })
  return true
}

function indexHtml(demos: Demo[]): string {
  const cards = demos
    .map((d) => {
      const thumb = d.thumb
        ? `<img src="${esc(d.thumb)}" alt="${esc(d.name)} screenshot" loading="lazy" decoding="async">`
        : `<div class="ph">${esc(d.slug)}</div>`
      return `      <li>
        <a class="card" href="/${esc(d.slug)}/">
          <div class="thumb">${thumb}</div>
          <div class="body">
            <h2>${esc(d.name)}</h2>
            <p>${esc(d.description || "—")}</p>
            <span class="url">li.yishan.app/${esc(d.slug)}/</span>
          </div>
        </a>
      </li>`
    })
    .join("\n")
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>xbm demos</title>
<meta name="description" content="xbm — weekday tech demos from X bookmarks. 每个 demo 一个路径。">
<link rel="canonical" href="${SITE}/">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2318181b'/%3E%3Ctext x='16' y='21' font-family='monospace' font-size='13' fill='%23fafafa' text-anchor='middle'%3Exbm%3C/text%3E%3C/svg%3E">
<style>
  :root { color-scheme: dark; --bg:#09090b; --card:#111113; --line:#27272a; --fg:#fafafa; --mute:#a1a1aa; --dim:#71717a; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; -webkit-font-smoothing:antialiased; }
  main { max-width:1120px; margin:0 auto; padding:64px 24px 80px; }
  header h1 { margin:0; font-size:32px; letter-spacing:-0.02em; font-weight:650; }
  header p { margin:8px 0 0; color:var(--mute); }
  header .zh { color:var(--dim); font-size:14px; margin-top:2px; }
  ul { list-style:none; margin:40px 0 0; padding:0; display:grid; gap:20px; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); }
  .card { display:flex; flex-direction:column; height:100%; color:inherit; text-decoration:none; background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; transition:border-color .15s, transform .15s; }
  .card:hover, .card:focus-visible { border-color:#52525b; transform:translateY(-2px); outline:none; }
  .thumb { aspect-ratio:16/10; background:#18181b; border-bottom:1px solid var(--line); overflow:hidden; }
  .thumb img { width:100%; height:100%; object-fit:cover; object-position:top; display:block; }
  .ph { height:100%; display:grid; place-items:center; color:var(--dim); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
  .body { padding:16px 18px 18px; display:flex; flex-direction:column; gap:8px; flex:1; }
  h2 { margin:0; font-size:17px; font-weight:600; }
  .body p { margin:0; color:var(--mute); font-size:14px; flex:1; }
  .url { color:var(--dim); font:12px ui-monospace, SFMono-Regular, Menlo, monospace; }
  footer { margin-top:48px; color:var(--dim); font-size:13px; }
  footer a { color:var(--mute); }
  @media (prefers-reduced-motion: reduce) { .card { transition:none; } .card:hover { transform:none; } }
</style>
</head>
<body>
<main>
  <header>
    <h1>xbm demos</h1>
    <p>Weekday tech demos rebuilt from X bookmarks — one path per demo.</p>
    <p class="zh">来自 X 书签的技术 demo 合集，每个 demo 一个路径。</p>
  </header>
  <ul>
${cards}
  </ul>
  <footer>${demos.length} demos · source: <a href="https://github.com/yishan/xbm">github.com/yishan/xbm</a></footer>
</main>
</body>
</html>
`
}

function main() {
  const only = new Set(process.argv.slice(2))
  const slugs = readdirSync(APPS)
    .filter((s) => !s.startsWith(".") && statSync(join(APPS, s)).isDirectory() && existsSync(join(APPS, s, "package.json")))
    .filter((s) => only.size === 0 || only.has(s))
    .sort()
  if (slugs.length === 0) throw new Error("no apps found under apps/*/package.json")

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(join(OUT, "_thumbs"), { recursive: true })

  const demos: Demo[] = []
  const failed: string[] = []
  for (const slug of slugs) {
    console.log(`\n[build-all] ===== ${slug} =====`)
    if (!buildApp(slug)) { failed.push(slug); continue }
    const dir = join(APPS, slug)
    const shot = join(dir, "artifacts", "screenshot.png")
    let thumb: string | null = null
    if (existsSync(shot)) {
      cpSync(shot, join(OUT, "_thumbs", `${slug}.png`))
      thumb = `/_thumbs/${slug}.png`
    }
    demos.push({ slug, ...readMeta(dir, slug), thumb })
  }

  writeFileSync(join(OUT, "index.html"), indexHtml(demos))
  console.log(`\n[build-all] wrote dist/index.html with ${demos.length} demos: ${demos.map((d) => d.slug).join(", ")}`)
  if (failed.length) {
    // Fail the deploy rather than silently shipping a site with missing demos.
    console.error(`[build-all] FAILED: ${failed.join(", ")}`)
    process.exit(1)
  }
}

main()
