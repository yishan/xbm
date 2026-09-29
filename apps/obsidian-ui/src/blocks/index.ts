import type { BlockDef } from "@/blocks/types"

import PrismBeamDemo from "@/demos/prism-beam"
import FlipTextDemo from "@/demos/flip-text"
import LiquidMetalButtonDemo from "@/demos/liquid-metal-button"
import ClickSparkDemo from "@/demos/click-spark"
import LensGalleryDemo from "@/demos/lens-gallery"
import HoverImageDemo from "@/demos/hover-image"
import FileInputDemo from "@/demos/file-input"
import GooeyLoaderDemo from "@/demos/gooey-loader"
import DraggableMarqueeDemo from "@/demos/draggable-marquee"
import TextReelDemo from "@/demos/text-reel"
import SplitShowcaseDemo from "@/demos/split-showcase"

import prismBeamSource from "./prism-beam.tsx?raw"
import flipTextSource from "./flip-text.tsx?raw"
import liquidMetalButtonSource from "./liquid-metal-button.tsx?raw"
import clickSparkSource from "./click-spark.tsx?raw"
import lensGallerySource from "./lens-gallery.tsx?raw"
import hoverImageSource from "./hover-image.tsx?raw"
import fileInputSource from "./file-input.tsx?raw"
import gooeyLoaderSource from "./gooey-loader.tsx?raw"
import draggableMarqueeSource from "./draggable-marquee.tsx?raw"
import textReelSource from "./text-reel.tsx?raw"
import splitShowcaseSource from "./split-showcase.tsx?raw"

export const BLOCKS: BlockDef[] = [
  {
    id: "prism-beam",
    title: "Prism Beam",
    layout: "section",
    category: "Canvas",
    tech: ["Canvas 2D", "Snell's law"],
    description:
      "A glass prism bends a white beam into a spectrum — real refraction per wavelength, drawn with additive light.",
    hint: "Drag anywhere to aim the beam",
    file: "prism-beam.tsx",
    Demo: PrismBeamDemo,
    source: prismBeamSource,
  },
  {
    id: "flip-text",
    title: "Flip Text",
    layout: "card",
    category: "Motion",
    tech: ["Motion", "3D transforms"],
    description:
      "Characters flip in 3D with a staggered wave when you hover the word or a single letter.",
    hint: "Hover the word or a letter",
    file: "flip-text.tsx",
    Demo: FlipTextDemo,
    source: flipTextSource,
  },
  {
    id: "liquid-metal-button",
    title: "Liquid Metal Button",
    layout: "card",
    category: "WebGL",
    tech: ["WebGL", "GLSL"],
    description:
      "A pill button with a flowing liquid-chrome rim rendered by a fragment shader.",
    hint: "Hover to speed up the flow, click it",
    file: "liquid-metal-button.tsx",
    Demo: LiquidMetalButtonDemo,
    source: liquidMetalButtonSource,
  },
  {
    id: "click-spark",
    title: "Click Spark",
    layout: "card",
    category: "Canvas",
    tech: ["Canvas 2D"],
    description:
      "Radiating sparks burst from every click on an overlay canvas.",
    hint: "Click anywhere in the preview",
    file: "click-spark.tsx",
    Demo: ClickSparkDemo,
    source: clickSparkSource,
  },
  {
    id: "lens-gallery",
    title: "Lens Gallery",
    layout: "section",
    category: "WebGL",
    tech: ["WebGL", "GLSL", "Barrel distortion"],
    description:
      "An infinite, draggable gallery of generated studies seen through a curved lens.",
    hint: "Drag, fling or scroll to explore",
    file: "lens-gallery.tsx",
    Demo: LensGalleryDemo,
    source: lensGallerySource,
  },
  {
    id: "hover-image",
    title: "Hover Image",
    layout: "card",
    category: "GSAP",
    tech: ["GSAP quickTo"],
    description:
      "A project list whose thumbnail trails your pointer and slides to the hovered item.",
    hint: "Hover the project titles",
    file: "hover-image.tsx",
    Demo: HoverImageDemo,
    source: hoverImageSource,
  },
  {
    id: "file-input",
    title: "File Input",
    layout: "card",
    category: "Motion",
    tech: ["Motion", "AnimatePresence"],
    description:
      "A dropzone that morphs from idle to drag-over to uploading to a tidy file list.",
    hint: "Drop files, or use sample files",
    file: "file-input.tsx",
    Demo: FileInputDemo,
    source: fileInputSource,
  },
  {
    id: "gooey-loader",
    title: "Gooey Loader",
    layout: "card",
    category: "Motion",
    tech: ["Motion", "SVG filter"],
    description:
      "Liquid blobs orbit and merge through an SVG goo filter.",
    hint: "Switch the speed",
    file: "gooey-loader.tsx",
    Demo: GooeyLoaderDemo,
    source: gooeyLoaderSource,
  },
  {
    id: "draggable-marquee",
    title: "Draggable Marquee",
    layout: "section",
    category: "GSAP",
    tech: ["GSAP ticker", "Momentum"],
    description:
      "A seamlessly looping track you can grab and fling; it eases back to cruising speed.",
    hint: "Drag and fling, or focus it and press ← →",
    file: "draggable-marquee.tsx",
    Demo: DraggableMarqueeDemo,
    source: draggableMarqueeSource,
  },
  {
    id: "text-reel",
    title: "Text Reel",
    layout: "section",
    category: "GSAP",
    tech: ["GSAP ticker", "Scroll velocity"],
    description:
      "A continuous vertical word stream whose speed and direction follow your scrolling.",
    hint: "Scroll the page or wheel over the reel",
    file: "text-reel.tsx",
    Demo: TextReelDemo,
    source: textReelSource,
  },
  {
    id: "split-showcase",
    title: "Split Showcase",
    layout: "section",
    category: "Motion",
    tech: ["Motion springs"],
    description:
      "Two partner cards split by a dotted divider; the hovered side springs outward and softens its corners.",
    hint: "Hover or tab between the cards",
    file: "split-showcase.tsx",
    Demo: SplitShowcaseDemo,
    source: splitShowcaseSource,
  },
]
