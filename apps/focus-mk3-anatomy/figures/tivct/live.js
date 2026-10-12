
const D = __DATA__;
__MODEL__
const SLOW = 120; // the engine is drawn this many times slower than real
const PHASE_RATE = 90; // crank °/s the phasers can move, as drawn
const NAMES = { idle: "idle", cruise: "cruise", torque: "full load", power: "full load" };
const SCENES = { idle: [750, 0.08], cruise: [2000, 0.35], torque: [2750, 1], power: [5500, 1] };
const root = document.querySelector(".tv");
const stage = root.querySelector(".tv-stage");
const svg = stage.querySelector("svg");
const readout = root.querySelector("[data-readout]");
const live = root.querySelector("[data-live]");
const tourButton = root.querySelector("[data-tour]");
const sceneButtons = [...root.querySelectorAll("[data-scene]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const DEG = Math.PI / 180;

const movers = {};
for (const el of svg.querySelectorAll("[data-mv]")) (movers[el.dataset.mv] ??= []).push(el);
const lobes = [...svg.querySelectorAll("[data-lobe]")];
const springs = [...svg.querySelectorAll("[data-spring]")].map((g) => [...g.querySelectorAll("path")]);
const phasers = { intake: svg.querySelector('[data-phaser="intake"]'), exhaust: svg.querySelector('[data-phaser="exhaust"]') };
const wheel = svg.querySelector("[data-wheel]");
const teethPath = svg.querySelector("[data-belt-teeth]");
const spins = D.SPIN.map((s) => ({ ...s, groups: [...svg.querySelectorAll(`[data-sp="${CSS.escape(s.id)}"]`)], shown: 0 }));

const screen = ([x, y, z]) => [D.O[0] + D.EX[0] * x + D.EY[0] * y + D.EZ[0] * z, D.O[1] + D.EX[1] * x + D.EY[1] * y + D.EZ[1] * z];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const BANDS = [0, 0.2, 0.42, 0.62];
const bandOf = (s) => { let t = 0; while (t < BANDS.length && s >= BANDS[t]) t++; return t; };
const P2 = (pts, closed = true) => "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join("L") + (closed ? "Z" : "");
function hull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
// A prism along x with a convex (y, z) section, shaded by the kit's own light bands.
function prismSvg(section, x0, x1, tone = "hi") {
  const n = section.length;
  const a = section.map(([y, z]) => screen([x0, y, z]));
  const b = section.map(([y, z]) => screen([x1, y, z]));
  const shades = [[], [], [], [], []];
  for (let j = 0; j < n; j++) {
    const p = section[j], q = section[(j + 1) % n];
    const t = [q[0] - p[0], q[1] - p[1]];
    const len = Math.hypot(t[0], t[1]) || 1;
    const normal = [0, t[1] / len, -t[0] / len];
    if (dot(normal, D.V) <= 1e-6) continue;
    shades[bandOf(dot(normal, D.L))].push(P2([a[j], a[(j + 1) % n], b[(j + 1) % n], b[j]]));
  }
  const capTone = bandOf(D.L[0]);
  shades[capTone].push(P2(b));
  const h = P2(hull([...a, ...b]));
  let out = `<g class="iso-solid"><path class="iso-fill" d="${h}"/>`;
  shades.forEach((list, i) => { if (list.length) out += i === 4 ? `<path class="iso-top" d="${list.join("")}"/>` : `<path class="iso-shade" data-shade="${i}" d="${list.join("")}"/>`; });
  out += `<path class="iso-line iso-crease" data-tone="faint" d="${P2(b)}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${h}"/></g>`;
  return out;
}

// ---- state
const S = { rpm: IDLE, load: 0.08, target: [IDLE, 0.08], adv: 0, ret: 0, crank: 0, ocv: { intake: 0, exhaust: 0 }, scene: "idle" };
const T = () => timing(S.rpm, S.load);
const lobeSection = (nose) => {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const phi = -180 + (i / 72) * 360;
    const x = 0.5 + (phi * 2) / DURATION;
    const r = D.LOBE.base + (x > 0 && x < 1 ? D.LOBE.lift * liftAt(x * DURATION, 0, DURATION) : 0);
    const a = (nose + phi) * DEG;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
};
function events() {
  const ivo = IVO_PARK - S.adv;
  const evc = EVC_PARK + S.ret;
  return { ivo, ivc: ivo + DURATION, evc, evo: evc - DURATION, overlap: evc - ivo };
}
const sector = (r0, r1, a0, a1) => {
  const p = (r, a) => `${(r * Math.cos(a * DEG)).toFixed(2)} ${(r * Math.sin(a * DEG)).toFixed(2)}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
};
function phaserSvg(cam, housing, offset, pressure) {
  // Four chambers on the housing; one vane of the rotor in each. Turning is toward negative angles,
  // so the chamber on the + side of a vane is the advance chamber.
  let h = `<g transform="rotate(${housing.toFixed(2)})">`;
  h += `<circle class="tv-ring" r="15.6"/>`;
  for (let k = 0; k < 4; k++) {
    const c = 45 + 90 * k;
    const v0 = c + offset - 7, v1 = c + offset + 7;
    h += `<path class="tv-cavity" d="${sector(7, 14, c - 27, c + 27)}"/>`;
    h += `<path class="tv-oil" data-p="${pressure < 0 ? 1 : pressure > 0 ? 0 : 2}" d="${sector(7, 14, c - 27, v0)}"/>`;
    h += `<path class="tv-oil" data-p="${pressure > 0 ? 1 : pressure < 0 ? 0 : 2}" d="${sector(7, 14, v1, c + 27)}"/>`;
    const b = (c + 45) * DEG;
    h += `<circle class="tv-bolt" cx="${(17.6 * Math.cos(b)).toFixed(2)}" cy="${(17.6 * Math.sin(b)).toFixed(2)}" r=".55"/>`;
  }
  const park = cam === "intake" ? 12.5 : -12.5;
  const pa = (45 + park) * DEG;
  h += `<circle class="tv-ring" cx="${(10.4 * Math.cos(pa)).toFixed(2)}" cy="${(10.4 * Math.sin(pa)).toFixed(2)}" r="1.2"/>`;
  h += `<g transform="rotate(${offset.toFixed(2)})"><circle class="tv-rotor" r="7.2"/>`;
  for (let k = 0; k < 4; k++) h += `<path class="tv-rotor" d="${sector(6.9, 13.7, 45 + 90 * k - 7, 45 + 90 * k + 7)}"/>`;
  const locked = Math.abs(offset - park) < 0.3;
  h += `<circle class="tv-pin" data-locked="${locked ? 1 : 0}" cx="${(10.4 * Math.cos(45 * DEG)).toFixed(2)}" cy="${(10.4 * Math.sin(45 * DEG)).toFixed(2)}" r="1.1"/>`;
  h += `<circle class="tv-ring" r="3.2"/><circle class="tv-bolt" r="1.1"/></g></g>`;
  return h;
}
function wheelSvg(e) {
  // Degree wheel: TDC at the pointer when the crank is at 0°; intake opening and exhaust closing marked.
  let ticks = "", major = "";
  for (let a = 0; a < 360; a += 10) {
    const r0 = a % 90 === 0 ? 13 : 15.2;
    const c = Math.cos((90 + a) * DEG), s = Math.sin((90 + a) * DEG);
    const d = `M${(r0 * c).toFixed(2)} ${(r0 * s).toFixed(2)}L${(D.WHEEL_R * c).toFixed(2)} ${(D.WHEEL_R * s).toFixed(2)}`;
    if (a % 90 === 0) major += d; else ticks += d;
  }
  const at = (deg, r) => [(r * Math.cos((90 + deg) * DEG)).toFixed(2), (r * Math.sin((90 + deg) * DEG)).toFixed(2)];
  const [ix, iy] = at(e.ivo, 11.4), [ex, ey] = at(e.evc, 11.4);
  const a0 = Math.min(e.ivo, e.evc), a1 = Math.max(e.ivo, e.evc);
  const [ax, ay] = at(a0, 11.4), [bx, by] = at(a1, 11.4);
  const arc = `M${ax} ${ay}A11.4 11.4 0 0 1 ${bx} ${by}`;
  return `<g transform="rotate(${(-S.crank % 360).toFixed(2)})"><circle class="tv-ring" r="${D.WHEEL_R - 0.6}"/><path class="iso-line" data-tone="lo" d="${ticks}"/><path class="iso-line" data-tone="mid" d="${major}"/>` +
    `<path class="tv-overlap" data-under="${e.overlap < 0 ? 1 : 0}" d="${arc}"/><circle class="tv-ivo" cx="${ix}" cy="${iy}" r="1.25"/><circle class="tv-evc" cx="${ex}" cy="${ey}" r="1.25"/><circle class="tv-ring" r="4"/><circle class="tv-bolt" r="1.2"/></g>`;
}
function helix(x, y, z0, z1, r, turns) {
  const back = [], front = [];
  let run = null, side = null;
  const N = Math.round(turns * 28);
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = t * turns * Math.PI * 2;
    const p = [x + r * Math.cos(a), y + r * Math.sin(a), z0 + (z1 - z0) * t];
    const facing = Math.cos(a) * D.V[0] + Math.sin(a) * D.V[1] > 0 ? "front" : "back";
    const s = screen(p);
    if (facing !== side) { if (run) (side === "front" ? front : back).push(run); run = run ? [run[run.length - 1], s] : [s]; side = facing; }
    else run.push(s);
  }
  if (run) (side === "front" ? front : back).push(run);
  return [back.map((r) => P2(r, false)).join(""), front.map((r) => P2(r, false)).join("")];
}
// Belt arc length along the outer loop, for the teeth.
const LOOP = D.OUTER;
const SEG = LOOP.map((p, j) => { const q = LOOP[(j + 1) % LOOP.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
const TOTAL = SEG.reduce((a, b) => a + b, 0);
function teethD(shift) {
  const pitch = 3.2;
  let d = "", j = 0, s0 = 0;
  for (let s = ((shift % pitch) + pitch) % pitch; s < TOTAL; s += pitch) {
    while (j < SEG.length - 1 && s0 + SEG[j] < s) { s0 += SEG[j]; j++; }
    const p = LOOP[j], q = LOOP[(j + 1) % LOOP.length];
    const f = (s - s0) / SEG[j];
    const y = p[0] + (q[0] - p[0]) * f, z = p[1] + (q[1] - p[1]) * f;
    const t = [(q[0] - p[0]) / SEG[j], (q[1] - p[1]) / SEG[j]];
    const nv = 0 + t[1] * D.V[1] - t[0] * D.V[2];
    if (nv <= 0.05) continue;
    const a = screen([D.BELT_X[0], y, z]), b = screen([D.BELT_X[1], y, z]);
    d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return d;
}

function step(dt, calm) {
  const ease = calm ? 1 : 1 - Math.exp(-dt / 0.6);
  S.rpm += (S.target[0] - S.rpm) * ease;
  S.load += (S.target[1] - S.load) * ease;
  const goal = T();
  for (const [key, cam, want] of [["adv", "intake", goal.advance], ["ret", "exhaust", goal.retard]]) {
    const d = want - S[key];
    // A cam only moves once oil pressure is up: below ~1,000 rpm the phasers stay on their pins.
    const pressure = Math.min(1, Math.max(0, (S.rpm - 900) / 400));
    const move = calm ? d : Math.sign(d) * Math.min(Math.abs(d), PHASE_RATE * pressure * dt + (pressure === 0 && want === 0 ? Math.abs(d) * dt * 2 : 0));
    S[key] += move;
    const ahead = key === "adv" ? d : -d;
    S.ocv[cam] = Math.abs(d) < 0.6 ? 0 : ahead > 0 ? -1 : 1; // −1 advance, 0 hold, +1 retard
  }
  S.crank += (S.rpm / 60) * 360 * dt / SLOW;
}
function draw() {
  const e = events();
  const theta = S.crank;
  const housing = -theta / 2;
  const noses = {
    intake: -90 - (theta - (e.ivo + DURATION / 2)) / 2,
    exhaust: -90 - (theta - (e.evc - DURATION / 2)) / 2,
  };
  D.LOBES.forEach((l, i) => {
    const sec = lobeSection(noses[l.cam]).map(([u, v]) => [l.y + u, D.LOBE.zc + v]);
    lobes[i].innerHTML = prismSvg(sec, l.x - D.LOBE.w / 2, l.x + D.LOBE.w / 2);
  });
  const crank720 = ((theta % 720) + 720) % 720;
  D.VALVES.forEach((v, i) => {
    const lift = D.LOBE.lift * (v.cam === "intake" ? liftAt(crank720, e.ivo, e.ivc) : liftAt(crank720, e.evo, e.evc));
    const t = `translate(${(-D.EZ[0] * lift).toFixed(2)} ${(-D.EZ[1] * lift).toFixed(2)})`;
    for (const el of movers[`v${i}`] ?? []) el.setAttribute("transform", t);
    const [b, f] = helix(v.x, v.y, D.SPRING.z0, D.SPRING.z1 - lift, D.SPRING.r, D.SPRING.turns);
    springs[i][0].setAttribute("d", b);
    springs[i][1].setAttribute("d", f);
  });
  phasers.intake.innerHTML = phaserSvg("intake", housing, 12.5 - S.adv / 2, S.ocv.intake);
  phasers.exhaust.innerHTML = phaserSvg("exhaust", housing, -12.5 + S.ret / 2, -S.ocv.exhaust);
  wheel.innerHTML = wheelSvg(e);
  for (const [cam, s] of Object.entries(S.ocv)) {
    const lift = 1.2 - s * 1.2;
    for (const el of movers[`ocv.${cam}`] ?? []) el.setAttribute("transform", `translate(${(D.EZ[0] * lift).toFixed(2)} ${(D.EZ[1] * lift).toFixed(2)})`);
  }
  teethPath.setAttribute("d", teethD(-theta * DEG * 10));
  for (const sp of spins) {
    const angle = sp.source === "cam" ? housing * DEG : sp.source === "crank" ? -theta * DEG : -theta * DEG * (10 / 6);
    const pitch = (Math.PI * 2) / sp.teeth;
    const ph = Math.floor((((angle / pitch) % 1) + 1) % 1 * 6) % 6;
    if (ph !== sp.shown) { sp.groups[sp.shown]?.style.setProperty("display", "none"); sp.groups[ph]?.style.removeProperty("display"); sp.shown = ph; }
  }
  const parked = S.adv < 0.3 && S.ret < 0.3;
  const text = `${Math.round(S.rpm / 10) * 10} rpm · load ${Math.round(S.load * 100)}% · IVO ${fmtAngle(e.ivo)} · EVC ${fmtAngle(e.evc)} · ${e.overlap >= 0 ? "overlap" : "underlap"} ${Math.abs(Math.round(e.overlap))}°${parked ? " · parked" : ""}`;
  if (readout.textContent !== text) readout.textContent = text;
  for (const b of sceneButtons) b.toggleAttribute("data-on", b.dataset.scene === S.scene);
}

// ---- tour and input
const ORDER = ["idle", "cruise", "torque", "power"];
let touring = !still.matches, tourAt = 0, tourClock = 0, idleTimer = 0;
function scene(id, say = true) {
  S.scene = id;
  S.target = [...SCENES[id]];
  if (say) {
    const t = timing(...SCENES[id]);
    live.textContent = `${NAMES[id]} at ${SCENES[id][0]} rpm: intake ${t.advance > 0.5 ? `advanced ${Math.round(t.advance)}°` : "parked"}, exhaust ${t.retard > 0.5 ? `retarded ${Math.round(t.retard)}°` : "parked"}`;
  }
}
scene("idle", false);
let frame = 0, last = 0, visible = false;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) {
    tourClock += dt;
    if (tourClock > 6) { tourClock = 0; tourAt = (tourAt + 1) % ORDER.length; scene(ORDER[tourAt]); }
  }
  step(dt, still.matches);
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { step(1, true); draw(); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const pause = () => {
  touring = false;
  tourButton.removeAttribute("data-on");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (!still.matches) { touring = true; tourButton.setAttribute("data-on", ""); tourClock = 0; run(); } }, 8000);
};
tourButton.toggleAttribute("data-on", touring);
tourButton.addEventListener("click", () => { touring = !touring; tourButton.toggleAttribute("data-on", touring); clearTimeout(idleTimer); tourClock = 0; run(); });
for (const b of sceneButtons) b.addEventListener("click", () => { pause(); scene(b.dataset.scene); tourAt = ORDER.indexOf(b.dataset.scene); run(); });
stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" && event.buttons === 0) return;
  const box = svg.getBoundingClientRect();
  const fx = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  const fy = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
  pause();
  S.scene = "";
  S.target = [IDLE + fx * (REDLINE - IDLE), 1 - fy];
  run();
});
stage.addEventListener("pointerdown", (event) => stage.dispatchEvent(new PointerEvent("pointermove", { clientX: event.clientX, clientY: event.clientY, buttons: 1, pointerType: event.pointerType })));
stage.addEventListener("keydown", (event) => {
  const n = "1234".indexOf(event.key);
  if (n >= 0) { event.preventDefault(); pause(); scene(ORDER[n]); tourAt = n; run(); return; }
  const step = event.shiftKey ? 5 : 1;
  const map = { ArrowRight: [250, 0], ArrowLeft: [-250, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] };
  if (map[event.key]) {
    event.preventDefault();
    pause();
    S.scene = "";
    S.target = [Math.min(REDLINE, Math.max(IDLE, S.target[0] + map[event.key][0] * step)), Math.min(1, Math.max(0, S.target[1] + map[event.key][1] * step))];
    run();
  }
});
draw();
window.__tv = S;
