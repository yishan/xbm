/**
 * Grid snap: Sobel energy along each axis, crop to the phase that hits the most edges.
 * Ported from unfake.js browser-tool/lib/cvfree.js (MIT).
 */

import { cropRaster, type Raster } from "./raster"

function findOptimalCropOffset(img: Raster, scale: number): { x: number; y: number } {
  const { data, width, height } = img
  const g = new Float64Array(width * height)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    g[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  const refl = (i: number, n: number) => {
    if (n <= 1) return 0
    let v = i
    while (v < 0 || v >= n) {
      if (v < 0) v = -v
      if (v >= n) v = 2 * (n - 1) - v
    }
    return v
  }
  const kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  const profX = new Float64Array(width)
  const profY = new Float64Array(height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sx = 0
      let sy = 0
      let k = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++, k++) {
          const v = g[refl(y + dy, height) * width + refl(x + dx, width)]
          sx += v * kx[k]
          sy += v * ky[k]
        }
      }
      profX[x] += Math.abs(sx)
      profY[y] += Math.abs(sy)
    }
  }
  const best = (prof: Float64Array, s: number) => {
    let bo = 0
    let ms = -1
    for (let o = 0; o < s; o++) {
      let c = 0
      for (let i = o; i < prof.length; i += s) c += prof[i] || 0
      if (c > ms) {
        ms = c
        bo = o
      }
    }
    return bo
  }
  return { x: best(profX, scale), y: best(profY, scale) }
}

export function snapToGrid(img: Raster, scale: number): { raster: Raster; offsetX: number; offsetY: number } {
  if (scale <= 1) return { raster: img, offsetX: 0, offsetY: 0 }
  const crop = findOptimalCropOffset(img, scale)
  const newWidth = Math.floor((img.width - crop.x) / scale) * scale
  const newHeight = Math.floor((img.height - crop.y) / scale) * scale
  if (newWidth < scale || newHeight < scale) return { raster: img, offsetX: 0, offsetY: 0 }
  return {
    raster: cropRaster(img, crop.x, crop.y, newWidth, newHeight),
    offsetX: crop.x,
    offsetY: crop.y,
  }
}
