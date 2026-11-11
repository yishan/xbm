/**
 * Integer pixel-grid detection.
 * Ported from the MIT JavaScript fallback in unfake.js
 * (browser-tool/lib/cvfree.js, edge-detect.js, pixel.js) at 6636868.
 * Fractional and elastic grids stay in upstream's WASM build and are not shipped.
 */

import type { Raster } from "./raster"

function maxPeriod(n: number): number {
  return Math.max(2, Math.min(Math.floor(n / 8), 128))
}

/** Autocorrelation peak of a 1D boundary signal. */
export function peakLag(sig: ArrayLike<number>): number {
  const n = sig.length
  const maxLag = maxPeriod(n)
  let mean = 0
  for (let i = 0; i < n; i++) mean += sig[i]
  mean /= n || 1
  const centered = new Float64Array(n)
  let norm = 0
  for (let i = 0; i < n; i++) {
    centered[i] = sig[i] - mean
    norm += centered[i] * centered[i]
  }
  norm = norm || 1e-9
  const ac = new Float64Array(maxLag + 2)
  for (let lag = 2; lag <= maxLag; lag++) {
    let r = 0
    for (let i = 0; i + lag < n; i++) r += centered[i] * centered[i + lag]
    ac[lag] = r / norm
  }
  let start = 2
  const cap = Math.max(3, Math.floor(maxLag / 2))
  while (start < cap && ac[start + 1] <= ac[start]) start++

  let gmax = 0
  let gp = start
  for (let p = start; p <= maxLag; p++) {
    if (ac[p] > gmax) {
      gmax = ac[p]
      gp = p
    }
  }
  if (gmax <= 0) return 1
  const thr = 0.6 * gmax
  for (let p = start; p <= maxLag; p++) {
    if (ac[p] >= thr && ac[p] >= ac[p - 1] && ac[p] >= ac[p + 1]) return p
  }
  return gp
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

/** Runs-based scale: GCD of horizontal and vertical constant-color runs. */
export function runsBasedDetect(img: Raster): number {
  const { data, width, height } = img
  const runs: number[] = []
  const scan = (horizontal: boolean) => {
    const primary = horizontal ? height : width
    const secondary = horizontal ? width : height
    for (let i = 0; i < primary; i++) {
      let run = 1
      for (let j = 1; j < secondary; j++) {
        const idx1 = (horizontal ? i * width + j : j * width + i) * 4
        const idx2 = (horizontal ? i * width + (j - 1) : (j - 1) * width + i) * 4
        const same =
          data[idx1] === data[idx2] &&
          data[idx1 + 1] === data[idx2 + 1] &&
          data[idx1 + 2] === data[idx2 + 2] &&
          data[idx1 + 3] === data[idx2 + 3]
        if (same) run++
        else {
          if (run > 1) runs.push(run)
          run = 1
        }
      }
      if (run > 1) runs.push(run)
    }
  }
  scan(true)
  scan(false)
  if (runs.length < 10) return 1
  let g = runs[0]
  for (let i = 1; i < runs.length; i++) {
    g = gcd(g, runs[i])
    if (g === 1) return 1
  }
  return Math.max(1, g)
}

const KX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
const KY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

function reflect(i: number, n: number): number {
  if (n <= 1) return 0
  let v = i
  while (v < 0 || v >= n) {
    if (v < 0) v = -v
    if (v >= n) v = 2 * (n - 1) - v
  }
  return v
}

function toGray(img: Raster): Float64Array {
  const { data, width, height } = img
  const g = new Float64Array(width * height)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    g[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return g
}

function sobelProfiles(
  g: Float64Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  rw: number,
  rh: number,
): { profX: Float64Array; profY: Float64Array } {
  const profX = new Float64Array(rw)
  const profY = new Float64Array(rh)
  for (let ly = 0; ly < rh; ly++) {
    for (let lx = 0; lx < rw; lx++) {
      const y = y0 + ly
      const x = x0 + lx
      let sx = 0
      let sy = 0
      let k = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++, k++) {
          const v = g[reflect(y + dy, height) * width + reflect(x + dx, width)]
          sx += v * KX[k]
          sy += v * KY[k]
        }
      }
      profX[lx] += Math.abs(sx)
      profY[ly] += Math.abs(sy)
    }
  }
  return { profX, profY }
}

