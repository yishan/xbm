/**
 * Site-wide Skullet skeleton for every HTML page build-all emits.
 *
 * Vendored from skullet@0.0.3 (MIT, https://skullet.lochie.me/).
 * Rebuild the browser bundle from the repo root after `bun add -d skullet@0.0.3`:
 *
 *   bun build scripts/skullet/boot.ts --outfile=scripts/vendor/skullet/boot.js \
 *     --target=browser --minify --define 'process.env.NODE_ENV="production"'
 *
 * scripts/build-all.ts copies scripts/vendor/skullet/{boot.js,styles.css,LICENSE}
 * to dist/_skullet/ and injects the script before </body>. No runtime CDN.
 *
 * Static pages (index gallery `[data-xbm-skel]`, `<main>`, or the rest of `<body>`)
 * keep their real nodes. `<skullet-reveal loading>` measures them, then `show()`
 * once fonts and on-screen images settle. The id `xbm:` + pathname remembers that
 * shape for the next visit.
 *
 * SPA mounts (`#root` or `#app`) stay where the framework put them — reparenting
 * breaks `body > #root` selectors, and `display:none` zeroes canvases. A remembered
 * shape is drawn at once. With no shape, an empty mount is left under the cover
 * (never Skullet's three-line fallback) until it has real content; that content is
 * cloned into an overlay and measured. `?xbm-skel=off` skips this. `?xbm-skel=hold`
 * or `?xbm-skel=<ms>` keeps the skeleton up on a fast load.
 */
import "skullet/element"

const HOLD = "xbm-hold"
const SHAPE_KEY = "skullet:shapes"
const SHAPE_VERSION = 2
const SAFETY_MS = 12_000

type SkulletRevealElement = HTMLElement & {
  show: (content: Node | string) => void
}

type Mode = { kind: "flow"; el: HTMLElement } | { kind: "mount"; el: HTMLElement } | { kind: "none" }

let released = false
let safety = 0

function shapeId(): string {
  return "xbm:" + location.pathname
}

function loadingLabel(): string {
  return document.documentElement.lang.toLowerCase().startsWith("zh") ? "正在加载" : "Loading"
}

/** Extra time the skeleton stays visible. -1 turns the feature off. */
function forcedHold(): number {
  const raw = new URLSearchParams(location.search).get("xbm-skel")
  if (raw === "off") return -1
  if (raw === "hold") return 900
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0) return Math.min(n, 8_000)
  return 0
}

function phase(value: "boot" | "skeleton" | "done") {
  document.documentElement.setAttribute("data-xbm-skel-phase", value)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Resolves on a task that runs after the next paint. */
function afterPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0)
    })
  })
}

function reducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
}

function hasShape(id: string): boolean {
  try {
    const raw = JSON.parse(localStorage.getItem(SHAPE_KEY) ?? "null") as {
      v?: number
      shapes?: Record<string, string>
    } | null
    const html = raw?.shapes?.[id]
    return raw?.v === SHAPE_VERSION && typeof html === "string" && html.length > 0
  } catch {
    return false
  }
}

function release() {
  if (released) return
  released = true
  clearTimeout(safety)
  document.documentElement.classList.remove(HOLD)
  phase("done")
  document.documentElement.setAttribute("data-xbm-skullet", "done")
  for (const id of ["root", "app"]) {
    const mount = document.getElementById(id)
    if (!mount) continue
    mount.inert = false
    mount.removeAttribute("aria-busy")
  }
  const overlay = document.getElementById("xbm-skel")
  overlay?.dispatchEvent(new Event("xbm-stop"))
  overlay?.remove()
  document.getElementById("xbm-skel-status")?.remove()
}

function announce() {
  if (document.getElementById("xbm-skel-status")) return
  const el = document.createElement("div")
  el.id = "xbm-skel-status"
  el.setAttribute("role", "status")
  el.textContent = loadingLabel()
  el.style.cssText =
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0"
  document.body.append(el)
}

function clearAnnounce() {
  document.getElementById("xbm-skel-status")?.remove()
}

function isChromeNode(el: Element): boolean {
  const tag = el.tagName
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK" || tag === "NOSCRIPT") return true
  return el.id === "xbm-home-link" || el.id === "xbm-update-log" || el.id === "xbm-skel" || el.id === "xbm-skel-status"
}

