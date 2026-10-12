import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KIT, NAV_CSS, FOOT, nav, figureOf, themeOf, write, latheScript } from "../../lib/site.mjs";
import { parts } from "../../lib/parts.mjs";
import { belt, BELT_LIVE } from "../../lib/belt.mjs";
import * as M from "./model.mjs";
const k = await import(join(KIT, "kit/iso-kit.mjs"));
const G = await import(join(KIT, "kit/lathe.mjs"));
const A = await import(join(KIT, "kit/audit.mjs"));
const { kitScript } = await import(join(KIT, "scripts/inline-kit.mjs"));

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = themeOf();
const META = figureOf("epas");

// ---------------------------------------------------------------- world plan
// x across the car (the rack), y toward the driver (the viewer), z up.
const W = 920;
const H = 640;
const RZ = M.GEO.z;
const TUBE = [-62, 62];
const TUBE_R = 5.5;
const RACK_R = 3.4;
const BOSS = [-62, -46]; // pinion housing
const NUT = [22, 46]; // ball-nut housing
const NUT_R = 12;
const BELT_X = [16.4, 21.6];
const MOTOR = { y: -26, r: 8, x: [22, 54] };
const PULLEYS = [
  { id: "nut", y: 0, z: RZ, r: 11 },
  { id: "motor", y: MOTOR.y, z: RZ, r: 4.5 },
];
const MOUNTS = [-34, 6];
const KNUCKLE_Z = [30, 58];
const ARM_Z = [42, 46];
// Column: from the pinion input up toward the driver.
const COL_A = G.unit3([0, 0.5, 0.84]);
const COL_O = [-54, 0, RZ];
const COL = G.frameOf(COL_O, COL_A, [1, 0, 0], G.cross3(COL_A, [1, 0, 0]));
const NECK = [Math.sqrt(8.5 ** 2 - 2.6 ** 2), 10.5];
const SENSOR = [10.5, 24.5];
const UJ = 64;
const WHEEL_S = 116;
const BASE = { x: -168, y: -62, w: 336, d: 132, r: 9 };

const P = k.fitProjection([...k.boxCorners(BASE, -18, 0), G.add3(COL_O, G.mul3(COL_A, WHEEL_S + 30)), [-150, -40, 70], [150, -40, 70]], W, H, { pad: 26, azimuth: 52, elevation: 30 });
const R = A.recorder(P);
const X = parts({ P, R, k, G, A });
const { at, S, Ln, Dots, FX, FZ, box, disc, gear, shaft, put, record, nameFor } = X;
const V = G.viewOf(P);

const back = [X.bench(BASE, { ruler: { x: BASE.x + 20, y: BASE.y + BASE.d - 14, w: BASE.w - 40, d: 7, r: 1 }, label: { plan: { x: 110, y: 20, w: 40, d: 26, r: 1.6 }, text: "EPAS 14.7:1", along: "x" } })];

// ---------------------------------------------------------------- rack housing on two mounts
const F = FX(0, RZ);
for (const x of MOUNTS) {
  const post = { x: x - 4, y: -5, w: 8, d: 10, r: 1.2 };
  box("stand.mount.foot", { x: x - 7, y: -10, w: 14, d: 20, r: 2 }, 0, 2.4, {}, { extra: Dots(k.corners({ x: x - 7, y: -10, w: 14, d: 20 }, 2.6).map(([px, py]) => at([px, py, 2.4])), { size: 0.42 }) });
  box("stand.mount.post", post, 2.4, RZ - 8.5 - 2.4 + 0.3, {}, { inner: Ln(k.sideSeam(post, 14, P, 3), { tone: "faint" }), bevel: 0.4 });
  disc("rack.mount", F, x - 3, x + 3, 8.5, { tone: "mid" }, { rIn: TUBE_R, extra: Dots(G.dotsOf(F, x + 3, 7, 6, P, { all: true }), { size: 0.4 }) });
}
const collars = [...MOUNTS.map((x) => [x - 3, x + 3]), BOSS, NUT, [BELT_X[0] - 0.4, BELT_X[1] + 0.4]];
shaft("rack.tube", F, TUBE_R, BOSS[1], NUT[0], collars, { tone: "mid", crease: "faint" });
shaft("rack.tube", F, TUBE_R, NUT[1], TUBE[1], collars, { tone: "mid", crease: "faint" });
disc("rack.pinion.boss", F, BOSS[0], BOSS[1], 8.5, { tone: "mid", inner: Ln(G.arcOf(F, -54, 8.5, P), { tone: "faint" }) }, { extra: Ln(G.circleOf(F, BOSS[1], 6, P), { tone: "faint" }) });
disc("rack.nut.housing", F, NUT[0], NUT[1], NUT_R, { tone: "mid", inner: Ln(G.arcOf(F, 30, NUT_R, P) + G.arcOf(F, 38, NUT_R, P), { tone: "faint" }) }, { extra: Dots(G.dotsOf(F, NUT[1], NUT_R - 2, 8, P, { all: true }), { size: 0.42 }) });
// End caps where the rack leaves the tube.
for (const x0 of [TUBE[0] - 2, TUBE[1]]) disc("rack.tube.cap", F, x0, x0 + 2, 6.4, { tone: "mid" }, { rIn: RACK_R });

