// Shared layout for the XBM site: where the kit lives, the four figures, and the page chrome.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const KIT = join(ROOT, "vendor/anatomy");
export const SITE = join(ROOT, "site");

// Ordered the way power flows through the car: engine → gearbox → steering → suspension.
export const FIGURES = [
  { id: "tivct", fig: "Fig 1", title: "Ti-VCT cam phasers", blurb: "How the 1.6 engine moves both camshafts' timing with engine oil." },
  { id: "dps6", fig: "Fig 2", title: "PowerShift DPS6", blurb: "Two gearboxes, two dry clutches, one hand-over per shift." },
  { id: "epas", fig: "Fig 3", title: "Electric power steering", blurb: "A torque sensor reads your hands; a motor adds the rest." },
  { id: "blade", fig: "Fig 4", title: "Control Blade rear axle", blurb: "Four links, each holding the wheel in one direction." },
];
export const figureOf = (id) => FIGURES.find((f) => f.id === id);
export const fileOf = (id, theme) => (theme === "dark" ? `${id}-dark.html` : `${id}.html`);
export const themeOf = (argv = process.argv) => (argv.includes("--dark") ? "dark" : "light");

export const NAV_CSS = `
.xbm-nav{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 28px;font-family:var(--anatomy-mono);font-size:11px;letter-spacing:.06em;color:var(--anatomy-muted)}
.xbm-nav a{color:inherit;text-decoration:none}
.xbm-nav a:hover{color:var(--anatomy-strong)}
.xbm-home{color:var(--anatomy-text);text-transform:uppercase;letter-spacing:.14em}
.xbm-links{display:flex;gap:14px;flex-wrap:wrap}
.xbm-links a[aria-current]{color:var(--anatomy-strong);text-decoration:underline;text-underline-offset:4px}
.xbm-foot{margin-top:40px;font-size:12px;color:var(--anatomy-muted)}
.xbm-foot a{color:inherit}
`;

export function nav(current, theme) {
  const links = FIGURES.map((f) => `<a href="${fileOf(f.id, theme)}"${f.id === current ? ' aria-current="page"' : ""}>${f.fig.replace("Fig ", "")} · ${f.title}</a>`).join("");
  const other = theme === "dark" ? "light" : "dark";
  const swap = current ? fileOf(current, other) : other === "dark" ? "index-dark.html" : "index.html";
  return `<nav class="xbm-nav" aria-label="XBM figures"><a class="xbm-home" href="${theme === "dark" ? "index-dark.html" : "index.html"}">XBM · Focus Mk3, opened up</a><span class="xbm-links">${links}<a href="${swap}">${other} theme</a></span></nav>`;
}

export const FOOT = `<p class="xbm-foot">Interactive figures of a Ford Focus Mk3 sedan (C346, 1.6 Ti-VCT, PowerShift automatic). Drawn with the MIT-licensed anatomy isometric kit. Not affiliated with Ford.</p>`;

export function write(id, theme, html) {
  mkdirSync(SITE, { recursive: true });
  const file = join(SITE, id === "index" ? (theme === "dark" ? "index-dark.html" : "index.html") : fileOf(id, theme));
  writeFileSync(file, html);
  return file;
}

// The kit's lathe module as a page script: a `LATHE` namespace that uses the inlined kit's iso/pathOf.
import { readFileSync as readKit } from "node:fs";
export function latheScript() {
  const src = readKit(join(KIT, "kit/lathe.mjs"), "utf8").replace(/^import .*$/m, "");
  const names = [...src.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
  return `const LATHE = (() => {${src.replace(/^export /gm, "")}\nreturn { ${names.join(", ")} };})();\n`;
}
