#!/usr/bin/env bun
/**
 * Take the index thumbnails for every demo, once per color scheme:
 *
 *   apps/<slug>/artifacts/screenshot.png       prefers-color-scheme: light
 *   apps/<slug>/artifacts/screenshot-dark.png  prefers-color-scheme: dark (only if the demo actually changes)
 *
 * Shoots the built site in ./dist, so run the root build first:
 *   bash scripts/build-all.sh [slug…] && bun scripts/shoot.ts [slug…]
 * Or shoot a deployed site instead:  bun scripts/shoot.ts --base https://li.yishan.app [slug…]
 *
 * 1280×800 matches the index's 16:10 thumbnail box. Reduced motion is on so shots are stable.
 * Needs Playwright's Chromium (`bunx playwright install chromium`), or point CHROMIUM_PATH at a Chromium binary.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join, normalize, resolve } from "node:path"
import { chromium, type Browser } from "playwright"

const ROOT = resolve(import.meta.dir, "..")
const APPS = join(ROOT, "apps")
const DIST = join(ROOT, "dist")
const VIEWPORT = { width: 1280, height: 800 }
// Mean luminance (0–255) the dark shot must drop by to count as a real dark theme.
const DARK_MIN_DROP = 30

const args = process.argv.slice(2)
const baseIdx = args.indexOf("--base")
let base = baseIdx >= 0 ? args.splice(baseIdx, 2)[1]?.replace(/\/$/, "") : undefined
const only = new Set(args)

/** Minimal static server for ./dist with the same trailing-slash → index.html behaviour as Vercel. */
function serveDist(): { url: string; stop: () => void } {
  if (!existsSync(join(DIST, "index.html"))) throw new Error("no dist/ — run `bash scripts/build-all.sh` first (or pass --base)")
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = normalize(decodeURIComponent(new URL(req.url).pathname)).replace(/^(\.\.[/\\])+/, "")
      let file = join(DIST, path)
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html")
      return existsSync(file) ? new Response(Bun.file(file)) : new Response("not found", { status: 404 })
    },
  })
  return { url: `http://127.0.0.1:${server.port}`, stop: () => server.stop(true) }
}

async function shoot(browser: Browser, url: string, scheme: "light" | "dark"): Promise<Buffer> {
  const ctx = await browser.newContext({ colorScheme: scheme, reducedMotion: "reduce", viewport: VIEWPORT })
  try {
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => page.waitForLoadState("load"))
    await page.waitForTimeout(1200)
    // The injected "← Experiments" pill isn't part of the demo.
    await page.evaluate(() => document.querySelectorAll("#xbm-home-link, #xbm-home-link-style").forEach((el) => el.remove()))
    return await page.screenshot()
  } finally {
    await ctx.close()
  }
}

/** Mean luminance of a PNG, decoded in the browser to avoid an image dependency. */
async function meanLuminance(browser: Browser, png: Buffer): Promise<number> {
  const page = await browser.newPage()
  try {
    return await page.evaluate(async (src) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const c = document.createElement("canvas")
      c.width = 160
      c.height = 100
      const g = c.getContext("2d")!
      g.drawImage(img, 0, 0, c.width, c.height)
      const d = g.getImageData(0, 0, c.width, c.height).data
      let sum = 0
      for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
      return sum / (d.length / 4)
    }, `data:image/png;base64,${png.toString("base64")}`)
  } finally {
    await page.close()
  }
}

async function main() {
  const slugs = readdirSync(APPS)
    .filter((s) => !s.startsWith(".") && existsSync(join(APPS, s, "package.json")))
    .filter((s) => only.size === 0 || only.has(s))
    .sort()
  const server = base ? null : serveDist()
  base ??= server!.url
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  const failed: string[] = []
  try {
    for (const slug of slugs) {
      try {
        const url = `${base}/${slug}/`
        const light = await shoot(browser, url, "light")
        const dark = await shoot(browser, url, "dark")
        const [l, d] = [await meanLuminance(browser, light), await meanLuminance(browser, dark)]
        const art = join(APPS, slug, "artifacts")
        mkdirSync(art, { recursive: true })
        writeFileSync(join(art, "screenshot.png"), light)
        const darkFile = join(art, "screenshot-dark.png")
        const hasDark = l - d >= DARK_MIN_DROP
        if (hasDark) writeFileSync(darkFile, dark)
        else rmSync(darkFile, { force: true })
        console.log(`[shoot] ${slug}: luminance light ${l.toFixed(0)} / dark ${d.toFixed(0)} → ${hasDark ? "light + dark" : "single screenshot"}`)
      } catch (e) {
        console.error(`[shoot] ${slug}: ${(e as Error).message.split("\n")[0]}`)
        failed.push(slug)
      }
    }
  } finally {
    await browser.close()
    server?.stop()
  }
  if (failed.length) {
    console.error(`[shoot] FAILED: ${failed.join(", ")}`)
    process.exit(1)
  }
}

main()
