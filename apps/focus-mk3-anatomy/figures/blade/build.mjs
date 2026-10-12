import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KIT, NAV_CSS, FOOT, nav, figureOf, themeOf, write, latheScript } from "../../lib/site.mjs";
import { parts } from "../../lib/parts.mjs";
import * as M from "./model.mjs";
const k = await import(join(KIT, "kit/iso-kit.mjs"));
const G = await import(join(KIT, "kit/lathe.mjs"));
const A = await import(join(KIT, "kit/audit.mjs"));
const { kitScript } = await import(join(KIT, "scripts/inline-kit.mjs"));

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = themeOf();
const META = figureOf("blade");

// ---------------------------------------------------------------- world plan
// One rear corner: x outboard, y rearward, z up. Shapes of the moving parts live in the shared
// `shapes` table so the build (rest pose) and the page (every frame) draw the same thing.
const W = 920;
const H = 660;
const BASE = { x: -104, y: -166, w: 196, d: 206, r: 9 };
const SUB = { x: -82, y: -34, w: 12, d: 62, r: 1.6 }; // subframe rail
const SUB_Z = [8, 20];
const BODY = { x: -98, y: -14, w: 146, d: 44, r: 1.6 }; // body rail overhead
const BODY_Z = [94, 102];
const SEAT = M.SPRING_AT;
const KNUCKLE = [[-20, 18], [22, 18], [22, 30], [10, 66], [-6, 66], [-20, 30]]; // (y, z) section, x 42…50
const KX = [53, 59];
const BLADE = [[14, 28], [14, 52], [-60, 50], [-141.6, 47], [-141.6, 41], [-60, 36]]; // (y, z) section, x 50.6…53
const BX = [50.6, 53];

const P = k.fitProjection([...k.boxCorners(BASE, -18, 0), [-98, 30, BODY_Z[1]], [48, 30, BODY_Z[1]], [70, 0, 70]], W, H, { pad: 26, azimuth: 38, elevation: 30 });
const R = A.recorder(P);
const X = parts({ P, R, k, G, A });
const { at, S, Ln, Dots, FX, FY, FZ, box, disc, put, record, nameFor } = X;

const back = [X.bench(BASE, { ruler: { x: BASE.x + 14, y: BASE.y + BASE.d - 14, w: BASE.w - 28, d: 7, r: 1 }, label: { plan: { x: -96, y: -156, w: 44, d: 22, r: 1.6 }, text: "CONTROL BLADE", along: "x" } })];

