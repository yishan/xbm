import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KIT, NAV_CSS, FOOT, nav, figureOf, themeOf, write } from "../../lib/site.mjs";
import { parts } from "../../lib/parts.mjs";
import * as M from "./model.mjs";
const k = await import(join(KIT, "kit/iso-kit.mjs"));
const G = await import(join(KIT, "kit/lathe.mjs"));
const A = await import(join(KIT, "kit/audit.mjs"));
const { kitScript } = await import(join(KIT, "scripts/inline-kit.mjs"));

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = themeOf();
const META = figureOf("tivct");
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- world plan
// x runs along the camshafts (timing belt at +x), y across the head (exhaust toward the viewer), z up.
const W = 920;
const H = 660;
const ZC = 120; // camshaft axis height
const CAM_Y = { intake: -22, exhaust: 22 };
const BASE_R = 7; // cam base circle
const LIFT = 4.2; // drawn lift (8.4 mm at 1:2)
const LOBES = [26, 46]; // one cylinder: two valves per cam
const LOBE_W = 6;
const DECK = { x: 0, y: -40, w: 74, d: 80, r: 3 };
const DECK_Z = [84, 92];
const BUCKET_R = 5.5;
const BUCKET_H = 5;
const BUCKET_TOP = ZC - BASE_R;
const SEAT_Z = 79.5; // valve head top when closed
const SPROCKET = [76, 84];
const SPROCKET_R = 20;
const CRANK = { y: 0, z: 30, r: 10 };
const PULLEYS = [
  { id: "crank", y: CRANK.y, z: CRANK.z, r: CRANK.r },
  { id: "tensioner", y: 42, z: 72, r: 6 },
  { id: "exhaust", y: CAM_Y.exhaust, z: ZC, r: SPROCKET_R },
  { id: "intake", y: CAM_Y.intake, z: ZC, r: SPROCKET_R },
  { id: "idler", y: -36, z: 70, r: 6 },
];
const BELT_T = 1.6;
const BELT_X = [76.6, 83.4];
const BASE = { x: -34, y: -62, w: 160, d: 124, r: 8 };

const P = k.fitProjection(
  [...k.boxCorners(BASE, -18, 0), [0, -40, 160], [90, 40, 160], [90, -60, 150], [0, 40, 150]],
  W,
  H,
  { pad: 30, azimuth: 56, elevation: 31 },
);
const R = A.recorder(P);
const X = parts({ P, R, k, G, A });
const { at, S, Ln, Dots, Faded, FX, FZ, box, disc, gear, shaft, pedestal, put, record, nameFor } = X;

// ---------------------------------------------------------------- bench and head
const back = [];
back.push(X.bench(BASE, { ruler: { x: BASE.x + 16, y: BASE.y + BASE.d - 14, w: BASE.w - 32, d: 7, r: 1 }, label: { plan: { x: -28, y: -54, w: 26, d: 40, r: 1.6 }, text: "Ti-VCT", along: "y" } }));

// Four posts carry the head deck.
for (const [x, y] of [[8, -32], [58, -32], [8, 32], [58, 32]]) {
  const post = { x: x - 4, y: y - 4, w: 8, d: 8, r: 1.4 };
  box("stand.post.foot", { x: x - 6, y: y - 6, w: 12, d: 12, r: 2 }, 0, 2.4, {}, { extra: Dots(k.corners({ x: x - 6, y: y - 6, w: 12, d: 12 }, 2.4).map(([px, py]) => at([px, py, 2.4])), { size: 0.42 }) });
  box("stand.post", post, 2.4, DECK_Z[0] - 2.4, {}, { inner: Ln(k.sideSeam(post, 20, P, 3) + k.sideSeam(post, DECK_Z[0] - 10, P, 3), { tone: "faint" }), bevel: 0.4 });
}
// Head deck: the cylinder head cut at its gasket face; one cylinder's four valves hang below it.
box("head.deck", DECK, DECK_Z[0], DECK_Z[1] - DECK_Z[0], { tone: "mid" }, {
  bevel: 0.9,
  steps: 6,
  inner: Ln(k.sideSeam(DECK, DECK_Z[0] + 3, P, 6), { tone: "faint" }),
  extra: Dots([[4, -36], [70, -36], [4, 36], [70, 36], [4, 0], [36, -36], [36, 36]].map(([x, y]) => at([x, y, DECK_Z[1]])), { size: 0.45 }) + Ln(k.planOutline({ x: 14, y: -34, w: 44, d: 68, r: 8 }, DECK_Z[1], P, 6), { tone: "faint" }),
});

