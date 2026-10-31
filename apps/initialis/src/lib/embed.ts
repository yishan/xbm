import type { CapSettings } from "@/lib/initialis";

/**
 * Escapes text for use inside a HTML attribute quoted with `quote`.
 *
 * `&` must be replaced first, so the entities introduced below aren't escaped again.
 */
export function escapeAttr(s: string, quote: "'" | '"' = "'"): string {
  // prettier-ignore
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(quote === "'" ? /'/g : /"/g, quote === "'" ? "&#39;" : "&quot;");
}

/** JSON that is safe to inline inside a `<script>`: `<` becomes `\u003c`. */
function jsLiteral(diff: CapSettings): string {
  return JSON.stringify(diff).replace(/</g, "\\u003c");
}

const LIB = "https://initialis.azlen.me/lib/initialis.js";

/**
 * A self-contained snippet: the custom element for a plain drop cap, plus a small script that
 * rasterises the same initial and clips the surrounding text to its shape.
 */
export function scriptEmbed(diff: CapSettings, letter: string): string {
  const attr = escapeAttr(JSON.stringify(diff));
  const literal = jsLiteral(diff);
  const alt = escapeAttr(letter, '"');
  return [
    `<script type="module" src="${LIB}"></script>`,
    `<initialis-cap settings='${attr}' size="200" grow></initialis-cap>`,
    ``,
    `<!-- 让正文绕着首字母的形状排版 -->`,
    `<img id="cap" alt="${alt}" width="230" height="230" style="float:left; shape-margin:12px; shape-image-threshold:.2">`,
    `<p>Your text…</p>`,
    `<script type="module">`,
    `  import { draw } from '${LIB}';`,
    `  const canvas = document.createElement('canvas');`,
    `  await draw(canvas, ${literal}, { size: 460 });`,
    `  const img = document.querySelector('#cap'), url = canvas.toDataURL();`,
    `  img.src = url;`,
    "  img.style.shapeOutside = `url(\"${url}\")`;",
    `</script>`,
  ].join("\n");
}

/**
 * The no-JavaScript variant: points at a PNG already exported with the "下载 PNG" button.
 * `slug` is the part of the download name between `initialis-` and `.png`.
 */
export function imageEmbed(letter: string, slug: string): string {
  const alt = escapeAttr(letter, '"');
  const file = `initialis-${slug}.png`;
  return [
    `<!-- PNG 来自上方「下载 PNG」按钮；把文件放到网页旁边 -->`,
    `<img src="${file}" alt="${alt}" width="230" height="230" style="float:left; shape-outside:url(${file}); shape-margin:12px; shape-image-threshold:.2">`,
    `<p>Your text…</p>`,
  ].join("\n");
}
