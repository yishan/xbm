import { fitLongest, type Raster } from "../engine/raster"

const MAX_EDGE = 1400

export async function blobToRaster(blob: Blob): Promise<Raster> {
  const bitmap = await createImageBitmap(blob)
  try {
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) throw new Error("无法读取图像")
    ctx.drawImage(bitmap, 0, 0)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return fitLongest({ data: image.data, width: image.width, height: image.height }, MAX_EDGE)
  } finally {
    bitmap.close()
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function rasterToPng(raster: Raster): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = raster.width
  canvas.height = raster.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("无法导出")
  ctx.putImageData(new ImageData(new Uint8ClampedArray(raster.data), raster.width, raster.height), 0, 0)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("无法导出")
  return blob
}

export function scaleNearest(src: Raster, factor: number): Raster {
  const scale = Math.max(1, Math.round(factor))
  const width = src.width * scale
  const height = src.height * scale
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    const sy = Math.floor(y / scale)
    for (let x = 0; x < width; x++) {
      const sx = Math.floor(x / scale)
      const si = (sy * src.width + sx) * 4
      const di = (y * width + x) * 4
      data[di] = src.data[si]
      data[di + 1] = src.data[si + 1]
      data[di + 2] = src.data[si + 2]
      data[di + 3] = src.data[si + 3]
    }
  }
  return { data, width, height }
}