// ---------------------------------------------------------------- camshafts, bearings, valves
const LOBE_ITEMS = [];
const VALVES = [];
for (const [cam, yc] of Object.entries(CAM_Y)) {
  const F = FX(yc, ZC);
  const blocks = [[11, 17], [33, 39], [55, 61]];
  const collars = [...blocks, ...LOBES.map((x) => [x - LOBE_W / 2, x + LOBE_W / 2]), [64, 72]];
  for (const [b0, b1] of blocks) {
    const plan = { x: b0, y: yc - 8, w: b1 - b0, d: 16, r: 1.2 };
    box(`head.${cam}.bearing`, plan, DECK_Z[1], ZC + 6 - DECK_Z[1], { tone: "mid" }, {
      steps: 2,
      bevel: 0.4,
      inner: Ln(k.sideSeam(plan, ZC, P, 2), { tone: "lo" }),
      extra: Dots([at([(b0 + b1) / 2, yc - 5, ZC + 6]), at([(b0 + b1) / 2, yc + 5, ZC + 6])], { size: 0.45, tone: "hi" }),
    });
  }
  disc(`cam.${cam}.end`, F, 2.6, 5, 4.4, { tone: "mid" });
  shaft(`cam.${cam}.shaft`, F, 3.6, 5, SPROCKET[0], collars, { tone: "hi" }, { pw: cam });
  for (const x of LOBES) {
    const id = nameFor(`cam.${cam}.lobe`);
    const shape = record(A.disc(F, x - LOBE_W / 2, x + LOBE_W / 2, BASE_R, { name: id }));
    put(id, [x, yc, ZC], `<g data-lobe="${LOBE_ITEMS.length}"></g>`, { shapes: [shape] });
    LOBE_ITEMS.push({ cam, x, y: yc });
    // Bucket tappet, spring and valve below the lobe.
    const Fz = FZ(x, yc);
    const vi = VALVES.length;
    disc(`valve.${cam}.bucket`, Fz, BUCKET_TOP - BUCKET_H, BUCKET_TOP, BUCKET_R, { tone: "hi", inner: Ln(G.circleOf(Fz, BUCKET_TOP, BUCKET_R - 1.2, P), { tone: "faint" }) }, { mv: `v${vi}` });
    const sid = nameFor(`valve.${cam}.spring`);
    put(sid, [x, yc, (DECK_Z[1] + BUCKET_TOP - BUCKET_H) / 2], `<g data-spring="${vi}"><path class="iso-line" data-tone="lo" d=""/><path class="iso-line" data-tone="mid" d=""/></g>`, { shapes: [record(A.disc(Fz, DECK_Z[1], BUCKET_TOP - BUCKET_H, 4.3, { name: sid }))] });
    disc(`head.${cam}.seat`, Fz, SEAT_Z, DECK_Z[0], 6.6, { tone: "mid" });
    disc(`valve.${cam}.stem`, Fz, SEAT_Z - 1.4, SEAT_Z, 1.05, { tone: "hi", crease: "none" }, { mv: `v${vi}` });
    disc(`valve.${cam}.head`, Fz, SEAT_Z - 3, SEAT_Z - 1.4, cam === "intake" ? 5.6 : 4.6, { tone: "hi", inner: Ln(G.circleOf(Fz, SEAT_Z - 1.4, 2.2, P), { tone: "faint" }) }, { mv: `v${vi}` });
    VALVES.push({ cam, x, y: yc });
  }
}
// Front bearing support: carries both cams and the oil ducts to the phasers.
const SUPPORT = { x: 64, y: -31, w: 8, d: 62, r: 1.6 };
box("head.support", SUPPORT, DECK_Z[1], ZC + 8 - DECK_Z[1], { tone: "mid" }, {
  bevel: 0.6,
  inner: Ln(k.sideSeam(SUPPORT, ZC, P, 3), { tone: "lo" }),
  extra: Dots([-27, -17, 17, 27].map((y) => at([68, y, ZC + 8])), { size: 0.45, tone: "hi" }),
});
// Oil control valves (4/3-way spool solenoids), one per cam, standing on the support.
const OCV = { intake: -9, exhaust: 9 };
const OCV_Z = [ZC + 8, ZC + 25];
for (const [cam, y] of Object.entries(OCV)) {
  const F = FZ(68, y);
  disc(`ocv.${cam}.flange`, F, OCV_Z[0], OCV_Z[0] + 1.6, 5.4, { tone: "mid" }, { extra: Dots(G.dotsOf(F, OCV_Z[0] + 1.6, 4.4, 3, P, { all: true, phase: 0.6 }), { size: 0.4 }) });
  disc(`ocv.${cam}.body`, F, OCV_Z[0] + 1.6, OCV_Z[1], 3.8, { tone: "mid", inner: Ln(G.arcOf(F, OCV_Z[0] + 8, 3.8, P) + G.arcOf(F, OCV_Z[0] + 10, 3.8, P), { tone: "faint" }) });
  box(`ocv.${cam}.plug`, { x: 71.8, y: y - 2.2, w: 3, d: 4.4, r: 0.8 }, OCV_Z[1] - 8, 6, { tone: "hi" }, { steps: 2, bevel: 0.2 });
  disc(`ocv.${cam}.spool`, F, OCV_Z[1], OCV_Z[1] + 2.4, 1.3, { tone: "hi", crease: "none" }, { mv: `ocv.${cam}` });
  disc(`ocv.${cam}.knob`, F, OCV_Z[1] + 2.4, OCV_Z[1] + 3.4, 2, { tone: "hi" }, { mv: `ocv.${cam}` });
}

