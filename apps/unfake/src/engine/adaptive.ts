/**
 * Content-adaptive downscale (Öztireli–Gross EM in CIE Lab, ratio-capped).
 * Ported from unfake.js content_adaptive.rs (MIT).
 * Palette reduction happens in the separate median-cut step.
 */

import { resizeArea, type Raster } from "./raster"

const ITERATIONS = 5
const RATIO_CAP = 3

function srgbToLinear(c: number): number {
  if (c <= 0.04045) return c / 12.92
  return ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number): number {
  const x = Math.min(1, Math.max(0, c))
  if (x <= 0.0031308) return 12.92 * x
  return 1.055 * x ** (1 / 2.4) - 0.055
}

function fwd(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
}

function inv(t: number): number {
  const t3 = t * t * t
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787
}

const XN = 0.95047
const YN = 1
const ZN = 1.08883

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r / 255)
  const gl = srgbToLinear(g / 255)
  const bl = srgbToLinear(b / 255)
  const x = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / XN
  const y = (0.2126 * rl + 0.7152 * gl + 0.0722 * bl) / YN
  const z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / ZN
  const fx = fwd(x)
  const fy = fwd(y)
  const fz = fwd(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function labToRgb(l: number, a: number, b: number): [number, number, number] {
  const fy = (l + 16) / 116
  const fx = fy + a / 500
  const fz = fy - b / 200
  const x = XN * inv(fx)
  const y = YN * inv(fy)
  const z = ZN * inv(fz)
  const rl = 3.2406 * x - 1.5372 * y - 0.4986 * z
  const gl = -0.9689 * x + 1.8758 * y + 0.0415 * z
  const bl = 0.0557 * x - 0.204 * y + 1.057 * z
  const u8 = (c: number) => Math.round(Math.min(255, Math.max(0, linearToSrgb(c) * 255)))
  return [u8(rl), u8(gl), u8(bl)]
}

function resizePlane(plane: Float64Array, width: number, height: number, tw: number, th: number): Float64Array {
  const out = new Float64Array(tw * th)
  for (let ty = 0; ty < th; ty++) {
    const y0 = Math.floor((ty * height) / th)
    const y1 = Math.max(y0 + 1, Math.min(height, Math.ceil(((ty + 1) * height) / th)))
    for (let tx = 0; tx < tw; tx++) {
      const x0 = Math.floor((tx * width) / tw)
      const x1 = Math.max(x0 + 1, Math.min(width, Math.ceil(((tx + 1) * width) / tw)))
      let acc = 0
      let n = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          acc += plane[y * width + x]
          n++
        }
      }
      out[ty * tw + tx] = acc / n
    }
  }
  return out
}

function clampCovariance(s0: number, s1: number, s3: number, minSv: number, maxSv: number): [number, number, number, number] {
  const tr = s0 + s3
  const disc = Math.sqrt(((s0 - s3) * 0.5) ** 2 + s1 * s1)
  const l1 = Math.min(maxSv, Math.max(minSv, tr * 0.5 + disc))
  const l2 = Math.min(maxSv, Math.max(minSv, tr * 0.5 - disc))
  if (Math.abs(s1) < 1e-12) {
    const e0 = s0 >= s3 ? l1 : l2
    const e3 = s0 >= s3 ? l2 : l1
    return [e0, 0, 0, e3]
  }
  const lam1 = tr * 0.5 + disc
  let vx = s1
  let vy = lam1 - s0
  const norm = Math.max(1e-12, Math.hypot(vx, vy))
  vx /= norm
  vy /= norm
  const m00 = l1 * vx * vx + l2 * vy * vy
  const m01 = (l1 - l2) * vx * vy
  const m11 = l1 * vy * vy + l2 * vx * vx
  return [m00, m01, m01, m11]
}