// ---------------------------------------------------------------- motor, belt drive, control module
const MF = FX(MOTOR.y, RZ);
disc("motor.can", MF, MOTOR.x[0], MOTOR.x[1], MOTOR.r, { tone: "hi", inner: X.Faded(G.ribsOf(MF, 30, 48, MOTOR.r, 28, P, { fade: X.RIBFADE, seams: true }), { tone: "lo" }) }, { pw: "motor" });
box("motor.bracket", { x: 22, y: MOTOR.y + MOTOR.r, w: 4, d: -MOTOR.y - MOTOR.r - NUT_R, r: 0.4 }, RZ - 6, 12, { tone: "mid" }, { steps: 2, bevel: 0.3 });
const ECU = { x: MOTOR.x[1], y: MOTOR.y - 12, w: 14, d: 22, r: 1.6 };
box("motor.ecu", ECU, RZ - 11, 22, { tone: "mid" }, {
  bevel: 0.6,
  inner: Ln(k.sideSeam(ECU, RZ + 6, P, 3), { tone: "lo" }) + Ln(k.sideSeam(ECU, RZ + 8, P, 3), { tone: "faint" }),
  extra: Dots(k.corners(ECU, 2.4).map(([x, y]) => at([x, y, RZ + 11])), { size: 0.45 }),
});
box("motor.ecu.plug", { x: ECU.x + 4, y: ECU.y + ECU.d, w: 7, d: 3, r: 0.8 }, RZ - 2, 8, { tone: "hi" }, { steps: 2, bevel: 0.2, extra: Ln([0, 1, 2].map((j) => k.segment([ECU.x + 5.5 + j * 2, ECU.y + ECU.d + 3, RZ - 2], [ECU.x + 5.5 + j * 2, ECU.y + ECU.d + 3, RZ + 6], P)).join(""), { tone: "lo" }) });
gear("belt.nut.pulley", FX(0, RZ), BELT_X[0] - 0.4, BELT_X[1] + 0.4, PULLEYS[0].r, RACK_R + 0.4, { count: 36, source: "nut", sign: 1, tone: "hi", belt: "pulley", pw: "nut" });
gear("belt.motor.pulley", MF, BELT_X[0] - 0.4, BELT_X[1] + 0.4, PULLEYS[1].r, 0, { count: 15, source: "motor", sign: 1, tone: "hi", belt: "pulley", pw: "motor" });
disc("motor.shaft", MF, BELT_X[1] + 0.4, MOTOR.x[0], 1.6, { tone: "mid", crease: "none" });
const B = belt({ P, k, G, pulleys: PULLEYS, x0: BELT_X[0], x1: BELT_X[1] });

