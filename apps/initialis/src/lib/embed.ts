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

const LIB = "https://initialis.azlen.me/lib/initialis.js";

/**
 * The script embed: load the library from the CDN and place the custom element. Nothing else;
 * wrapping text around the initial's shape is what the image embed is for.
 */
export function scriptEmbed(diff: CapSettings): string {
  const attr = escapeAttr(JSON.stringify(diff));
  return [
    `<script type="module" src="${LIB}"></script>`,
    `<initialis-cap settings='${attr}' size="200" grow></initialis-cap>`,
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