function core(
  lp: Float64Array,
  ap: Float64Array,
  bp: Float64Array,
  wi: number,
  hi: number,
  wo: number,
  ho: number,
): Float64Array {
  const rx = wi / wo
  const ry = hi / ho
  const rAvg = (rx + ry) / 2
  const minSv = 0.5
  const maxSv = Math.max(1, 0.5 * rAvg)
  const nOut = wo * ho
  const mu: Array<[number, number]> = []
  const sigma: Array<[number, number, number, number]> = []
  const nu: Array<[number, number, number]> = []
  for (let yk = 0; yk < ho; yk++) {
    for (let xk = 0; xk < wo; xk++) {
      mu.push([(xk + 0.5) * rx, (yk + 0.5) * ry])
      sigma.push([(rx / 3) ** 2, 0, 0, (ry / 3) ** 2])
      nu.push([50, 0, 0])
    }
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const gammaSum = new Float64Array(wi * hi)
    gammaSum.fill(1e-9)
    const wKi: Array<Array<[number, number]>> = Array.from({ length: nOut }, () => [])
    for (let k = 0; k < nOut; k++) {
      const [s0, s1, , s3] = sigma[k]
      const det = s0 * s3 - s1 * s1
      const invDet = 1 / (det + 1e-9)
      const si0 = s3 * invDet
      const si1 = -s1 * invDet
      const si3 = s0 * invDet
      const [mx, my] = mu[k]
      const iMinX = Math.max(0, Math.floor(mx - 2 * rx))
      const iMaxX = Math.min(wi, Math.max(0, Math.ceil(mx + 2 * rx)))
      const iMinY = Math.max(0, Math.floor(my - 2 * ry))
      const iMaxY = Math.min(hi, Math.max(0, Math.ceil(my + 2 * ry)))
      let wSum = 1e-9
      const entries: Array<[number, number]> = []
      for (let yi = iMinY; yi < iMaxY; yi++) {
        for (let xi = iMinX; xi < iMaxX; xi++) {
          const dx = xi - mx
          const dy = yi - my
          const expo = dx * dx * si0 + 2 * dx * dy * si1 + dy * dy * si3
          const w = Math.exp(-0.5 * expo)
          if (w > 1e-5) {
            entries.push([yi * wi + xi, w])
            wSum += w
          }
        }
      }
      for (const entry of entries) {
        entry[1] /= wSum
        gammaSum[entry[0]] += entry[1]
      }
      wKi[k] = entries
    }

    for (let k = 0; k < nOut; k++) {
      let wSum = 1e-9
      let mx = 0
      let my = 0
      let nl = 0
      let na = 0
      let nb = 0
      for (const [i, wk] of wKi[k]) {
        const gamma = wk / gammaSum[i]
        wSum += gamma
        const xi = i % wi
        const yi = (i / wi) | 0
        mx += gamma * xi
        my += gamma * yi
        nl += gamma * lp[i]
        na += gamma * ap[i]
        nb += gamma * bp[i]
      }
      mx /= wSum
      my /= wSum
      nl /= wSum
      na /= wSum
      nb /= wSum
      let c00 = 0
      let c01 = 0
      let c11 = 0
      for (const [i, wk] of wKi[k]) {
        const gamma = wk / gammaSum[i]
        const dx = (i % wi) - mx
        const dy = ((i / wi) | 0) - my
        c00 += gamma * dx * dx
        c01 += gamma * dx * dy
        c11 += gamma * dy * dy
      }
      c00 /= wSum
      c01 /= wSum
      c11 /= wSum
      mu[k] = [mx, my]
      sigma[k] = clampCovariance(c00, c01, c11, minSv, maxSv)
      nu[k] = [nl, na, nb]
    }
  }

  const out = new Float64Array(nOut * 3)
  for (let k = 0; k < nOut; k++) {
    out[k * 3] = nu[k][0]
    out[k * 3 + 1] = nu[k][1]
    out[k * 3 + 2] = nu[k][2]
  }
  return out
}

export function contentAdaptive(src: Raster, targetW: number, targetH: number): Raster {
  const tw = Math.max(1, targetW)
  const th = Math.max(1, targetH)
  const alphaSrc = resizeArea(src, tw, th)
  const n = src.width * src.height
  let lp: Float64Array = new Float64Array(n)
  let ap: Float64Array = new Float64Array(n)
  let bp: Float64Array = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const p = i * 4
    const [l, a, b] = rgbToLab(src.data[p], src.data[p + 1], src.data[p + 2])
    lp[i] = l
    ap[i] = a
    bp[i] = b
  }
  let wi = src.width
  let hi = src.height
  const rx0 = wi / tw
  const ry0 = hi / th
  if (Math.max(rx0, ry0) > RATIO_CAP) {
    const sw = Math.max(tw, Math.round(tw * RATIO_CAP))
    const sh = Math.max(th, Math.round(th * RATIO_CAP))
    lp = resizePlane(lp, wi, hi, sw, sh)
    ap = resizePlane(ap, wi, hi, sw, sh)
    bp = resizePlane(bp, wi, hi, sw, sh)
    wi = sw
    hi = sh
  }
  const lab = core(lp, ap, bp, wi, hi, tw, th)
  const out = new Uint8ClampedArray(tw * th * 4)
  for (let k = 0; k < tw * th; k++) {
    const [r, g, b] = labToRgb(lab[k * 3], lab[k * 3 + 1], lab[k * 3 + 2])
    out[k * 4] = r
    out[k * 4 + 1] = g
    out[k * 4 + 2] = b
    out[k * 4 + 3] = alphaSrc.data[k * 4 + 3]
  }
  return { data: out, width: tw, height: th }
}