// ---------------------------------------------------------------- knuckles and wheels (static parts)
for (const side of M.SIDES) {
  const [kx, ky] = side.K;
  box("stand.knuckle.foot", { x: kx - 7, y: ky - 7, w: 14, d: 14, r: 2 }, 0, 2.4, {}, { extra: Dots(k.corners({ x: kx - 7, y: ky - 7, w: 14, d: 14 }, 2.4).map(([px, py]) => at([px, py, 2.4])), { size: 0.42 }) });
  box("stand.knuckle.post", { x: kx - 4, y: ky - 4, w: 8, d: 8, r: 1.2 }, 2.4, KNUCKLE_Z[0] - 4 - 2.4, {}, { bevel: 0.4 });
  disc("stand.knuckle.bearing", FZ(kx, ky), KNUCKLE_Z[0] - 4, KNUCKLE_Z[0], 6.2, { tone: "mid" });
  disc("knuckle.body", FZ(kx, ky), KNUCKLE_Z[0], ARM_Z[0], 4.4, { tone: "mid" }, { owner: `knuckle${kx}` });
  disc("knuckle.body", FZ(kx, ky), ARM_Z[1], KNUCKLE_Z[1], 4.4, { tone: "mid" }, { owner: `knuckle${kx}` });
  disc("knuckle.cap", FZ(kx, ky), KNUCKLE_Z[1], KNUCKLE_Z[1] + 1.6, 5.2, { tone: "mid" }, { extra: Dots([at([kx, ky, KNUCKLE_Z[1] + 1.6])], { size: 0.5 }) });
}

// ---------------------------------------------------------------- column, torque sensor, steering wheel
disc("column.neck", COL, NECK[0], NECK[1], 2.6, { tone: "mid", crease: "none" });
disc("column.sensor", COL, SENSOR[0], SENSOR[1], 6.2, { tone: "mid", inner: Ln(G.arcOf(COL, SENSOR[0] + 1.6, 6.2, P) + G.arcOf(COL, SENSOR[1] - 1.6, 6.2, P), { tone: "faint" }) }, { extra: `<g data-sensor></g>`, pw: "sensor" });
disc("column.input", COL, SENSOR[1], UJ - 3.4, 2.2, { tone: "hi", crease: "none" }, { pw: "column" });
const ujAt = G.pointOf(COL, UJ, 0, 0);
put("column.joint", ujAt, S(G.sphereOf(ujAt, 3.6, P), { tone: "mid" }), { shapes: [record(A.ball(ujAt, 3.6, { name: "column.joint" }))] });
shaft("column.shaft", COL, 2.8, UJ + 3.4, WHEEL_S - 2, [[86, 92]], { tone: "hi" }, { pw: "column" });
// Column support: a clamp on a post.
const clampAt = G.pointOf(COL, 89, 0, 0);
disc("column.clamp", COL, 86, 92, 5.4, { tone: "mid" }, { rIn: 2.8 });
// The clamp's lowest point rests on a pad on top of a post.
const low = clampAt[2] - 5.4 * Math.sqrt(1 - COL_A[2] ** 2) - 3 * Math.abs(COL_A[2]);
const lowAt = G.add3(clampAt, G.add3(G.mul3(G.unit3(G.sub3([0, 0, -1], G.mul3(COL_A, -COL_A[2]))), 5.4), G.mul3(COL_A, -3 * Math.sign(COL_A[2]))));
const cpost = { x: lowAt[0] - 3.5, y: lowAt[1] - 3.5, w: 7, d: 7, r: 1.2 };
box("stand.column.post", cpost, 2.4, low - 2.4, {}, { bevel: 0.4, inner: Ln(k.sideSeam(cpost, 30, P, 3), { tone: "faint" }) });
box("stand.column.foot", { x: lowAt[0] - 7, y: lowAt[1] - 7, w: 14, d: 14, r: 2 }, 0, 2.4, {}, { extra: Dots(k.corners({ x: lowAt[0] - 7, y: lowAt[1] - 7, w: 14, d: 14 }, 2.4).map(([px, py]) => at([px, py, 2.4])), { size: 0.42 }) });
// Wheel: hub, rim and spokes drawn in the wheel's own plane so they turn exactly.
disc("wheel.hub", COL, WHEEL_S - 2, WHEEL_S + 3, 5.6, { tone: "hi" }, { pw: "wheel" });
{
  const id = nameFor("wheel.rim");
  const shape = record(A.ring(COL, WHEEL_S, WHEEL_S + 3.2, 21.4, 25, { name: id }));
  put(id, G.pointOf(COL, WHEEL_S + 1.6, 0, 0), S(G.ringBand(WHEEL_S, WHEEL_S + 3.2, 21.4, 25, COL, P, { hole: [WHEEL_S + 3.2, 21.4] }), { tone: "hi" }), { shapes: [shape], pw: "wheel" });
}
const C = G.pointOf(COL, WHEEL_S + 3.2, 0, 0);
const o = at(C);
const eu = G.sub3([...at(G.add3(C, COL.u)), 0], [...o, 0]);
const ev = G.sub3([...at(G.add3(C, COL.v)), 0], [...o, 0]);
const PLANE = `matrix(${eu[0].toFixed(5)} ${eu[1].toFixed(5)} ${ev[0].toFixed(5)} ${ev[1].toFixed(5)} ${o[0].toFixed(3)} ${o[1].toFixed(3)})`;
const spokeShapes = [0, 90, 180].map((a0) => {
  const a = ((a0 - 90) * Math.PI) / 180;
  const c = Math.cos(a), sn = Math.sin(a), w = 1.6;
  const p = (r, o) => [r * c - o * sn, r * sn + o * c];
  return record(A.prism(COL, [p(5.6, -w), p(21.6, -w * 1.5), p(21.6, w * 1.5), p(5.6, w)], WHEEL_S + 0.4, WHEEL_S + 2.8, { name: "wheel.spokes" }));
});
put("wheel.spokes", G.pointOf(COL, WHEEL_S + 3.3, 0, 0), `<g transform="${PLANE}"><g data-spokes></g></g>`, { bias: 0.5, shapes: spokeShapes });

