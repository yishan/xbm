#!/usr/bin/env bun
/**
 * Verify one or more xbm demos end to end, the way the verify-xbm skill describes
 * (skills/verify-xbm/SKILL.md). Per slug:
 *
 *   launch  serve ./dist (Vercel-like trailing-slash → index.html) on a free 127.0.0.1 port, or use --base
 *   doctor  page 200, no console/page errors, injected #xbm-home-link pill present, README heading/title
 *   drive   the demo's main interaction (recipe in DRIVES below, mirrored in skills/verify-xbm/features/<slug>.md)
 *   evidence  drive.webm video + before/after PNGs + aria snapshot; light/dark thumbnails via `bun scripts/shoot.ts <slug>`
 *   checks  tracking/seen-bookmarks.json entry (slug + built, updates[] dated) and a sensitive-info scan
 *   cleanup stop only the server/browser this run started; evidence stays in the run dir
 *
 * Usage (repo root, after `bash scripts/build-all.sh [slug…]`):
 *   bun scripts/verify.ts snapcn hairline            # verify these demos
 *   bun scripts/verify.ts --all                      # every apps/<slug>/ with a package.json
 *   bun scripts/verify.ts --base https://li.yishan.app snapcn   # verify a deployed site (no local server)
 *   bun scripts/verify.ts --no-shoot hairline        # skip scripts/shoot.ts (does not touch apps/<slug>/artifacts)
 *   bun scripts/verify.ts --out /tmp/run1 snapcn     # evidence dir (default .verify/<timestamp>/)
 *
 * status.json + STATUS.md are rewritten after every step, so a crashed run still says where and why it stopped.
 * Exit code 0 only if every slug PASSes. Needs Playwright Chromium or CHROMIUM_PATH.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync, copyFileSync } from "node:fs"
import { extname, join, normalize, resolve, relative } from "node:path"
import { chromium, type Browser, type Page } from "playwright"

const ROOT = resolve(import.meta.dir, "..")
const APPS = join(ROOT, "apps")
const DIST = join(ROOT, "dist")

// ---------- drive recipes: one per demo (keep in sync with skills/verify-xbm/features/) ----------
type Target = { role: "button" | "tab" | "link"; name: RegExp | string; nth?: number } | { css: string }
type Drive = { feature: string; steps: Target[]; expectText?: RegExp | string }
export const DRIVES: Record<string, Drive> = {
  "answer-me-with-html": { feature: "open the second rendered page from the list", steps: [{ role: "button", name: /^02 Vercel/ }] },
  "antv-infographic": { feature: "filter templates to Sequence", steps: [{ role: "button", name: "Sequence", nth: 0 }], expectText: /Sequence/ },
  "ascii-rest": { feature: "filter gallery to the data category", steps: [{ role: "button", name: /^data \d+/ }] },
  "docu-md": { feature: "open the API Notes sample doc", steps: [{ role: "button", name: /^API Notes/ }], expectText: /Endpoints/ },
  "figures4papers": { feature: "switch the chart to Radar", steps: [{ role: "tab", name: "Radar" }] },
  "focus-mk3-anatomy": { feature: "open the DPS6 gearbox model page", steps: [{ css: 'a[href="dps6.html"]' }], expectText: /DPS6/ },
  "fx0": { feature: "open 逐轮版本 and pick 第 2 轮", steps: [{ role: "tab", name: "逐轮版本" }, { role: "button", name: /^第 2 轮/ }], expectText: /版本 v2/ },
  "hairline": { feature: "switch to 02 协作场景 (simulated agent task)", steps: [{ role: "button", name: /^02 协作场景/ }] },
  "obsidian-ui": { feature: "open the Code view of the first effect (Prism Beam)", steps: [{ role: "button", name: "Code", nth: 0 }] },
  "open-intelligent-ui": { feature: "ask the scripted 上海天气 prompt and get a weather card", steps: [{ role: "button", name: "上海天气" }] },
  "pdfcn": { feature: "switch the document to Resume", steps: [{ role: "button", name: /^Resume/ }] },
  "grok": { feature: "jump to 协作流程 via the section nav", steps: [{ css: 'a[href="#flows-h"]' }], expectText: /协作流程/ },
  "seecode": { feature: "open the 审批对话 tab and step the sequence once", steps: [{ role: "tab", name: "审批对话" }, { role: "button", name: "下一步" }], expectText: /第 1 步/ },
  "shadcn-admin": { feature: "open the Analytics dashboard tab", steps: [{ role: "tab", name: "Analytics" }] },
  "slideblocks": { feature: "go to the next slide", steps: [{ role: "button", name: "下一页" }] },
  "snapcn": { feature: "play the first Remotion player", steps: [{ role: "button", name: "Play video", nth: 0 }] },
  "manimgx": { feature: "switch to the Fourier π scene tab", steps: [{ role: "tab", name: "傅里叶 π" }], expectText: /Fourier/ },
  "spectrum-ui": { feature: "run the agent task toast", steps: [{ role: "button", name: "Run agent task" }] },
  "tanstack-charts": { feature: "switch the main chart to Cumulative", steps: [{ css: '[aria-label="Cumulative"]' }] },
  "transitions-dev": { feature: "Next value on the number pop-in", steps: [{ role: "button", name: "Next value" }] },
}

// ---------- sensitive-info scan ----------
const SENSITIVE: { label: string; re: RegExp }[] = [
  { label: "internal path", re: /\/(?:workspace|home\/box|cursor\/stores)\/[\w.-]+|\/Users\/[a-z][\w.-]+\//g },
  { label: "internal link", re: /https?:\/\/(?:linear\.app|[\w-]+\.slack\.com|app\.slack\.com|[\w-]+\.notion\.so|www\.notion\.so|[\w-]+\.atlassian\.net)\/[^\s"'<>)]*/g },
  { label: "api key", re: /\b(?:sk-(?:ant-|proj-)?[A-Za-z0-9_-]{24,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|xox[abpr]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|xai-[A-Za-z0-9]{30,})\b/g },
  { label: "private key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { label: "email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
]
// Placeholder/public addresses that are fine to ship.
const EMAIL_OK = /@(?:email\.com|example\.(?:com|org|net)|users\.noreply\.github\.com|[\w-]+\.(?:test|invalid|local))$|^(?:noreply|no-reply|hello|demo|you|user|name|someone|support|team|info)@/i
function denylist(): string[] {
  // Real names, internal project names, Linear titles: never committed. One term per line, local only.
  const f = process.env.XBM_VERIFY_DENYLIST ?? join(ROOT, "skills/verify-xbm/denylist.local.txt")
  const terms = existsSync(f) ? readFileSync(f, "utf8").split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#")) : []
  return terms
}
function scanText(where: string, text: string, deny: string[]): string[] {
  const hits: string[] = []
  for (const { label, re } of SENSITIVE)
    for (const m of text.matchAll(re)) {
      if (label === "email" && (m[0].split("@")[1].split(".").length > 4 || EMAIL_OK.test(m[0]) || /\.(png|jpe?g|svg|webp|gif|js|css)$/i.test(m[0]))) continue
      hits.push(`${label}: ${m[0].slice(0, 80)} (${where})`)
    }
  const lower = text.toLowerCase()
  for (const t of deny) if (lower.includes(t.toLowerCase())) hits.push(`denylist term #${deny.indexOf(t) + 1} (${where})`)
  return [...new Set(hits)]
}
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p] })
}

