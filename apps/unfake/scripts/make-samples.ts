/**
 * Builds the four 示例数据 sprites: crisp pixel art, nearest-upscaled,
 * then a one-pixel box blur and a phase shift so the bench has something to recover.
 */
import { writeFileSync } from "node:fs"
import { deflateSync, crc32 } from "node:zlib"
import { detectScale } from "../src/engine/detect"
import { DEFAULT_PIXEL, processPixel } from "../src/engine/pipeline"
import { emptyRaster, type Raster } from "../src/engine/raster"

type RGBA = [number, number, number, number]

function encodePng(img: Raster): Buffer {
  const raw = Buffer.alloc((img.width * 4 + 1) * img.height)
  for (let y = 0; y < img.height; y++) {
    raw[y * (img.width * 4 + 1)] = 0
    Buffer.from(img.data.buffer, img.data.byteOffset + y * img.width * 4, img.width * 4).copy(raw, y * (img.width * 4 + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(img.width, 0)
  ihdr.writeUInt32BE(img.height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

function blur(src: Raster): Raster {
  const out = emptyRaster(src.width, src.height)
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.max(0, Math.min(src.width - 1, x + dx))
          const yy = Math.max(0, Math.min(src.height - 1, y + dy))
          const i = (yy * src.width + xx) * 4
          r += src.data[i]
          g += src.data[i + 1]
          b += src.data[i + 2]
          a += src.data[i + 3]
          n++
        }
      }
      const o = (y * src.width + x) * 4
      out.data[o] = r / n
      out.data[o + 1] = g / n
      out.data[o + 2] = b / n
      out.data[o + 3] = a / n
    }
  }
  return out
}

function paint(rows: string[], pal: Record<string, RGBA>, scale: number, pad: number): Raster {
  const h = rows.length
  const w = Math.max(...rows.map((row) => row.length))
  const width = w * scale + pad * 2
  const height = h * scale + pad * 2
  const img = emptyRaster(width, height)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const color = pal[rows[y][x]]
      if (!color || color[3] === 0) continue
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((pad + y * scale + dy) * width + (pad + x * scale + dx)) * 4
          img.data[i] = color[0]
          img.data[i + 1] = color[1]
          img.data[i + 2] = color[2]
          img.data[i + 3] = color[3]
        }
      }
    }
  }
  return blur(img)
}

const T = [0, 0, 0, 0] as RGBA

const lighthouse = paint(
  [
    ".......WW.......",
    "......WYYW......",
    "......WYYW......",
    "......WRYW......",
    "......WYYW......",
    ".....WYYYYW.....",
    ".....WYYYYW.....",
    "....WWWWWWWW....",
    "......SSSS......",
    "......SSSS......",
    ".....SSSSSS.....",
    ".....SBSBSS.....",
    "....SSSSSSSS....",
    "...SSSSSSSSSS...",
    "..SSSSSSSSSSSS..",
    ".SSSSSSSSSSSSSS.",
  ],
  {
    ".": T,
    W: [236, 228, 210, 255],
    Y: [244, 196, 92, 255],
    R: [196, 64, 42, 255],
    S: [92, 78, 64, 255],
    B: [166, 196, 214, 255],
  },
  10,
  5,
)

const mushroom = paint(
  [
    "......RRRR......",
    "....RRWWRWRR....",
    "...RRRRRRRRRR...",
    "..RRWRRRRRWWRR..",
    "..RRRRRRRRRRRR..",
    ".RRRRRRRRRRRRRR.",
    ".RRWWRRRRRWWRRR.",
    "..SSSSSSSSSSSS..",
    "....KKKKKKKK....",
    "....KKKKKKKK....",
    "....KKDDDDKK....",
    ".....KKKKKK.....",
    "......KKKK......",
  ],
  {
    ".": T,
    R: [196, 48, 46, 255],
    W: [244, 236, 228, 255],
    S: [92, 48, 40, 255],
    K: [228, 196, 150, 255],
    D: [120, 72, 48, 255],
  },
  12,
  6,
)

const knight = paint(
  [
    "......HHHH......",
    "....HHHHHHHH....",
    "...HHHGGHHHH....",
    "...HHGGGGHHH....",
    "....HHGGHHHH....",
    ".....HHHHHH.....",
    "....AAAAAAAA....",
    "...AAABBBAAA....",
    "..AAAABBBBAA....",
    "..AAABBBBBAA....",
    "...AABBBBAA.....",
    "....AA..AA......",
    "....AA..AA......",
    "...BBB..BBB.....",
  ],
  {
    ".": T,
    H: [196, 198, 206, 255],
    G: [42, 48, 64, 255],
    A: [58, 92, 168, 255],
    B: [232, 176, 64, 255],
  },
  12,
  6,
)

const potion = paint(
  [
    ".....CCCCC......",
    ".....C...C......",
    "......CCC.......",
    ".....GGGGG......",
    "....GGGGGGG.....",
    "...GGWWGGGG.....",
    "...GGGGGGGG.....",
    "...GGGGGGGG.....",
    "....GGGGGGG.....",
    ".....GGGGG......",
    "......GGG.......",
  ],
  {
    ".": T,
    C: [120, 92, 64, 255],
    G: [64, 168, 148, 255],
    W: [210, 244, 232, 255],
  },
  14,
  7,
)

const files: Array<[string, Raster, number]> = [
  ["lighthouse.png", lighthouse, 10],
  ["mushroom.png", mushroom, 12],
  ["knight.png", knight, 12],
  ["potion.png", potion, 14],
]

for (const [name, img, expectScale] of files) {
  const scale = detectScale(img)
  const out = processPixel(img, { ...DEFAULT_PIXEL, maxColors: 12 })
  if (scale !== expectScale) {
    throw new Error(`${name} scale ${scale}, expected ${expectScale}`)
  }
  writeFileSync(new URL(`../public/samples/${name}`, import.meta.url), encodePng(img))
  console.log(`${name} ${img.width}x${img.height} detect ${scale} → ${out.raster.width}x${out.raster.height} ${out.palette.length} colors`)
}
