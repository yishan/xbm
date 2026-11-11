/**
 * Morphological open/close, jaggy removal, alpha binarize.
 * Ported from unfake.js browser-tool/lib/cvfree.js and utils.js (MIT).
 */

import { cloneRaster, type Raster } from "./raster"

function morph2x2(img: Raster, useMax: boolean): Raster {
  const { data, width, height } = img
  const out = new Uint8ClampedArray(data.length)
  const nb = [
    [-1, -1],
    [0, -1],
    [-1, 0],
    [0, 0],
  ]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      for (let ch = 0; ch < 4; ch++) {
        let v = useMax ? 0 : 255
        for (let k = 0; k < 4; k++) {
          const nx = x + nb[k][0]
          const ny = y + nb[k][1]
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          const s = data[(ny * width + nx) * 4 + ch]
          v = useMax ? (s > v ? s : v) : s < v ? s : v
        }
        out[o + ch] = v
      }
    }
  }
  return { data: out, width, height }
}

/** Open then close with a 2×2 kernel. Removes specks and fills pinholes. */
export function morphologicalCleanup(img: Raster): Raster {
  const eroded = morph2x2(img, false)
  const opened = morph2x2(eroded, true)
  const dilated = morph2x2(opened, true)
  return morph2x2(dilated, false)
}

export function alphaBinarize(img: Raster, threshold: number): Raster {
  const out = new Uint8ClampedArray(img.data)
  const t = Math.max(0, Math.min(255, Math.round(threshold)))
  for (let i = 3; i < out.length; i += 4) out[i] = out[i] >= t ? 255 : 0
  return { data: out, width: img.width, height: img.height }
}

/** Drop isolated diagonal pixels ("jaggies") on the 1× grid. */
export function jaggyClean(img: Raster): Raster {
  const { width, height } = img
  const out = new Uint8ClampedArray(img.data)
  const opaque = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return false
    return out[(y * width + x) * 4 + 3] > 128
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!opaque(x, y)) continue
      const orth =
        Number(opaque(x, y - 1)) + Number(opaque(x, y + 1)) + Number(opaque(x + 1, y)) + Number(opaque(x - 1, y))
      const diag =
        Number(opaque(x + 1, y - 1)) +
        Number(opaque(x - 1, y - 1)) +
        Number(opaque(x + 1, y + 1)) +
        Number(opaque(x - 1, y + 1))
      if (orth === 0 && diag === 1) {
        const i = (y * width + x) * 4
        out[i] = 0
        out[i + 1] = 0
        out[i + 2] = 0
        out[i + 3] = 0
      }
    }
  }
  return { data: out, width, height }
}

/** Binary alpha; fully transparent pixels become black so they don't tint exports. */
export function finalizePixels(img: Raster): Raster {
  const data = new Uint8ClampedArray(img.data)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
    } else {
      data[i + 3] = 255
    }
  }
  return { data, width: img.width, height: img.height }
}

export function countOpaque(img: Raster): number {
  const seen = new Set<number>()
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 128) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])
  }
  return seen.size
}

export function opaqueCopy(img: Raster): Raster {
  return cloneRaster(img)
}