// ---------- runner ----------
type Step = { step: string; ok: boolean; detail: string; at: string }
type Status = { slug: string; result: "RUNNING" | "PASS" | "FAIL"; url: string; feature?: string; steps: Step[]; evidence: string[]; warnings: string[] }

const args = process.argv.slice(2)
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : undefined }
const flag = (k: string) => { const i = args.indexOf(k); return i >= 0 ? (args.splice(i, 1), true) : false }
let base = opt("--base")?.replace(/\/$/, "")
const outRoot = resolve(opt("--out") ?? join(ROOT, ".verify", new Date().toISOString().replace(/[:.]/g, "-")))
const noShoot = flag("--no-shoot")
const all = flag("--all")
const slugs = all ? readdirSync(APPS).filter((s) => existsSync(join(APPS, s, "package.json"))).sort() : args
if (!slugs.length) { console.error("usage: bun scripts/verify.ts [--base URL] [--out DIR] [--no-shoot] (--all | slug…)"); process.exit(2) }

function save(dir: string, s: Status) {
  writeFileSync(join(dir, "status.json"), JSON.stringify(s, null, 2))
  const md = [`# verify-xbm: ${s.slug} — ${s.result}`, "", `URL: ${s.url}`, s.feature ? `Feature driven: ${s.feature}` : "", "",
    "| step | ok | detail |", "|---|---|---|", ...s.steps.map((x) => `| ${x.step} | ${x.ok ? "✅" : "❌"} | ${x.detail.replace(/\|/g, "\\|").replace(/\n/g, " ")} |`),
    "", "Evidence:", ...s.evidence.map((e) => `- ${e}`), ...(s.warnings.length ? ["", "Warnings:", ...s.warnings.map((w) => `- ${w}`)] : [])].join("\n")
  writeFileSync(join(dir, "STATUS.md"), md + "\n")
}