function regionStddev(g: Float64Array, width: number, x0: number, y0: number, rw: number, rh: number): number {
  let sum = 0
  let sum2 = 0
  const n = rw * rh
  for (let ly = 0; ly < rh; ly++) {
    for (let lx = 0; lx < rw; lx++) {
      const v = g[(y0 + ly) * width + (x0 + lx)]
      sum += v
      sum2 += v * v
    }
  }
  const mean = sum / n
  return Math.sqrt(Math.max(0, sum2 / n - mean * mean))
}

function scalesFromRoi(
  g: Float64Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  rw: number,
  rh: number,
): { h: number; v: number } {
  if (rw < 3 || rh < 3) return { h: 1, v: 1 }
  const { profX, profY } = sobelProfiles(g, width, height, x0, y0, rw, rh)
  return { h: peakLag(profX), v: peakLag(profY) }
}

function modeOf(arr: number[]): number {
  if (!arr.length) return 0
  const counts = new Map<number, number>()
  let max = 0
  let res = arr[0]
  for (const v of arr) {
    const c = (counts.get(v) ?? 0) + 1
    counts.set(v, c)
    if (c > max) {
      max = c
      res = v
    }
  }
  return res
}

export function singleRegionEdgeDetect(img: Raster): number {
  const g = toGray(img)
  const { width, height } = img
  const x0 = Math.floor(width * 0.125)
  const y0 = Math.floor(height * 0.125)
  const rw = Math.floor(width * 0.75)
  const rh = Math.floor(height * 0.75)
  if (rw < 3 || rh < 3) return 1
  const { h, v } = scalesFromRoi(g, width, height, x0, y0, rw, rh)
  if (h > 1 && v > 1 && Math.abs(h - v) <= 2) return Math.round((h + v) / 2)
  return Math.max(h, v, 1)
}

export function tiledEdgeDetect(img: Raster): number {
  const g = toGray(img)
  const { width, height } = img
  const tiles = 3
  const overlap = 0.25
  const tileW = Math.floor(width / tiles)
  const tileH = Math.floor(height / tiles)
  if (tileW < 50 || tileH < 50) return singleRegionEdgeDetect(img)
  const overlapW = Math.floor(tileW * overlap)
  const overlapH = Math.floor(tileH * overlap)
  const scales: number[] = []
  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      const x0 = Math.max(0, tx * tileW - overlapW)
      const y0 = Math.max(0, ty * tileH - overlapH)
      const rw = Math.min(width - x0, tileW + 2 * overlapW)
      const rh = Math.min(height - y0, tileH + 2 * overlapH)
      if (rw < 30 || rh < 30) continue
      if (regionStddev(g, width, x0, y0, rw, rh) < 5) continue
      const { h, v } = scalesFromRoi(g, width, height, x0, y0, rw, rh)
      if (h > 1) scales.push(h)
      if (v > 1) scales.push(v)
    }
  }
  if (scales.length === 0) return singleRegionEdgeDetect(img)
  return modeOf(scales) || 1
}

function opaqueRatio(img: Raster): number {
  let n = 0
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] > 128) n++
  return n / (img.width * img.height)
}

/**
 * Automatic integer scale. Edge-aware first (robust on soft AI edges),
 * then runs when the picture is already hard-edged.
 * Sprites with a clear margin trust the center region; full-frame pictures
 * can use the tiled vote.
 */
export function detectScale(img: Raster): number {
  const single = img.width >= 24 && img.height >= 24 ? singleRegionEdgeDetect(img) : 1
  const tiled = img.width >= 160 && img.height >= 160 ? tiledEdgeDetect(img) : single
  let edge = 1
  if (single > 1 && tiled > 1 && Math.abs(single - tiled) <= 1) edge = Math.round((single + tiled) / 2)
  else if (opaqueRatio(img) < 0.72 && single > 1) edge = single
  else if (tiled > 1) edge = tiled
  else if (single > 1) edge = single
  const runs = runsBasedDetect(img)
  // Constant-color runs are exact on hard pixels and collapse on a soft edge.
  // Trust them when they agree with the edge estimate, or when edges found nothing.
  const scale = runs > 1 && (edge <= 1 || Math.abs(runs - edge) <= 1) ? runs : edge > 1 ? edge : runs
  const cap = Math.max(1, Math.floor(Math.min(img.width, img.height) / 2))
  return Math.max(1, Math.min(cap, scale))
}