function detect(): Mode {
  const marked = document.querySelector<HTMLElement>("[data-xbm-skel]")
  if (marked) return { kind: "flow", el: marked }
  const mount = document.getElementById("root") ?? document.getElementById("app")
  if (mount) return { kind: "mount", el: mount }
  const main = document.querySelector<HTMLElement>("main")
  if (main) return { kind: "flow", el: main }
  const kids = [...document.body.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !isChromeNode(el))
  if (kids.length === 0) return { kind: "none" }
  if (kids.length === 1) return { kind: "flow", el: kids[0] }
  const wrap = document.createElement("div")
  wrap.setAttribute("data-xbm-skel", "page")
  kids[0].parentNode?.insertBefore(wrap, kids[0])
  for (const kid of kids) wrap.append(kid)
  return { kind: "flow", el: wrap }
}

function wrapInReveal(el: HTMLElement, id: string): SkulletRevealElement {
  const reveal = document.createElement("skullet-reveal") as SkulletRevealElement
  reveal.id = id
  reveal.setAttribute("loading", "")
  reveal.setAttribute("label", loadingLabel())
  const parent = el.parentNode
  if (!parent) return reveal
  const next = el.nextSibling
  reveal.append(el)
  parent.insertBefore(reveal, next)
  return reveal
}

function pendingImages(scope: ParentNode): HTMLImageElement[] {
  return [...scope.querySelectorAll("img")].filter((img) => {
    if (img.complete) return false
    const rect = img.getBoundingClientRect()
    if (rect.width < 2 && rect.height < 2) return false
    if (img.loading === "lazy" && rect.top > innerHeight + 80) return false
    return true
  })
}

async function settle(scope: ParentNode) {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const images = pendingImages(scope)
  for (const img of images) {
    if (img.loading === "lazy") img.loading = "eager"
  }
  await Promise.race([
    Promise.all([fonts, ...images.map((img) => img.decode().catch(() => undefined))]),
    sleep(1_500),
  ])
}

async function holdRemaining(shownAt: number) {
  const extra = forcedHold()
  if (extra <= 0) return
  const wait = Math.max(0, extra - (performance.now() - shownAt))
  if (wait > 0) await sleep(wait)
}

function revealNow(reveal: SkulletRevealElement) {
  const ghost = reveal.querySelector("[skullet-ghost]")
  if (!ghost?.childNodes.length) return
  const frag = document.createDocumentFragment()
  frag.append(...[...ghost.childNodes])
  reveal.show(frag)
}

async function startFlow(el: HTMLElement) {
  const reveal = wrapInReveal(el, shapeId())
  clearAnnounce()
  phase("skeleton")
  // The cover would hide an in-flow skeleton. Bones are the loading state now.
  document.documentElement.classList.remove(HOLD)
  const shownAt = performance.now()
  await afterPaint()
  if (released) return
  await settle(reveal)
  if (released) return
  await holdRemaining(shownAt)
  if (released) return
  revealNow(reveal)
  release()
}

function pageBackground(): string {
  const color = getComputedStyle(document.body).backgroundColor
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") return "Canvas"
  return color
}