// ---------------------------------------------------------------- moving parts: placeholders at rest
const DYN = [];
function dyn(name, ref, shapes) {
  const id = nameFor(name);
  put(id, ref, `<g data-dyn="${DYN.length}"></g>`, { shapes: shapes.map((s) => record({ ...s, name: id })) });
  DYN.push(name);
}
for (const side of M.SIDES) {
  const s = side.sign;
  const end = s * (M.GEO.inner - 4);
  dyn(`rack.bar.${s < 0 ? "l" : "r"}`, [(end + s * 64) / 2, 0, RZ], [A.disc(F, Math.min(end, s * 64), Math.max(end, s * 64), RACK_R, {})]);
  const ball = [s * M.GEO.inner, 0, RZ];
  dyn(`rack.ball.${s < 0 ? "l" : "r"}`, ball, [A.ball(ball, 4, {})]);
  const tip = [side.K[0] + side.arm[0], side.K[1] + side.arm[1], ARM_Z[1] + 3];
  const rodF = G.frameAlong(ball, G.unit3(G.sub3(tip, ball)));
  const rodLen = G.len3(G.sub3(tip, ball));
  dyn(`tierod.${s < 0 ? "l" : "r"}`, G.lerp3(ball, tip, 0.5), [A.disc(rodF, Math.sqrt(16 - 1.6 ** 2), rodLen - Math.sqrt(9 - 1.6 ** 2), 1.6, {})]);
  dyn(`tierod.end.${s < 0 ? "l" : "r"}`, tip, [A.ball(tip, 3, {})]);
  const armF = G.frameOf([side.K[0], side.K[1], 0], [0, 0, 1], G.unit3([side.arm[0], side.arm[1], 0]), G.unit3([-side.arm[1], side.arm[0], 0]));
  dyn(`knuckle.arm.${s < 0 ? "l" : "r"}`, [side.K[0] + side.arm[0] / 2, side.K[1] + side.arm[1] / 2, (ARM_Z[0] + ARM_Z[1]) / 2], [A.prism(armF, G.stadium(4.4, 3, Math.hypot(...side.arm) - 3.2), ARM_Z[0], ARM_Z[1], {})]);
  const WF = G.frameAlong([side.K[0], side.K[1], RZ], [s, 0, 0]);
  dyn(`wheel.${s < 0 ? "l" : "r"}`, G.pointOf(WF, 12, 0, 0), [A.disc(WF, 4.4, 9, 3, {}), A.disc(WF, 9, 12, 20, {}), A.disc(WF, 12, 16, 7, {})]);
}

// ---------------------------------------------------------------- order
A.settle(R, P);
const pk = R.items.filter((i) => i.belt === "pulley").map((i) => i.key);
R.items.push({ name: "belt.inner", key: Math.min(...pk) - 0.01, svg: B.inner, shapes: [], move: [0, 0, 0] });
R.items.push({ name: "belt.outer", key: Math.max(...pk) + 0.01, svg: B.outer, shapes: [], move: [0, 0, 0] });
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => `<g class="it"${item.pw ? ` data-pw="${item.pw}"` : ""}>${item.svg}</g>`);

const LABEL = "A Ford Focus Mk3 steering rack on a bench: the rack tube on two mounts, the electric motor and its control module behind it driving the rack through a toothed belt and ball nut, tie rods to two steering knuckles with their hubs, and the steering column rising to a steering wheel, with the torque sensor at the pinion input.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: back.join("") + `<g>${groups.join("")}</g>` });

