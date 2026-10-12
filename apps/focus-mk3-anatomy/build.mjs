// Builds the whole XBM site: every figure in both themes, then the index pages.
//   node build.mjs            build everything
//   node build.mjs --audit    also run each figure's geometry audit
//   node build.mjs --thumbs   also refresh the index thumbnails (needs Chrome)
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SITE, KIT, FIGURES, NAV_CSS, FOOT, nav, fileOf, write } from "./lib/site.mjs";
const k = await import(join(KIT, "kit/iso-kit.mjs"));

const run = (dir, args) => execFileSync(process.execPath, ["build.mjs", ...args], { cwd: join(ROOT, "figures", dir), stdio: "inherit" });
for (const { id } of FIGURES) {
  run(id, []);
  run(id, ["--dark"]);
  if (process.argv.includes("--audit")) run(id, ["--audit"]);
}

const THUMBS = join(ROOT, "assets", "thumbs");
if (process.argv.includes("--thumbs")) {
  mkdirSync(THUMBS, { recursive: true });
  for (const { id } of FIGURES)
    for (const theme of ["light", "dark"])
      execFileSync(process.execPath, [join(KIT, "scripts/capture.mjs"), join(SITE, fileOf(id, theme)), "--out", join(THUMBS, `${id}-${theme}.png`), "--width", "1100", "--scale", "1", "--reduced", "--select", ".iso-stage"], { stdio: "inherit" });
}

if (existsSync(THUMBS)) cpSync(THUMBS, join(SITE, "thumbs"), { recursive: true });

const CSS = `
.xbm-hero{margin:8px 0 34px}
.xbm-hero h1{margin:0 0 10px;font-size:28px;line-height:1.2;font-weight:600;color:var(--anatomy-strong);letter-spacing:-.01em}
.xbm-hero p{margin:0;max-width:640px;color:var(--anatomy-text)}
.xbm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:18px}
.xbm-card{display:block;text-decoration:none;color:inherit;background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-lo);padding:16px 16px 18px;transition:box-shadow .2s var(--anatomy-ease)}
.xbm-card:hover,.xbm-card:focus-visible{box-shadow:0 0 0 1px var(--anatomy-hi);outline:none}
.xbm-card img{display:block;width:100%;height:auto;aspect-ratio:1.45;object-fit:contain;margin:0 0 12px}
.xbm-card .xbm-fig{font-family:var(--anatomy-mono);font-size:10.5px;letter-spacing:.06em;color:var(--anatomy-muted)}
.xbm-card h2{margin:4px 0 4px;font-size:16px;font-weight:600;color:var(--anatomy-strong)}
.xbm-card p{margin:0;font-size:13px;color:var(--anatomy-text)}
`;
for (const theme of ["light", "dark"]) {
  const cards = FIGURES.map((f) => {
    const thumb = `thumbs/${f.id}-${theme}.png`;
    const img = existsSync(join(SITE, thumb)) ? `<img src="${thumb}" alt="" loading="lazy">` : "";
    return `<a class="xbm-card" href="${fileOf(f.id, theme)}">${img}<span class="xbm-fig">${f.fig}</span><h2>${f.title}</h2><p>${f.blurb}</p></a>`;
  }).join("");
  const body = `${nav(null, theme)}<header class="xbm-hero"><h1>A Focus Mk3, opened up</h1><p>Four working models of the machinery in a Ford Focus Mk3 sedan (C346) with the 1.6 Ti-VCT engine and the PowerShift automatic: the cam phasers, the twin-clutch gearbox, the electric power steering and the Control Blade rear axle. Every figure moves; drag, press keys or let it run its tour. The numbers come from Ford's published specifications where they exist, and each caption says where the drawing is illustrative.</p></header><main class="xbm-grid">${cards}</main>${FOOT}`;
  write("index", theme, k.pageHtml({ title: "XBM · Ford Focus Mk3, opened up", theme, body: `<style>${NAV_CSS}${CSS}</style>${body}`, width: 1040 }));
}
console.log("site ready:", SITE);