// ---------------------------------------------------------------- timing drive
// Cam sprockets with their phasers (cover off): housing on the sprocket, vane rotor on the cam.
const FACE_X = SPROCKET[1] + 0.05;
for (const cam of ["intake", "exhaust"]) {
  const yc = CAM_Y[cam];
  const F = FX(yc, ZC);
  const face = `<g transform="${X.planeX(FACE_X)}"><g transform="translate(${yc} ${ZC})" data-phaser="${cam}"></g></g>`;
  gear(`timing.${cam}.sprocket`, F, SPROCKET[0], SPROCKET[1], SPROCKET_R, 0, { count: 44, source: "cam", sign: 1, tone: "hi", face, belt: "pulley" });
}
// Crank: pedestal, stub, sprocket (half the teeth: the cams turn once per two crank turns) and degree wheel.
pedestal("crank", 70, CRANK.y, CRANK.z, 10);
disc("crank.stub", FX(CRANK.y, CRANK.z), 74, SPROCKET[0], 5, { tone: "mid", crease: "none" });
gear("timing.crank.sprocket", FX(CRANK.y, CRANK.z), SPROCKET[0], SPROCKET[1], CRANK.r, 0, { count: 22, source: "crank", sign: 1, tone: "hi", belt: "pulley" });
const WHEEL_X = [SPROCKET[1], SPROCKET[1] + 1.4];
const WHEEL_R = 17;
disc("crank.wheel", FX(CRANK.y, CRANK.z), WHEEL_X[0], WHEEL_X[1], WHEEL_R, { tone: "hi" }, {
  extra: `<g transform="${X.planeX(WHEEL_X[1] + 0.05)}"><g transform="translate(${CRANK.y} ${CRANK.z})" data-wheel></g></g>`,
  front: true,
});
// Pointer over the degree wheel.
box("stand.pointer.post", { x: 69, y: -1.2, w: 2.4, d: 2.4, r: 0.6 }, CRANK.z + 10 - 0.3, 18.3, { tone: "mid" }, { steps: 2, bevel: 0, front: true });
box("stand.pointer.bar", { x: 69, y: -1.2, w: WHEEL_X[1] + 2 - 69, d: 2.4, r: 0.6 }, CRANK.z + 28, 2, { tone: "mid" }, {
  steps: 2,
  bevel: 0,
  front: true,
  extra: Ln(k.segment([WHEEL_X[1] + 1, 1.2, CRANK.z + 28], [WHEEL_X[1] + 1, 1.2, CRANK.z + WHEEL_R + 0.6], P), { tone: "hi", free: "end" }),
});
// Tensioner and idler pulleys on their own posts.
for (const p of PULLEYS.filter((q) => q.id === "tensioner" || q.id === "idler")) {
  pedestal(p.id, 70, p.y, p.z, 7);
  disc(`${p.id}.stub`, FX(p.y, p.z), 74, SPROCKET[0], 2.6, { tone: "mid", crease: "none" });
  gear(`timing.${p.id}`, FX(p.y, p.z), SPROCKET[0], SPROCKET[1], p.r, 0, { count: 12, source: p.id, sign: 1, tone: "mid", belt: "pulley", face: Ln(G.circleOf(FX(p.y, p.z), SPROCKET[1], 2.4, P), { tone: "lo" }) });
}