const DATA = {
  ...X.basis(),
  P,
  SPIN: X.SPIN,
  RZ,
  RACK_R,
  TUBE,
  ARM_Z,
  TIP_Z: ARM_Z[1] + 3,
  COL: { o: COL_O, a: COL_A, u: COL.u, v: COL.v },
  SENSOR,
  BELT: { OUTER: B.OUTER, x0: BELT_X[0], x1: BELT_X[1] },
  PULLEYS,
  DYN,
  model: { LOCK: M.LOCK, RATIO: M.RATIO, ROAD_LOCK: M.ROAD_LOCK, TORSION: M.TORSION, RACK_PER_DEG: M.RACK_PER_DEG, GEO: M.GEO, SIDES: M.SIDES },
};
const SPEEDS = [[0, "Parking 0"], [30, "Town 30"], [100, "Highway 100"]];
const controls = `<div class="ep-controls"><span class="ep-speeds" role="group" aria-label="Road speed, km/h">${SPEEDS.map(([v, label]) => `<button type="button" class="ep-speed" data-speed="${v}">${label}</button>`).join("")}</span><button type="button" class="ep-tour" data-tour>Tour</button><span class="ep-live" aria-live="polite" data-live></span></div>`;
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">${META.fig}</span><span class="iso-plate-corner" data-corner="title">Electric power steering · 14.7:1</span><span class="iso-plate-corner" data-corner="hint">Drag sideways to steer</span><span class="iso-plate-corner" data-corner="readout" data-readout>0 km/h · wheel 0°</span></div>`;
const stage = `<div class="iso-stage ep-stage" tabindex="0" role="group" aria-label="Focus Mk3 electric power steering. Drag left or right to turn the steering wheel, or use the arrow keys; press 1 to 3 to choose a road speed.">${svg}</div>`;
const KEYS = [
  { mark: "lit", label: "Torque path: column, torsion bar, motor, belt and ball nut while the motor is helping" },
  { mark: "raised", label: "Torque sensor window: the two marks part as the torsion bar twists" },
  { mark: "flat", label: "Rack, tie rods and knuckles: inner wheel turns further than outer" },
];
const keysHtml = `<span class="iso-keys">${KEYS.map(({ mark, label }) => `<span class="iso-key"><svg class="iso-swatch" data-mark="${mark}" viewBox="0 0 16 10"><path d="M1 8 L8 2 L15 8"/></svg>${label}</span>`).join("")}</span>`;
const CAPTION = `The Mk3 Focus has no power-steering pump. A torsion bar at the bottom of the column twists slightly when you turn the wheel; the torque sensor reads that twist and the control module on the rack tells the motor how hard to help. The motor drives the rack through a toothed belt, most likely onto a ball nut around the rack, which is how rack-mounted belt-drive EPAS is usually built. Assist is greatest when parking and fades with speed, so the car is light in a car park and steady on the motorway. The 2012 Focus sedan has a 14.7:1 overall ratio and 2.6 turns lock to lock, so the road wheels reach about ${M.ROAD_LOCK.toFixed(1)}° on average; the inner wheel turns further than the outer. The assist curve and tyre loads shown are illustrative, not Ford's calibration.`;
const body = `<figure class="iso-figure ep"><div class="iso-plate">${corners}${stage}${controls}</div><figcaption class="iso-legend">${keysHtml}<span class="iso-caption">${CAPTION}</span></figcaption></figure>`;

const CSS = readFileSync(join(HERE, "epas.css"), "utf8");
const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export \{[^}]*\};?$/m, "").replace(/^export /gm, "");
const LIVE = BELT_LIVE + readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA)).replace("__MODEL__", MODEL);
const page = k.pageHtml({ title: "Electric power steering · Focus Mk3, opened up", theme: THEME, body: `<style>${CSS}${NAV_CSS}</style>${nav("epas")}${body}${FOOT}`, script: kitScript() + latheScript() + LIVE, width: 980 });
const file = write("epas", THEME, page);
console.log("wrote", file, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`);
A.auditOrExit(R, P, { cover: ["belt.inner", "belt.outer"], allow: [["wheel.hub", "wheel.spokes"], ["wheel.rim", "wheel.spokes"]] });