// ---------------------------------------------------------------- body side: subframe, brackets, body rail
const foot = (name, x, y) => box(name, { x: x - 7, y: y - 7, w: 14, d: 14, r: 2 }, 0, 2.4, {}, { extra: Dots(k.corners({ x: x - 7, y: y - 7, w: 14, d: 14 }, 2.4).map(([px, py]) => at([px, py, 2.4])), { size: 0.42 }) });
for (const y of [-26, 20]) {
  foot("stand.sub.foot", -76, y);
  box("stand.sub.post", { x: -80, y: y - 4, w: 8, d: 8, r: 1.2 }, 2.4, SUB_Z[0] - 2.4, {}, { bevel: 0.4 });
}
box("sub.rail", SUB, SUB_Z[0], SUB_Z[1] - SUB_Z[0], { tone: "mid" }, { bevel: 0.6, inner: Ln(k.sideSeam(SUB, SUB_Z[0] + 4, P, 3), { tone: "faint" }), extra: Dots([-28, -10, 8, 22].map((y) => at([-76, y, SUB_Z[1]])), { size: 0.45 }) });
// Inner pivots: a clevis for the spring link on the rail, an arm out to the toe link, a tower for the camber link.
const [si, ti, ci] = [M.LINKS.spring.inner, M.LINKS.toe.inner, M.LINKS.camber.inner];
// Clevis: two cheeks either side of a link's rubber eye, on a base block.
function clevis(name, p, base) {
  for (const sgn of [-1, 1]) box(`${name}.cheek`, { x: p[0] - 5, y: sgn > 0 ? p[1] + 4 : p[1] - 6, w: 10, d: 2, r: 0.4 }, base, p[2] + 5 - base, { tone: "mid" }, { steps: 2, bevel: 0.2, extra: Dots([at([p[0], sgn > 0 ? p[1] + 6 : p[1] - 6, p[2]])], { size: 0.55, tone: "hi" }) });
}
box("sub.block.spring", { x: SUB.x + SUB.w, y: si[1] - 8, w: 14, d: 16, r: 1 }, SUB_Z[1] - 6, 6, { tone: "mid" }, { steps: 2, bevel: 0.4 });
clevis("sub.clevis.spring", si, SUB_Z[1]);
box("sub.arm.toe", { x: SUB.x + SUB.w, y: ti[1] - 4, w: ti[0] - 5 - SUB.x - SUB.w, d: 8, r: 1 }, SUB_Z[1] - 4, 4, { tone: "mid" }, { steps: 2, bevel: 0.4 });
box("sub.block.toe", { x: ti[0] - 5, y: ti[1] - 6, w: 10, d: 12, r: 1 }, SUB_Z[1] - 4, 8, { tone: "mid" }, { steps: 2, bevel: 0.4 });
clevis("sub.clevis.toe", ti, SUB_Z[1] + 4);
// Body rail overhead on a post, with the spring cup and the damper's top mount under it.
foot("stand.body.foot", -92, 15);
box("stand.body.post", { x: -96, y: 11, w: 8, d: 8, r: 1.2 }, 2.4, BODY_Z[0] - 2.4, {}, { bevel: 0.4, inner: Ln(k.sideSeam({ x: -96, y: 11, w: 8, d: 8, r: 1.2 }, 40, P, 3), { tone: "faint" }) });
box("body.rail", BODY, BODY_Z[0], BODY_Z[1] - BODY_Z[0], { tone: "mid" }, { bevel: 0.6, extra: Dots([-80, -40, 0, 30].map((x) => at([x, 15, BODY_Z[1]])), { size: 0.45 }) });
box("body.hanger.camber", { x: ci[0] - 6, y: ci[1] - 6, w: 12, d: 12, r: 1 }, ci[2] + 4.6, BODY_Z[0] - ci[2] - 4.6, { tone: "mid" }, { steps: 2, bevel: 0.4 });
for (const sgn of [-1, 1]) box("body.clevis.camber.cheek", { x: ci[0] - 5, y: sgn > 0 ? ci[1] + 4 : ci[1] - 6, w: 10, d: 2, r: 0.4 }, ci[2] - 5, 9.6, { tone: "mid" }, { steps: 2, bevel: 0.2, extra: Dots([at([ci[0], sgn > 0 ? ci[1] + 6 : ci[1] - 6, ci[2]])], { size: 0.55, tone: "hi" }) });
const cupAt = [M.LINKS.spring.inner[0] + SEAT * (M.LINKS.spring.outer[0] - M.LINKS.spring.inner[0]), 8];
disc("body.cup", FZ(cupAt[0], cupAt[1]), BODY_Z[0] - 4, BODY_Z[0], 11, { tone: "mid" }, { extra: Ln(G.circleOf(FZ(cupAt[0], cupAt[1]), BODY_Z[0] - 4, 8.4, P), { tone: "faint" }) });
const du = M.DAMPER.upper;
box("body.damper.mount", { x: du[0] - 5, y: du[1] - 6, w: 10, d: 12, r: 1 }, du[2] + 4.2, BODY_Z[0] - du[2] - 4.2, { tone: "mid" }, { steps: 2, bevel: 0.4 });
// Blade bushing bracket: the trailing arm's front pivot, on its own post.
const bu = M.BUSH;
foot("stand.bush.foot", bu[0], bu[1]);
box("stand.bush.post", { x: bu[0] - 4, y: bu[1] - 4, w: 8, d: 8, r: 1.2 }, 2.4, bu[2] - 8.5 - 2.4, {}, { bevel: 0.4 });
disc("body.bush.housing", FX(bu[1], bu[2]), BX[0] - 3.5, BX[1] + 3.5, 8.4, { tone: "mid" }, { extra: Dots(G.dotsOf(FX(bu[1], bu[2]), BX[1] + 3.5, 7, 6, P, { all: true }), { size: 0.4 }) });

// ---------------------------------------------------------------- moving parts at ride height
const DYN = [];
function dyn(name, ref, shapes) {
  const id = nameFor(name);
  put(id, ref, `<g data-dyn="${DYN.length}"></g>`, { shapes: shapes.map((s) => record({ ...s, name: id })), pw: name === "blade" ? "blade" : undefined });
  DYN.push(name);
}
const F0 = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
dyn("blade", [51, -60, 44], [A.prism(F0, BLADE, BX[0], BX[1], {})]);
dyn("knuckle", [46, 0, 42], [A.prism(F0, KNUCKLE, KX[0], KX[1], {})]);
const HUB = G.frameOf(M.C0, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
dyn("hub", [M.C0[0], 0, 40], [A.disc(HUB, KX[1] - M.C0[0], -3, 9, {}), A.disc(HUB, -3, 1, 24, {}), A.disc(HUB, 1, 7, 8, {})]);
for (const [name, l] of Object.entries(M.LINKS)) {
  const dir = G.unit3(G.sub3(l.outer, l.inner));
  const L = G.len3(G.sub3(l.outer, l.inner));
  const F = G.frameAlong(l.inner, dir);
  dyn(`link.${name}`, G.lerp3(l.inner, l.outer, 0.5), [A.disc(F, 4.6, L - 4.6, name === "spring" ? 3.6 : 2.4, {})]);
  dyn(`eye.${name}.inner`, l.inner, [A.disc(FY(l.inner[0], l.inner[2]), l.inner[1] - 4, l.inner[1] + 4, 4.6, {})]);
  dyn(`eye.${name}.outer`, l.outer, [A.disc(FY(l.outer[0], l.outer[2]), l.outer[1] - 4, l.outer[1] + 4, 4.6, {})]);
}
const seatZ = M.LINKS.spring.inner[2] + SEAT * (M.LINKS.spring.outer[2] - M.LINKS.spring.inner[2]) + 4.2;
dyn("spring.seat", [cupAt[0], 8, seatZ + 1.2], [A.disc(FZ(cupAt[0], 8), seatZ, seatZ + 2.4, 10, {})]);
dyn("spring.coil", [cupAt[0], 8, 58], [A.disc(FZ(cupAt[0], 8), seatZ + 2.4, BODY_Z[0] - 4, 8.6, {})]);
dyn("damper", G.lerp3(M.DAMPER.lower, du, 0.5), [A.disc(G.frameAlong(M.DAMPER.lower, G.unit3(G.sub3(du, M.DAMPER.lower))), 3.6, 40, 4.6, {})]);

// ---------------------------------------------------------------- order
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => `<g class="it"${item.pw ? ` data-pw="${item.pw}"` : ""}>${item.svg}</g>`);