function serveDist() {
  if (!existsSync(join(DIST, "index.html"))) throw new Error("no dist/ — run `bash scripts/build-all.sh` first (or pass --base)")
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    fetch(req) {
      const path = normalize(decodeURIComponent(new URL(req.url).pathname)).replace(/^(\.\.[/\\])+/, "")
      let file = join(DIST, path)
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html")
      return existsSync(file) ? new Response(Bun.file(file)) : new Response("not found", { status: 404 })
    },
  })
  return { url: `http://127.0.0.1:${server.port}`, stop: () => server.stop(true) }
}

/** Observable UI state: url, headings, control labels, aria/data state, live regions, iframe/img sources, element count. */
const snapshot = (p: Page) => p.evaluate(() => {
  const q = (s: string) => [...document.querySelectorAll(s)]
  return JSON.stringify([location.href, document.querySelectorAll("body *").length,
    q("h1,h2,h3,[role=heading]").map((e) => (e as HTMLElement).innerText.trim()).join("|"),
    q("button,[role=tab]").map((e) => (e.getAttribute("aria-label") ?? (e as HTMLElement).innerText).trim()).join("|"),
    q("[aria-pressed],[aria-selected],[aria-checked],[aria-current],[data-state],[data-active]").map((e) =>
      ["aria-pressed", "aria-selected", "aria-checked", "aria-current", "data-state", "data-active"].map((a) => e.getAttribute(a) ?? "").join(",")).join("|"),
    q("[aria-live],[role=status],output").map((e) => `${e.getAttribute("aria-label") ?? ""}:${(e as HTMLElement).innerText}`).join("|"),
    q("iframe,img,object").map((e) => e.getAttribute("src") ?? e.getAttribute("data") ?? "").join("|")])
})

function locate(p: Page, t: Target) {
  if ("css" in t) return p.locator(t.css).first()
  const l = p.getByRole(t.role, { name: t.name, exact: typeof t.name === "string" })
  return t.nth === undefined ? l.first() : l.nth(t.nth)
}

