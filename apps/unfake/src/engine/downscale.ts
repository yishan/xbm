/**
 * Block downscale: dominant color (with a mean fallback) and per-channel median / nearest.
 * Ported from unfake.js browser-tool/lib/pixel.js and utils.js (MIT).
 */

import { median, type Raster } from "./raster"

export function downscaleDominant(img: Raster, scale: number, threshold = 0.15): Raster {
  const targetW = Math.max(1, Math.floor(img.width / scale))
  const targetH = Math.max(1, Math.floor(img.height / scale))
  const out = new Uint8ClampedArray(targetW * targetH * 4)
  const src = img.data
  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const counts = new Map<number, number>()
      const alphas: number[] = []
      let opaque = 0
      for (let dy = 0; dy < scale; dy++) {
        const sy = ty * scale + dy
        if (sy >= img.height) continue
        for (let dx = 0; dx < scale; dx++) {
          const sx = tx * scale + dx
          if (sx >= img.width) continue
          const i = (sy * img.width + sx) * 4
          const a = src[i + 3]
          alphas.push(a)
          if (a > 128) {
            const key = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2]
            counts.set(key, (counts.get(key) ?? 0) + 1)
            opaque++
          }
        }
      }
      const o = (ty * targetW + tx) * 4
      if (opaque === 0) continue
      let best = 0
      let bestN = 0
      for (const [color, n] of counts) {
        if (n > bestN) {
          bestN = n
          best = color
        }
      }
      let rgb = best
      if (bestN / opaque < threshold) {
        let r = 0
        let g = 0
        let b = 0
        for (const [color, n] of counts) {
          r += ((color >> 16) & 255) * n
          g += ((color >> 8) & 255) * n
          b += (color & 255) * n
        }
        rgb = (Math.round(r / opaque) << 16) | (Math.round(g / opaque) << 8) | Math.round(b / opaque)
      }
      out[o] = (rgb >> 16) & 255
      out[o + 1] = (rgb >> 8) & 255
      out[o + 2] = rgb & 255
      out[o + 3] = median(alphas) > 128 ? 255 : 0
    }
  }
  return { data: out, width: targetW, height: targetH }
}

export function downscaleNearest(img: Raster, scale: number): Raster {
  const targetW = Math.max(1, Math.floor(img.width / scale))
  const targetH = Math.max(1, Math.floor(img.height / scale))
  const out = new Uint8ClampedArray(targetW * targetH * 4)
  const half = Math.floor(scale / 2)
  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const sx = Math.min(img.width - 1, tx * scale + half)
      const sy = Math.min(img.height - 1, ty * scale + half)
      const si = (sy * img.width + sx) * 4
      const o = (ty * targetW + tx) * 4
      out[o] = img.data[si]
      out[o + 1] = img.data[si + 1]
      out[o + 2] = img.data[si + 2]
      out[o + 3] = img.data[si + 3]
    }
  }
  return { data: out, width: targetW, height: targetH }
}

export function downscaleMedian(img: Raster, scale: number): Raster {
  const targetW = Math.max(1, Math.floor(img.width / scale))
  const targetH = Math.max(1, Math.floor(img.height / scale))
  const out = new Uint8ClampedArray(targetW * targetH * 4)
  const d = img.data
  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const rs: number[] = []
      const gs: number[] = []
      const bs: number[] = []
      const as: number[] = []
      for (let dy = 0; dy < scale; dy++) {
        const sy = ty * scale + dy
        if (sy >= img.height) continue
        for (let dx = 0; dx < scale; dx++) {
          const sx = tx * scale + dx
          if (sx >= img.width) continue
          const i = (sy * img.width + sx) * 4
          as.push(d[i + 3])
          if (d[i + 3] > 128) {
            rs.push(d[i])
            gs.push(d[i + 1])
            bs.push(d[i + 2])
          }
        }
      }
      const o = (ty * targetW + tx) * 4
      if (as.length === 0) continue
      out[o] = rs.length ? Math.round(median(rs)) : 0
      out[o + 1] = gs.length ? Math.round(median(gs)) : 0
      out[o + 2] = bs.length ? Math.round(median(bs)) : 0
      out[o + 3] = Math.round(median(as))
    }
  }
  return { data: out, width: targetW, height: targetH }
}