// Belt: the convex hull of the pulleys, a band 6.8 wide on the pulley faces.
function hull2(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
const loopOf = (extra) => hull2(PULLEYS.flatMap((p) => Array.from({ length: 96 }, (_, j) => [p.y + (p.r + extra) * Math.cos((j / 96) * TAU), p.z + (p.r + extra) * Math.sin((j / 96) * TAU)])));
const OUTER = loopOf(BELT_T);
const INNER = loopOf(0);
const V = G.viewOf(P);
const L = G.lightOf(P);
function bandFaces(loop, sign) {
  // Quads of the belt surface between x0 and x1 along a loop; sign = +1 outer surface, −1 inner.
  const shades = [[], [], [], [], []];
  const n = loop.length;
  for (let j = 0; j < n; j++) {
    const a = loop[j];
    const b = loop[(j + 1) % n];
    const t = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(t[0], t[1]) || 1;
    // The hull runs counter-clockwise in (y, z), so its outward normal is (t.z, −t.y).
    const normal = [0, (sign * t[1]) / len, (-sign * t[0]) / len];
    if (G.dot3(normal, V) <= 1e-6) continue;
    const quad = [[BELT_X[0], a[0], a[1]], [BELT_X[0], b[0], b[1]], [BELT_X[1], b[0], b[1]], [BELT_X[1], a[0], a[1]]].map((p) => at(p));
    shades[G.bandOf(G.dot3(normal, L))].push(k.pathOf(quad, true));
    shades.edges = (shades.edges ?? "") + k.pathOf([quad[0], quad[1]]) + k.pathOf([quad[3], quad[2]]);
  }
  return shades;
}
const pathOf = (pts, closed = true) => "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + (closed ? "Z" : "");
const shadeSvg = (shades, edge) => shades.map((list, i) => (list.length ? `<path class="iso-shade" data-shade="${Math.min(3, i)}" d="${list.join("")}"/>` : "")).join("") + edge;
const ring3 = (loop, x) => loop.map(([y, z]) => at([x, y, z]));
const beltInner = shadeSvg(bandFaces(INNER, -1), "");
const frontRing = `<path class="iso-fill" fill-rule="evenodd" d="${pathOf(ring3(OUTER, BELT_X[1]))}${pathOf(ring3(INNER, BELT_X[1]).reverse())}"/><path class="iso-shade" data-shade="2" fill-rule="evenodd" d="${pathOf(ring3(OUTER, BELT_X[1]))}${pathOf(ring3(INNER, BELT_X[1]).reverse())}"/>`;
const outerQuads = bandFaces(OUTER, 1);
const silhouette = G.hullOf([...ring3(OUTER, BELT_X[0]), ...ring3(OUTER, BELT_X[1])]);
const beltOuter = `<g class="iso-solid">${shadeSvg(outerQuads, "")}${frontRing}<path class="iso-line" data-tone="lo" data-belt-teeth d=""/><path class="iso-line" data-tone="mid" d="${outerQuads.edges}"/><path class="iso-line iso-edge" data-tone="hi" d="${pathOf(silhouette)}${pathOf(ring3(INNER, BELT_X[1]))}"/></g>`;

// ---------------------------------------------------------------- order
A.settle(R, P);
// The belt wraps the pulleys: inner surface behind every pulley, outer surface and front edge in front of them.
const pulleyKeys = R.items.filter((i) => i.belt === "pulley").map((i) => i.key);
const frontKeys = R.items.filter((i) => i.front).map((i) => i.key);
const kMin = Math.min(...pulleyKeys);
const kMax = Math.max(...pulleyKeys);
R.items.push({ name: "timing.belt.inner", key: kMin - 0.01, svg: `<g class="iso-solid">${beltInner}</g>`, shapes: [], move: [0, 0, 0] });
R.items.push({ name: "timing.belt.outer", key: kMax + 0.01, svg: beltOuter, shapes: [], move: [0, 0, 0] });
for (const item of R.items.filter((i) => i.front)) item.key = Math.max(item.key, kMax + 0.02 + (item.key - Math.min(...frontKeys)) * 0.001);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => `<g class="it"${item.mv ? ` data-mv="${item.mv}"` : ""}${item.pw ? ` data-pw="${item.pw}"` : ""}>${item.svg}</g>`);

const LABEL = "The cylinder head of a Ford 1.6 Ti-VCT engine on a bench, cut at the gasket face: two camshafts on bearing caps over one cylinder's four valves, two oil control valves on the front bearing support, and the timing belt from the crank to two cam sprockets whose covers are off to show the vane phasers inside. A degree wheel on the crank marks when the intake opens and the exhaust closes.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: back.join("") + `<g class="tv-items">${groups.join("")}</g>` });

