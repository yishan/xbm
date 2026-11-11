/**
 * Median-cut palette quantizer (Heckbert), written for this demo.
 * Flat cells, no dithering. Not the upstream WASM palette.
 */

import { rgbHex, type Raster } from "./raster"

type HistItem = { c: number; n: number }

type Box = {
  items: HistItem[]
  r0: number
  r1: number
  g0: number
  g1: number
  b0: number
  b1: number
  count: number
}

function bounds(items: HistItem[]): Box {
  let r0 = 255
  let r1 = 0
  let g0 = 255
  let g1 = 0
  let b0 = 255
  let b1 = 0
  let count = 0
  for (const it of items) {
    const r = (it.c >> 16) & 255
    const g = (it.c >> 8) & 255
    const b = it.c & 255
    if (r < r0) r0 = r
    if (r > r1) r1 = r
    if (g < g0) g0 = g
    if (g > g1) g1 = g
    if (b < b0) b0 = b
    if (b > b1) b1 = b
    count += it.n
  }
  return { items, r0, r1, g0, g1, b0, b1, count }
}

function longest(box: Box): number {
  return Math.max(box.r1 - box.r0, box.g1 - box.g0, box.b1 - box.b0)
}

function splitBox(box: Box): [Box, Box] | null {
  if (box.items.length < 2) return null
  const dr = box.r1 - box.r0
  const dg = box.g1 - box.g0
  const db = box.b1 - box.b0
  const shift = dr >= dg && dr >= db ? 16 : dg >= db ? 8 : 0
  const items = box.items.slice().sort((a, b) => ((a.c >> shift) & 255) - ((b.c >> shift) & 255))
  const half = box.count / 2
  let acc = 0
  let i = 0
  for (; i < items.length - 1; i++) {
    acc += items[i].n
    if (acc >= half) {
      i++
      break
    }
  }
  if (i <= 0) i = 1
  if (i >= items.length) i = items.length - 1
  return [bounds(items.slice(0, i)), bounds(items.slice(i))]
}

function average(box: Box): [number, number, number] {
  let r = 0
  let g = 0
  let b = 0
  for (const it of box.items) {
    r += ((it.c >> 16) & 255) * it.n
    g += ((it.c >> 8) & 255) * it.n
    b += (it.c & 255) * it.n
  }
  const n = box.count || 1
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
}

function nearest(r: number, g: number, b: number, pal: Array<[number, number, number]>): number {
  let best = 0
  let bestD = Number.POSITIVE_INFINITY
  for (let i = 0; i < pal.length; i++) {
    const dr = r - pal[i][0]
    const dg = g - pal[i][1]
    const db = b - pal[i][2]
    const d = dr * dr + dg * dg + db * db
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

export function quantize(src: Raster, maxColors: number, ignore?: readonly [number, number, number]): { raster: Raster; palette: string[] } {
  const budget = Math.max(1, Math.min(256, Math.round(maxColors)))
  const hist = new Map<number, number>()
  const d = src.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] <= 128) continue
    if (ignore && d[i] === ignore[0] && d[i + 1] === ignore[1] && d[i + 2] === ignore[2]) continue
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]
    hist.set(key, (hist.get(key) ?? 0) + 1)
  }
  const items: HistItem[] = [...hist.entries()].map(([c, n]) => ({ c, n }))
  if (items.length === 0) {
    return { raster: { data: new Uint8ClampedArray(d), width: src.width, height: src.height }, palette: [] }
  }

  let palette: Array<[number, number, number]>
  if (items.length <= budget) {
    items.sort((a, b) => b.n - a.n || a.c - b.c)
    palette = items.map((it) => [(it.c >> 16) & 255, (it.c >> 8) & 255, it.c & 255])
  } else {
    let boxes = [bounds(items)]
    while (boxes.length < budget) {
      let pick = -1
      let range = 0
      for (let i = 0; i < boxes.length; i++) {
        const span = longest(boxes[i])
        if (boxes[i].items.length > 1 && span > range) {
          range = span
          pick = i
        }
      }
      if (pick < 0 || range === 0) break
      const parts = splitBox(boxes[pick])
      if (!parts) break
      boxes = [...boxes.slice(0, pick), parts[0], parts[1], ...boxes.slice(pick + 1)]
    }
    palette = boxes.map(average)
  }

  const cache = new Map<number, number>()
  const out = new Uint8ClampedArray(d.length)
  const used = new Map<number, number>()
  for (let i = 0; i < d.length; i += 4) {
    const keyed = ignore && d[i] === ignore[0] && d[i + 1] === ignore[1] && d[i + 2] === ignore[2]
    if (d[i + 3] <= 128 || keyed) {
      out[i] = d[i]
      out[i + 1] = d[i + 1]
      out[i + 2] = d[i + 2]
      out[i + 3] = d[i + 3]
      continue
    }
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]
    let idx = cache.get(key)
    if (idx === undefined) {
      idx = nearest(d[i], d[i + 1], d[i + 2], palette)
      cache.set(key, idx)
    }
    const [r, g, b] = palette[idx]
    out[i] = r
    out[i + 1] = g
    out[i + 2] = b
    out[i + 3] = d[i + 3]
    const packed = (r << 16) | (g << 8) | b
    used.set(packed, (used.get(packed) ?? 0) + 1)
  }
  const ordered = [...used.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])
  return {
    raster: { data: out, width: src.width, height: src.height },
    palette: ordered.map(([c]) => rgbHex((c >> 16) & 255, (c >> 8) & 255, c & 255)),
  }
}

export function paletteOf(img: Raster): string[] {
  const counts = new Map<number, number>()
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] <= 128) continue
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([c]) => rgbHex((c >> 16) & 255, (c >> 8) & 255, c & 255))
}

/** Replace one opaque RGB with another. Alpha stays put. */
export function remapColor(img: Raster, from: string, to: string): Raster {
  const a = from.replace("#", "")
  const b = to.replace("#", "")
  if (a.length !== 6 || b.length !== 6) return img
  const fr = Number.parseInt(a.slice(0, 2), 16)
  const fg = Number.parseInt(a.slice(2, 4), 16)
  const fb = Number.parseInt(a.slice(4, 6), 16)
  const tr = Number.parseInt(b.slice(0, 2), 16)
  const tg = Number.parseInt(b.slice(2, 4), 16)
  const tb = Number.parseInt(b.slice(4, 6), 16)
  const data = new Uint8ClampedArray(img.data)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] <= 128) continue
    if (data[i] === fr && data[i + 1] === fg && data[i + 2] === fb) {
      data[i] = tr
      data[i + 1] = tg
      data[i + 2] = tb
    }
  }
  return { data, width: img.width, height: img.height }
}
