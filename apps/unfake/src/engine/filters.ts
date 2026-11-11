/**
 * Vector-mode denoise and smoothing.
 * Ported from unfake.js vector.rs (MIT): bilateral, median, gaussian.
 */

import type { Raster } from "./raster"

function clampi(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function odd(k: number): number {
  const n = Math.max(1, Math.round(k))
  return n % 2 === 0 ? n + 1 : n
}

export function bilateral(src: Raster, diameter: number): Raster {
  const { data, width, height } = src
  const radius = Math.max(1, Math.floor(diameter / 2))
  const sigmaColor = Math.max(1, diameter) * 2
  const sigmaSpace = Math.max(1, diameter) / 2
  const gc = -0.5 / (sigmaColor * sigmaColor)
  const gs = -0.5 / (sigmaSpace * sigmaSpace)
  const out = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ci = (y * width + x) * 4
      const cr = data[ci]
      const cg = data[ci + 1]
      const cb = data[ci + 2]
      let ar = 0
      let ag = 0
      let ab = 0
      let wsum = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = clampi(y + dy, 0, height - 1)
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = clampi(x + dx, 0, width - 1)
          const ni = (yy * width + xx) * 4
          const nr = data[ni]
          const ng = data[ni + 1]
          const nb = data[ni + 2]
          const cd = (nr - cr) ** 2 + (ng - cg) ** 2 + (nb - cb) ** 2
          const sd = dx * dx + dy * dy
          const wt = Math.exp(gc * cd + gs * sd)
          ar += wt * nr
          ag += wt * ng
          ab += wt * nb
          wsum += wt
        }
      }
      out[ci] = Math.round(ar / wsum)
      out[ci + 1] = Math.round(ag / wsum)
      out[ci + 2] = Math.round(ab / wsum)
      out[ci + 3] = data[ci + 3]
    }
  }
  return { data: out, width, height }
}

export function medianFilter(src: Raster, kernel: number): Raster {
  const k = odd(kernel)
  const r = (k / 2) | 0
  const { data, width, height } = src
  const out = new Uint8ClampedArray(data.length)
  const buf = new Uint8Array(k * k)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let n = 0
        for (let dy = -r; dy <= r; dy++) {
          const yy = clampi(y + dy, 0, height - 1)
          for (let dx = -r; dx <= r; dx++) {
            const xx = clampi(x + dx, 0, width - 1)
            buf[n++] = data[(yy * width + xx) * 4 + c]
          }
        }
        const slice = buf.subarray(0, n)
        const sorted = [...slice].sort((a, b) => a - b)
        out[(y * width + x) * 4 + c] = sorted[sorted.length >> 1]
      }
    }
  }
  return { data: out, width, height }
}

export function gaussian(src: Raster, kernel: number): Raster {
  const k = odd(kernel)
  const sigma = 0.3 * ((k - 1) * 0.5 - 1) + 0.8
  const r = (k / 2) | 0
  const kern = new Float64Array(k)
  let sum = 0
  for (let i = 0; i < k; i++) {
    const off = i - r
    kern[i] = Math.exp(-(off * off) / (2 * sigma * sigma))
    sum += kern[i]
  }
  for (let i = 0; i < k; i++) kern[i] /= sum
  const { data, width, height } = src
  const pass = (input: Uint8ClampedArray, horizontal: boolean) => {
    const next = new Uint8ClampedArray(input.length)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 4; c++) {
          let acc = 0
          for (let t = 0; t < k; t++) {
            const off = t - r
            const xx = horizontal ? clampi(x + off, 0, width - 1) : x
            const yy = horizontal ? y : clampi(y + off, 0, height - 1)
            acc += kern[t] * input[(yy * width + xx) * 4 + c]
          }
          next[(y * width + x) * 4 + c] = Math.round(Math.min(255, Math.max(0, acc)))
        }
      }
    }
    return next
  }
  const blurred = pass(pass(data, true), false)
  return { data: blurred, width, height }
}

export function fillBackground(src: Raster, bg: [number, number, number, number]): Raster {
  const data = new Uint8ClampedArray(src.data.length)
  for (let i = 0; i < src.data.length; i += 4) {
    if (src.data[i + 3] === 0) {
      data[i] = bg[0]
      data[i + 1] = bg[1]
      data[i + 2] = bg[2]
      data[i + 3] = bg[3]
    } else {
      data[i] = src.data[i]
      data[i + 1] = src.data[i + 1]
      data[i + 2] = src.data[i + 2]
      data[i + 3] = src.data[i + 3]
    }
  }
  return { data, width: src.width, height: src.height }
}

const MAGIC: [number, number, number, number] = [255, 0, 255, 255]

export function hasTransparency(src: Raster): boolean {
  for (let i = 3; i < src.data.length; i += 4) if (src.data[i] < 255) return true
  return false
}

export function removeSvgBackground(svg: string): string {
  return svg.replace(/<path\b[^>]*?fill="rgb\(\s*255\s*,\s*0\s*,\s*255\s*\)"[^>]*?\/>/g, "")
}

/** Magenta key and the bleed it leaves after a blur. */
export function isKeyColor(r: number, g: number, b: number): boolean {
  return (r > 70 && b > 70 && g + 36 < r && g + 36 < b && Math.abs(r - b) < 40) || (r > 170 && b > 170 && g < 90)
}

/** Pull magenta bleed back to the exact key color before quantization. */
export function snapKey(src: Raster): Raster {
  const data = new Uint8ClampedArray(src.data)
  for (let i = 0; i < data.length; i += 4) {
    if (isKeyColor(data[i], data[i + 1], data[i + 2])) {
      data[i] = 255
      data[i + 1] = 0
      data[i + 2] = 255
      data[i + 3] = 255
    }
  }
  return { data, width: src.width, height: src.height }
}
export function knockout(src: Raster, color: readonly [number, number, number, number]): Raster {
  const data = new Uint8ClampedArray(src.data)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === color[0] && data[i + 1] === color[1] && data[i + 2] === color[2]) data[i + 3] = 0
  }
  return { data, width: src.width, height: src.height }
}

export { MAGIC }
