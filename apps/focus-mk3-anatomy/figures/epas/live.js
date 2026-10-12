
const D = __DATA__;
__MODEL__
const G = LATHE;
const root = document.querySelector(".ep");
const stage = root.querySelector(".ep-stage");
const svg = stage.querySelector("svg");
const readout = root.querySelector("[data-readout]");
const live = root.querySelector("[data-live]");
const tourButton = root.querySelector("[data-tour]");
const speedButtons = [...root.querySelectorAll("[data-speed]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const P = D.P;
const DEG = Math.PI / 180;
const LEAD = 3.5; // rack travel per turn of the ball nut, drawn units

const dyn = [...svg.querySelectorAll("[data-dyn]")];
const spokes = svg.querySelector("[data-spokes]");
const sensor = svg.querySelector("[data-sensor]");
const teeth = svg.querySelector("[data-belt-teeth]");
const powered = [...svg.querySelectorAll("[data-pw]")].map((el) => ({ tag: el.dataset.pw, solids: [...el.querySelectorAll(".iso-solid")] }));
const spins = D.SPIN.map((s) => ({ ...s, groups: [...svg.querySelectorAll(`[data-sp="${CSS.escape(s.id)}"]`)], shown: 0 }));
const screen = ([x, y, z]) => [D.O[0] + D.EX[0] * x + D.EY[0] * y + D.EZ[0] * z, D.O[1] + D.EX[1] * x + D.EY[1] * y + D.EZ[1] * z];
const solid = (paths, tone = "hi") => solidSvg(paths, { tone });
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const COL = { o: D.COL.o, a: D.COL.a, u: D.COL.u, v: D.COL.v };

const S = { sw: 0, target: 0, kmh: 0, litKey: "x" };
function sideParts(side, d) {
  const s = side.sign;
  const yaw = yawOf(side, d);
  const F = G.frameOf([0, 0, D.RZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const end = s * (GEO.inner - 4) + d;
  const bar = solid(G.disc(Math.min(end, s * (D.TUBE[1] + 2)), Math.max(end, s * (D.TUBE[1] + 2)), D.RACK_R, F, P), "hi");
  const ballAt = [s * GEO.inner + d, 0, D.RZ];
  const ball = solid(G.sphereOf(ballAt, 4, P), "mid");
  const arm = rot(side.arm, yaw);
  const tip = [side.K[0] + arm[0], side.K[1] + arm[1], D.TIP_Z];
  const dir = G.unit3(G.sub3(tip, ballAt));
  const L = G.len3(G.sub3(tip, ballAt));
  const rod = solid(G.disc(Math.sqrt(16 - 2.56), L - Math.sqrt(9 - 2.56), 1.6, G.frameAlong(ballAt, dir), P), "hi");
  const end2 = solid(G.sphereOf(tip, 3, P), "mid");
  const u = G.unit3([arm[0], arm[1], 0]);
  const AF = G.frameOf([side.K[0], side.K[1], 0], [0, 0, 1], u, [-u[1], u[0], 0]);
  const armSvg = solid(G.prismOf(AF, G.stadium(4.4, 3, Math.hypot(...side.arm) - 3.2), D.ARM_Z[0], D.ARM_Z[1], P), "mid");
  const out = rot([s, 0], yaw);
  const WF = G.frameAlong([side.K[0], side.K[1], D.RZ], [out[0], out[1], 0]);
  const toward = G.dot3(WF.a, D.V) > 0;
  const pieces = [
    solid(G.disc(4.4, 9, 3, WF, P), "mid"),
    solid(G.disc(9, 12, 20, WF, P), "hi") + (toward ? lineSvg(G.circleOf(WF, 12, 15, P), { tone: "faint" }) : ""),
    solid(G.disc(12, 16, 7, WF, P), "hi") + (toward ? dotsSvg(G.dotsOf(WF, 16, 4.6, 5, P, { all: true }), { size: 0.5 }) : ""),
  ];
  return { bar, ball, rod, end2, arm: armSvg, wheel: (toward ? pieces : pieces.reverse()).join(""), yaw };
}
function spokesSvg(angle) {
  let h = "";
  for (const a0 of [0, 90, 180]) {
    const a = (a0 - 90 - angle) * DEG;
    const c = Math.cos(a), s = Math.sin(a), w = 1.6;
    const p = (r, o) => `${(r * c - o * s).toFixed(2)} ${(r * s + o * c).toFixed(2)}`;
    h += `<path class="ep-spoke" d="M${p(5.6, -w)}L${p(21.6, -w * 1.5)}L${p(21.6, w * 1.5)}L${p(5.6, w)}Z"/>`;
  }
  return h + `<circle class="ep-ring" r="5.6"/><circle class="ep-ring" r="3"/>`;
}
const PHI0 = G.angleToward({ o: COL.o, a: COL.a, u: COL.u, v: COL.v }, D.V);
function sensorSvg(twist) {
  const F = COL;
  const w = 0.55;
  const [s0, s1] = [D.SENSOR[0] + 1.6, D.SENSOR[1] - 1.6], sm = (s0 + s1) / 2;
  const ring = (s, a0, a1) => { const pts = []; for (let i = 0; i <= 12; i++) pts.push(screen(G.pointOf(F, s, 6.2, a0 + ((a1 - a0) * i) / 12))); return pts; };
  const outline = [...ring(s0, PHI0 - w, PHI0 + w), ...ring(s1, PHI0 + w, PHI0 - w)];
  const mid = ring(sm, PHI0 - w, PHI0 + w);
  const k = Math.max(-w * 0.85, Math.min(w * 0.85, (twist * 4 * DEG)));
  const mark = (s0, s1, a) => [screen(G.pointOf(F, s0, 6.2, a)), screen(G.pointOf(F, s1, 6.2, a))];
  const P2 = (pts, close) => "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join("L") + (close ? "Z" : "");
  return `<path class="ep-window" d="${P2(outline, true)}"/><path class="iso-line" data-tone="lo" d="${P2(mid)}"/>` +
    `<path class="iso-line" data-tone="lit" style="stroke-width:1.2px" d="${P2(mark(sm, s1, PHI0 + k / 2))}"/><path class="iso-line" data-tone="mid" style="stroke-width:1.2px" d="${P2(mark(s0, sm, PHI0 - k / 2))}"/>`;
}

function draw() {
  const d = S.sw * RACK_PER_DEG;
  let i = 0;
  const yaws = [];
  for (const side of SIDES) {
    const p = sideParts(side, d);
    for (const key of ["bar", "ball", "rod", "end2", "arm", "wheel"]) dyn[i++].innerHTML = p[key];
    yaws.push(p.yaw);
  }
  const road = S.sw / RATIO;
  const t = torques(S.kmh, road);
  spokes.innerHTML = spokesSvg(S.sw);
  sensor.innerHTML = sensorSvg(t.twist);
  const nut = (d / LEAD) * Math.PI * 2;
  const motor = nut * (D.PULLEYS[0].r / D.PULLEYS[1].r);
  teeth.setAttribute("d", beltTeeth(D.BELT, nut * D.PULLEYS[0].r, screen, D.V));
  for (const sp of spins) {
    const angle = sp.source === "nut" ? nut : motor;
    const pitch = (Math.PI * 2) / sp.teeth;
    const ph = Math.floor((((angle / pitch) % 1) + 1) % 1 * 6) % 6;
    if (ph !== sp.shown) { sp.groups[sp.shown]?.style.setProperty("display", "none"); sp.groups[ph]?.style.removeProperty("display"); sp.shown = ph; }
  }
  const helping = Math.abs(t.motor) > 0.4;
  const key = helping ? "on" : "off";
  if (key !== S.litKey) {
    S.litKey = key;
    for (const { tag, solids } of powered) for (const el of solids) helping && ["motor", "nut", "column", "sensor", "wheel"].includes(tag) ? el.setAttribute("data-lit", "") : el.removeAttribute("data-lit");
  }
  const [yl, yr] = yaws.map((y) => Math.abs(y / DEG).toFixed(1));
  const text = `${S.kmh} km/h · wheel ${Math.round(S.sw)}° · road ${yl}°/${yr}° · you ${Math.abs(t.driver).toFixed(1)} N·m · motor ${Math.abs(t.motor).toFixed(1)} N·m`;
  if (readout.textContent !== text) readout.textContent = text;
  for (const b of speedButtons) b.toggleAttribute("data-on", +b.dataset.speed === S.kmh);
}
function step(dt, calm) {
  const diff = S.target - S.sw;
  S.sw += calm ? diff : Math.sign(diff) * Math.min(Math.abs(diff), 300 * dt * Math.min(1, Math.abs(diff) / 40 + 0.2));
}

// ---- tour and input
const TOUR = [
  [0, 0, 1.5], [0, LOCK, 3], [0, -LOCK, 4.5], [0, 0, 3],
  [30, 0, 1.5], [30, 150, 2.5], [30, -150, 3], [30, 0, 2],
  [100, 0, 1.5], [100, 40, 2], [100, -40, 2.5], [100, 0, 2],
];
let touring = !still.matches, tourAt = 0, tourClock = 0, idleTimer = 0;
const applyTour = () => { const [v, sw] = TOUR[tourAt]; if (v !== S.kmh) live.textContent = v === 0 ? "parking: full assist, the motor does about 90% of the work" : v === 30 ? "town speed: less assist" : "motorway: little assist, the wheel weighs up"; S.kmh = v; S.target = sw; };
applyTour();
let frame = 0, last = 0, visible = false;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { tourClock += dt; if (tourClock > TOUR[tourAt][2]) { tourClock = 0; tourAt = (tourAt + 1) % TOUR.length; applyTour(); } }
  step(dt, still.matches);
  draw();
  frame = visible && (touring || Math.abs(S.target - S.sw) > 0.01) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { step(1, true); draw(); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const pause = () => {
  touring = false;
  tourButton.removeAttribute("data-on");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (!still.matches) { touring = true; tourButton.setAttribute("data-on", ""); run(); } }, 8000);
};
tourButton.toggleAttribute("data-on", touring);
tourButton.addEventListener("click", () => { touring = !touring; tourButton.toggleAttribute("data-on", touring); clearTimeout(idleTimer); run(); });
for (const b of speedButtons) b.addEventListener("click", () => { pause(); S.kmh = +b.dataset.speed; live.textContent = `${S.kmh} km/h`; run(); });
let dragFrom = null;
stage.addEventListener("pointerdown", (e) => { dragFrom = { x: e.clientX, sw: S.target }; stage.setPointerCapture(e.pointerId); pause(); });
stage.addEventListener("pointermove", (e) => {
  if (!dragFrom) return;
  const box = svg.getBoundingClientRect();
  S.target = Math.max(-LOCK, Math.min(LOCK, dragFrom.sw + ((e.clientX - dragFrom.x) / box.width) * LOCK * 3));
  run();
});
const end = () => (dragFrom = null);
stage.addEventListener("pointerup", end);
stage.addEventListener("pointercancel", end);
stage.addEventListener("keydown", (e) => {
  const n = "123".indexOf(e.key);
  if (n >= 0) { e.preventDefault(); pause(); S.kmh = [0, 30, 100][n]; run(); return; }
  const by = { ArrowRight: 30, ArrowLeft: -30 }[e.key];
  if (by) { e.preventDefault(); pause(); S.target = Math.max(-LOCK, Math.min(LOCK, S.target + by * (e.shiftKey ? 4 : 1))); run(); }
  if (e.key === "Home") { e.preventDefault(); pause(); S.target = 0; run(); }
});
draw();
window.__ep = S;
