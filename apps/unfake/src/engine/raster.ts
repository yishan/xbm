/** Shared raster type for the in-browser unfake pipeline. */

export type Raster = {
  data: Uint8ClampedArray
  width: number
  height: number
}

export function cloneRaster(src: Raster): Raster {
  return { data: new Uint8ClampedArray(src.data), width: src.width, height: src.height }
}

export function emptyRaster(width: number, height: number, fill?: [number, number, number, number]): Raster {
  const data = new Uint8ClampedArray(width * height * 4)
  if (fill) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = fill[0]
      data[i + 1] = fill[1]
      data[i + 2] = fill[2]
      data[i + 3] = fill[3]
    }
  }
  return { data, width, height }
}

export function cropRaster(src: Raster, x: number, y: number, w: number, h: number): Raster {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const si = ((y + ty) * src.width + (x + tx)) * 4
      const di = (ty * w + tx) * 4
      data[di] = src.data[si]
      data[di + 1] = src.data[si + 1]
      data[di + 2] = src.data[si + 2]
      data[di + 3] = src.data[si + 3]
    }
  }
  return { data, width: w, height: h }
}

/** Area (box) downsample. Used to cap huge uploads and inside content-adaptive. */
export function resizeArea(src: Raster, tw: number, th: number): Raster {
  const width = Math.max(1, tw)
  const height = Math.max(1, th)
  const out = new Uint8ClampedArray(width * height * 4)
  const { data, width: sw, height: sh } = src
  for (let ty = 0; ty < height; ty++) {
    const y0 = Math.floor((ty * sh) / height)
    const y1 = Math.max(y0 + 1, Math.min(sh, Math.ceil(((ty + 1) * sh) / height)))
    for (let tx = 0; tx < width; tx++) {
      const x0 = Math.floor((tx * sw) / width)
      const x1 = Math.max(x0 + 1, Math.min(sw, Math.ceil(((tx + 1) * sw) / width)))
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let n = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * sw + x) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          a += data[i + 3]
          n++
        }
      }
      const o = (ty * width + tx) * 4
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
      out[o + 3] = a / n
    }
  }
  return { data: out, width, height }
}

export function fitLongest(src: Raster, max: number): Raster {
  const longest = Math.max(src.width, src.height)
  if (longest <= max) return src
  const s = max / longest
  return resizeArea(src, Math.max(1, Math.round(src.width * s)), Math.max(1, Math.round(src.height * s)))
}

export function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function hexByte(n: number): string {
  return n.toString(16).padStart(2, "0")
}

export function rgbHex(r: number, g: number, b: number): string {
  return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`
}

export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = Number.parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