const DATA = {
  ...X.basis(),
  P,
  SPIN: X.SPIN,
  LOBES: LOBE_ITEMS,
  VALVES,
  LOBE: { base: BASE_R, lift: LIFT, w: LOBE_W, zc: ZC },
  SPRING: { r: 4.3, z0: DECK_Z[1], z1: BUCKET_TOP - BUCKET_H, turns: 5.5 },
  OUTER,
  BELT_X,
  WHEEL_R,
  CAM_Y,
  model: { DURATION: M.DURATION, IVO_PARK: M.IVO_PARK, EVC_PARK: M.EVC_PARK, AUTH: M.AUTH, IDLE: M.IDLE, REDLINE: M.REDLINE },
};

const SCENES = [
  ["idle", "Idle"],
  ["cruise", "Cruise 2,000"],
  ["torque", "Full load 2,750"],
  ["power", "Full load 5,500"],
];
const controls = `<div class="tv-controls"><span class="tv-scenes" role="group" aria-label="Operating point">${SCENES.map(([id, label]) => `<button type="button" class="tv-scene" data-scene="${id}">${label}</button>`).join("")}</span><button type="button" class="tv-tour" data-tour>Tour</button><span class="tv-live" aria-live="polite" data-live></span></div>`;
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">${META.fig}</span><span class="iso-plate-corner" data-corner="title">1.6 Ti-VCT · twin cam phasers</span><span class="iso-plate-corner" data-corner="hint">Drag: ← rpm → · ↑ load ↓</span><span class="iso-plate-corner" data-corner="readout" data-readout>750 rpm · idle · parked</span></div>`;
const stage = `<div class="iso-stage tv-stage" tabindex="0" role="group" aria-label="Ford 1.6 Ti-VCT cam phasers. Drag across the figure to change engine speed (left to right) and load (bottom to top), or press 1 to 4 for an operating point. Arrow keys nudge speed and load.">${svg}</div>`;
const KEYS = [
  { mark: "lit", label: "Vane rotors: fixed to each camshaft, turned against the sprocket by oil" },
  { mark: "flat", label: "Oil in the advance and retard chambers" },
  { mark: "raised", label: "Degree wheel: ● intake opens · ○ exhaust closes · the arc between is overlap" },
];
const keysHtml = `<span class="iso-keys">${KEYS.map(({ mark, label }) => `<span class="iso-key"><svg class="iso-swatch" data-mark="${mark}" viewBox="0 0 16 10"><path d="M1 8 L8 2 L15 8"/></svg>${label}</span>`).join("")}</span>`;
const CAPTION = `The 1.6 Ti-VCT (${M.CC} cc, ${M.BORE} × ${M.STROKE} mm, belt-driven twin cams on bucket tappets) can turn each camshaft against its sprocket while running. Inside each sprocket a vane rotor bolted to the cam sits in oil chambers; an oil control valve sends engine oil to one side of the vanes or the other, so the cam advances or retards and the valves open earlier or later. At idle both phasers sit parked on their stopper pins with the valves barely overlapping. At part load the exhaust cam is retarded to hold some exhaust in the cylinder (less pumping loss, less NOx); at full load in the mid range the intake is advanced and overlap is greatest; near the red line overlap shrinks again. Ranges follow the axes of Ford's published Ti-VCT timing maps (intake opening from 20° after to 30° before TDC); the map in between is an illustration of the behaviour Ford describes, not Ford's calibration. The engine is drawn 120× slower than real.`;
const body = `<figure class="iso-figure tv"><div class="iso-plate">${corners}${stage}${controls}</div><figcaption class="iso-legend">${keysHtml}<span class="iso-caption">${CAPTION}</span></figcaption></figure>`;

const CSS = readFileSync(join(HERE, "tivct.css"), "utf8");
const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export \{[^}]*\};?$/m, "").replace(/^export /gm, "");
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA)).replace("__MODEL__", MODEL);
const page = k.pageHtml({ title: "Ti-VCT cam phasers · XBM", theme: THEME, body: `<style>${CSS}${NAV_CSS}</style>${nav("tivct", THEME)}${body}${FOOT}`, script: kitScript() + LIVE, width: 980 });
const file = write("tivct", THEME, page);
console.log("wrote", file, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`);
A.auditOrExit(R, P, { cover: ["timing.belt.inner", "timing.belt.outer", "stand.pointer.bar"] });