async function verify(browser: Browser, slug: string, dir: string): Promise<Status> {
  const url = `${base}/${slug}/`
  const s: Status = { slug, result: "RUNNING", url, steps: [], evidence: [], warnings: [] }
  const rec = (step: string, ok: boolean, detail: string) => { s.steps.push({ step, ok, detail, at: new Date().toISOString() }); if (!ok) s.result = "FAIL"; save(dir, s); console.log(`[verify] ${slug} ${ok ? "ok  " : "FAIL"} ${step}: ${detail}`) }
  save(dir, s)
  const ev = (f: string) => { s.evidence.push(relative(ROOT, join(dir, f))); save(dir, s) }

  if (!existsSync(join(APPS, slug, "package.json"))) { rec("launch", false, `apps/${slug}/package.json missing`); return s }
  if (!base?.startsWith("http://127.0.0.1") || existsSync(join(DIST, slug, "index.html"))) {} else { rec("launch", false, `dist/${slug}/index.html missing — run bash scripts/build-all.sh ${slug}`); return s }
  rec("launch", true, `serving ${url}`)

  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 1280, height: 800 }, recordVideo: { dir, size: { width: 1280, height: 800 } } })
  const page = await ctx.newPage()
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.split("\n")[0]}`))
  page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(`console: ${m.text().slice(0, 200)}`))
  page.on("response", (r) => r.status() >= 400 && errors.push(`http ${r.status()}: ${r.url().replace(base!, "")}`))
  let bodyText = ""
  try {
    // doctor
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 }).catch(async () => (await page.waitForLoadState("load"), null))
    const code = resp?.status() ?? 0
    await page.waitForTimeout(1200)
    rec("doctor: http", code === 200, `GET ${url} → ${code || "no response"}`)
    rec("doctor: home pill", (await page.locator("#xbm-home-link").count()) === 1, "#xbm-home-link present (injected by build-all.ts)")
    const heading = readFileSync(join(APPS, slug, "README.md"), "utf8").match(/^# (.+)$/m)?.[1]?.trim() ?? ""
    rec("doctor: identity", (await page.title()).length > 0, `title "${await page.title()}"; README heading "${heading}"`)
    rec("doctor: console", errors.length === 0, errors.length ? errors.slice(0, 5).join(" ; ") : "no console errors / page errors on load")

    // drive
    const d = DRIVES[slug]
    if (!d) rec("drive", false, `no recipe in DRIVES for ${slug} — add one (and features/${slug}.md)`)
    else {
      s.feature = d.feature
      await page.screenshot({ path: join(dir, "before.png") }); ev("before.png")
      const before = await snapshot(page)
      for (const t of d.steps) {
        const l = locate(page, t)
        await l.scrollIntoViewIfNeeded({ timeout: 10_000 })
        await l.click({ timeout: 10_000 })
      }
      await page.waitForLoadState("networkidle").catch(() => {})
      await page.waitForTimeout(1500)
      const after = await snapshot(page)
      const textOk = d.expectText ? new RegExp(d.expectText).test(await page.locator("body").innerText()) : true
      rec("drive", before !== after && textOk, `${d.feature}: UI state ${before !== after ? "changed" : "UNCHANGED"}${d.expectText ? `, expect ${d.expectText} ${textOk ? "found" : "MISSING"}` : ""}`)
      await page.screenshot({ path: join(dir, "after.png") }); ev("after.png")
      writeFileSync(join(dir, "after.aria.yml"), await page.locator("body").ariaSnapshot().catch((e) => `aria snapshot failed: ${e}`)); ev("after.aria.yml")
      const late = errors.length
      rec("drive: console", late === 0, late ? errors.slice(0, 5).join(" ; ") : "no console errors during drive")
    }
    bodyText = await page.locator("body").innerText().catch(() => "")
  } catch (e) {
    rec("drive", false, (e as Error).message.split("\n")[0])
  } finally {
    const video = page.video()
    await ctx.close()
    const vp = await video?.path().catch(() => undefined)
    if (vp && existsSync(vp)) { renameSync(vp, join(dir, "drive.webm")); ev("drive.webm") }
    else rec("evidence: video", false, "no video recorded")
  }

  // tracking
  try {
    const tr = JSON.parse(readFileSync(join(ROOT, "tracking/seen-bookmarks.json"), "utf8"))
    const e = (tr.built ?? []).find((x: any) => x.slug === slug)
    const date = /^\d{4}-\d{2}-\d{2}$/
    const bad = !e ? "no built[] entry with this slug" : !date.test(e.built ?? "") ? `built "${e.built}" is not YYYY-MM-DD`
      : (e.updates ?? []).some((u: any) => !date.test(u.date ?? "") || !u.changes) ? "an updates[] item lacks date/changes" : ""
    rec("check: tracking", !bad, bad || `built ${e.built}${e.updates ? `, ${e.updates.length} update(s), latest ${e.updates.at(-1).date}` : ""}`)
  } catch (err) { rec("check: tracking", false, (err as Error).message) }

  // sensitive scan: rendered text + every shipped text file of the demo + its README
  const deny = denylist()
  const hits = scanText("rendered page", bodyText, deny)
  const distDir = join(DIST, slug)
  const files = existsSync(distDir) ? walk(distDir).filter((f) => [".html", ".js", ".css", ".json", ".md", ".txt", ".svg", ".mjs"].includes(extname(f))) : []
  for (const f of [...files, join(APPS, slug, "README.md")]) if (statSync(f).size < 8_000_000) hits.push(...scanText(relative(ROOT, f), readFileSync(f, "utf8"), deny))
  writeFileSync(join(dir, "sensitive-scan.txt"), (hits.length ? hits.join("\n") : "clean") + `\n(${files.length} dist files + README + rendered text; denylist terms: ${deny.length})\n`); ev("sensitive-scan.txt")
  const hard = hits.filter((h) => !h.startsWith("email:"))
  for (const h of hits.filter((h) => h.startsWith("email:"))) s.warnings.push(`review ${h}`)
  rec("check: sensitive", hard.length === 0, hard.length ? hard.slice(0, 8).join(" ; ") : `no internal paths/links/keys${deny.length ? "/denylist terms" : ""}; ${hits.length - hard.length} email(s) to review`)
  if (!deny.length) s.warnings.push("no denylist (skills/verify-xbm/denylist.local.txt or XBM_VERIFY_DENYLIST): names / internal project names not scanned")

  // light + dark thumbnails (rule 12/13), via the repo's own script
  if (!noShoot) {
    const args = ["scripts/shoot.ts", ...(base && !base.startsWith("http://127.0.0.1") ? ["--base", base] : []), slug]
    const r = Bun.spawnSync(["bun", ...args], { cwd: ROOT, env: process.env })
    const out = (r.stdout.toString() + r.stderr.toString()).trim()
    const art = join(APPS, slug, "artifacts")
    for (const f of ["screenshot.png", "screenshot-dark.png"]) if (existsSync(join(art, f))) { copyFileSync(join(art, f), join(dir, f)); ev(f) }
    const dark = existsSync(join(art, "screenshot-dark.png"))
    rec("evidence: light/dark", r.exitCode === 0 && dark, `${out.split("\n").at(-1)}${dark ? "" : " — no dark shot: demo may not follow prefers-color-scheme (rule 13)"}`)
  }

  if (s.result === "RUNNING") s.result = "PASS"
  save(dir, s)
  return s
}

mkdirSync(outRoot, { recursive: true })
const server = base ? null : serveDist()
base ??= server!.url
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const results: Status[] = []
try {
  for (const slug of slugs) {
    const dir = join(outRoot, slug)
    mkdirSync(dir, { recursive: true })
    try { results.push(await verify(browser, slug, dir)) }
    catch (e) {
      const s: Status = { slug, result: "FAIL", url: `${base}/${slug}/`, steps: [{ step: "runner", ok: false, detail: (e as Error).message, at: new Date().toISOString() }], evidence: [], warnings: [] }
      save(dir, s); results.push(s)
    }
  }
} finally {
  // cleanup: only what this run started
  await browser.close()
  server?.stop()
}
const summary = ["| demo | result | feature driven | failed steps |", "|---|---|---|---|",
  ...results.map((r) => `| ${r.slug} | ${r.result} | ${r.feature ?? ""} | ${r.steps.filter((x) => !x.ok).map((x) => x.step).join(", ")} |`)].join("\n")
writeFileSync(join(outRoot, "SUMMARY.md"), summary + "\n")
console.log(`\n${summary}\n\nevidence: ${relative(ROOT, outRoot) || outRoot}/<slug>/ (STATUS.md, status.json, drive.webm, before/after.png, screenshot*.png, sensitive-scan.txt)`)
process.exit(results.every((r) => r.result === "PASS") ? 0 : 1)