function mountOverlay(): HTMLElement {
  const overlay = document.createElement("div")
  overlay.id = "xbm-skel"
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:2147482000;overflow:hidden;pointer-events:auto;background:Canvas"
  let raf = 0
  const tick = () => {
    if (!overlay.isConnected) return
    overlay.style.backgroundColor = pageBackground()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  overlay.addEventListener(
    "xbm-stop",
    () => {
      cancelAnimationFrame(raf)
    },
    { once: true },
  )
  document.body.append(overlay)
  return overlay
}

async function dismiss(overlay: HTMLElement | null) {
  if (!overlay?.isConnected) return
  overlay.dispatchEvent(new Event("xbm-stop"))
  if (!reducedMotion()) {
    overlay.style.transition = "opacity 200ms ease"
    overlay.style.opacity = "0"
    await Promise.race([
      new Promise<void>((resolve) => {
        overlay.addEventListener("transitionend", () => resolve(), { once: true })
      }),
      sleep(260),
    ])
  }
  overlay.remove()
}

function mountRecall(id: string): HTMLElement {
  const overlay = mountOverlay()
  const reveal = document.createElement("skullet-reveal")
  reveal.id = id
  reveal.setAttribute("loading", "")
  reveal.setAttribute("label", loadingLabel())
  overlay.append(reveal)
  return overlay
}

function cloneForMeasure(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement
  const live = [source, ...source.querySelectorAll("img, canvas, video, svg")]
  const copied = [clone, ...clone.querySelectorAll("img, canvas, video, svg")]
  for (let i = 0; i < live.length; i++) {
    const from = live[i]
    const to = copied[i] as HTMLElement | undefined
    if (!from || !to || from === source) continue
    const rect = from.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    to.style.boxSizing = "border-box"
    to.style.width = `${rect.width}px`
    to.style.height = `${rect.height}px`
  }
  clone.querySelectorAll("script, iframe, video, audio, link").forEach((node) => node.remove())
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"))
  clone.removeAttribute("id")
  clone.querySelectorAll("img").forEach((img) => {
    img.removeAttribute("src")
    img.removeAttribute("srcset")
    img.alt = ""
  })
  return clone
}

function mountMeasured(mount: HTMLElement, id: string): HTMLElement {
  const overlay = mountOverlay()
  const reveal = document.createElement("skullet-reveal")
  const rect = mount.getBoundingClientRect()
  reveal.id = id
  reveal.setAttribute("loading", "")
  reveal.setAttribute("label", loadingLabel())
  reveal.style.position = "absolute"
  reveal.style.left = `${Math.max(rect.left, 0)}px`
  reveal.style.top = `${Math.max(rect.top, 0)}px`
  reveal.style.width = `${Math.max(rect.width, 1)}px`
  reveal.append(cloneForMeasure(mount))
  overlay.append(reveal)
  return overlay
}

function meaningful(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  if (rect.height < 48) return false
  const nodes = el.querySelectorAll("*").length
  const text = el.textContent?.trim().length ?? 0
  if (nodes >= 6 && (text >= 8 || rect.height >= 120)) return true
  return !!el.querySelector("canvas, svg, img, video") && rect.height >= 80
}

function waitMeaningful(el: HTMLElement): Promise<void> {
  if (meaningful(el)) return Promise.resolve()
  return new Promise((resolve) => {
    const start = performance.now()
    let timer = 0
    const finish = () => {
      obs.disconnect()
      clearInterval(timer)
      resolve()
    }
    const tick = () => {
      if (meaningful(el) || performance.now() - start > 8_000 || released) finish()
    }
    const obs = new MutationObserver(tick)
    obs.observe(el, { childList: true, subtree: true, characterData: true, attributes: true })
    timer = window.setInterval(tick, 80)
    tick()
  })
}

function remember(source: HTMLElement, id: string) {
  if (source.querySelectorAll("*").length > 8_000) return
  const rect = source.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return
  const reveal = document.createElement("skullet-reveal")
  reveal.id = id
  reveal.setAttribute("aria-hidden", "true")
  reveal.style.cssText = `position:fixed;left:${rect.left}px;top:0;width:${rect.width}px;visibility:hidden;pointer-events:none;z-index:-1`
  // Children have to be in place before the element connects; connectedCallback only runs once.
  reveal.append(cloneForMeasure(source))
  document.body.append(reveal)
  window.setTimeout(() => reveal.remove(), 800)
}

function quiet(mount: HTMLElement): boolean {
  const fontsReady = !document.fonts || document.fonts.status === "loaded"
  const imagesReady = [...mount.querySelectorAll("img")].every(
    (img) => img.complete || img.getBoundingClientRect().top > innerHeight + 80,
  )
  return fontsReady && imagesReady
}

async function startMount(mount: HTMLElement) {
  mount.inert = true
  mount.setAttribute("aria-busy", "true")
  const id = shapeId()
  const bootAt = performance.now()
  let overlay: HTMLElement | null = null
  let shownAt = bootAt
  if (hasShape(id)) {
    overlay = mountRecall(id)
    clearAnnounce()
    phase("skeleton")
    document.documentElement.classList.remove(HOLD)
    shownAt = performance.now()
  }
  await waitMeaningful(mount)
  if (released) return
  // A fast hydrate (under 150ms, nothing left to settle) skips the skeleton so it never flashes.
  // Anything slower gets a skeleton of the layout that just arrived.
  const showMeasured =
    forcedHold() > 0 || !quiet(mount) || performance.now() - bootAt > 150
  if (!overlay && mount.querySelectorAll("*").length <= 8_000 && showMeasured) {
    overlay = mountMeasured(mount, id)
    clearAnnounce()
    phase("skeleton")
    document.documentElement.classList.remove(HOLD)
    shownAt = performance.now()
    await afterPaint()
  }
  if (released) return
  if (overlay) {
    await settle(mount)
    if (released) return
    await holdRemaining(shownAt)
    if (released) return
    await dismiss(overlay)
  }
  release()
  remember(mount, id)
}

function boot() {
  safety = window.setTimeout(release, SAFETY_MS)
  const mode = detect()
  switch (mode.kind) {
    case "flow":
      clearAnnounce()
      void startFlow(mode.el).catch(() => release())
      break
    case "mount":
      announce()
      void startMount(mode.el).catch(() => release())
      break
    case "none":
      release()
      break
    default: {
      const neverMode: never = mode
      return neverMode
    }
  }
}

if (!document.documentElement.hasAttribute("data-xbm-skullet")) {
  document.documentElement.setAttribute("data-xbm-skullet", "boot")
  phase("boot")
  if (forcedHold() < 0) release()
  else {
    try {
      boot()
    } catch {
      release()
    }
  }
}