const LABEL = "One rear corner of a Ford Focus Mk3 on a bench: a long pressed-steel trailing arm, the Control Blade, runs forward from the wheel knuckle to a bushing; three lateral links (a long lower spring link carrying the coil spring, a short toe link ahead of it and an upper camber link) run inboard to the subframe; the damper stands apart from the spring.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: back.join("") + `<g>${groups.join("")}</g>` });

const DATA = {
  ...X.basis(),
  P,
  DYN,
  KNUCKLE,
  KX,
  BLADE,
  BX,
  BODY_Z,
  SEAT,
  model: { C0: M.C0, LINKS: M.LINKS, BUSH: M.BUSH, DAMPER: M.DAMPER, SPRING_AT: M.SPRING_AT, TRAVEL: M.TRAVEL },
};
const POSES = [[-24, "Rebound −24"], [0, "Ride"], [24, "Bump +24"]];
const controls = `<div class="bl-controls"><span class="bl-poses" role="group" aria-label="Wheel travel">${POSES.map(([h, label]) => `<button type="button" class="bl-pose" data-h="${h}">${label}</button>`).join("")}</span><button type="button" class="bl-tour" data-tour>Tour</button><span class="bl-live" aria-live="polite" data-live></span></div>`;
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">${META.fig}</span><span class="iso-plate-corner" data-corner="title">Control Blade · rear left</span><span class="iso-plate-corner" data-corner="hint">Drag up and down: bump and rebound</span><span class="iso-plate-corner" data-corner="readout" data-readout>ride height</span></div>`;
const stage = `<div class="iso-stage bl-stage" tabindex="0" role="slider" aria-label="Focus Mk3 Control Blade rear suspension. Drag up or down, or use the arrow keys, to move the wheel through bump and rebound." aria-valuemin="-24" aria-valuemax="24" aria-valuenow="0">${svg}</div>`;
const KEYS = [
  { mark: "lit", label: "The Control Blade: a steel trailing arm that is stiff fore and aft but flexes sideways" },
  { mark: "raised", label: "Spring link (long, carries the spring) · toe link (short, ahead) · camber link (upper)" },
  { mark: "flat", label: "Damper mounted apart from the spring" },
];
const keysHtml = `<span class="iso-keys">${KEYS.map(({ mark, label }) => `<span class="iso-key"><svg class="iso-swatch" data-mark="${mark}" viewBox="0 0 16 10"><path d="M1 8 L8 2 L15 8"/></svg>${label}</span>`).join("")}</span>`;
const CAPTION = "The Focus rear axle is four links and a blade. The blade, a long pressed-steel trailing arm welded to the knuckle, holds the wheel fore and aft and takes the brake torque; three lateral links do the rest: the long lower link carries the coil spring, the short toe link ahead of it steers the wheel a fraction, and the upper camber link sets the tilt. Because the toe link is shorter, it swings through a tighter arc, so as the wheel rises the front of the tyre is pulled in a little: toe-in in bump, which keeps the rear stable in corners. The blade can bend sideways just enough to allow it. Camber and toe in the readout are computed from this figure's own link geometry (tuned to behave like the real axle), not taken from Ford's specifications.";
const body = `<figure class="iso-figure bl"><div class="iso-plate">${corners}${stage}${controls}</div><figcaption class="iso-legend">${keysHtml}<span class="iso-caption">${CAPTION}</span></figcaption></figure>`;

const CSS = readFileSync(join(HERE, "blade.css"), "utf8");
const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export \{[^}]*\};?$/m, "").replace(/^export /gm, "");
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA)).replace("__MODEL__", MODEL);
const page = k.pageHtml({ title: "Control Blade rear axle · Focus Mk3, opened up", theme: THEME, body: `<style>${CSS}${NAV_CSS}</style>${nav("blade")}${body}${FOOT}`, script: kitScript() + latheScript() + LIVE, width: 980 });
const file = write("blade", THEME, page);
console.log("wrote", file, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`);
A.auditOrExit(R, P);
