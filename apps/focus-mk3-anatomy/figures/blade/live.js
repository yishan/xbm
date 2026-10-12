
const D = __DATA__;
__MODEL__
const G = LATHE;
const root = document.querySelector(".bl");
const stage = root.querySelector(".bl-stage");
const svg = stage.querySelector("svg");
const readout = root.querySelector("[data-readout]");
const live = root.querySelector("[data-live]");
const tourButton = root.querySelector("[data-tour]");
const poseButtons = [...root.querySelectorAll("[data-h]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const P = D.P;
const slots = Object.fromEntries([...svg.querySelectorAll("[data-dyn]")].map((el) => [D.DYN[+el.dataset.dyn], el]));
const screen = ([x, y, z]) => [D.O[0] + D.EX[0] * x + D.EY[0] * y + D.EZ[0] * z, D.O[1] + D.EX[1] * x + D.EY[1] * y + D.EZ[1] * z];
const solid = (paths, tone = "hi", lit = false) => solidSvg(paths, { tone, lit });
const P2 = (pts) => "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join("L");

function helix(p0, p1, r, turns) {
  const a = G.unit3(G.sub3(p1, p0));
  const u = G.unit3(G.cross3(Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], a));
  const v = G.cross3(a, u);
  const back = [], front = [];
  let run = null, side = null;
  const N = Math.round(turns * 28);
  for (let i = 0; i <= N; i++) {
    const t = i / N, ang = t * turns * Math.PI * 2;
    const n = G.add3(G.mul3(u, Math.cos(ang)), G.mul3(v, Math.sin(ang)));
    const p = G.add3(G.lerp3(p0, p1, t), G.mul3(n, r));
    const s = screen(p);
    const facing = G.dot3(n, D.V) > 0 ? "f" : "b";
    if (facing !== side) { if (run) (side === "f" ? front : back).push(run); run = run ? [run[run.length - 1], s] : [s]; side = facing; }
    else run.push(s);
  }
  if (run) (side === "f" ? front : back).push(run);
  const ends = [screen(G.add3(p0, G.mul3(u, r))), screen(G.add3(p1, G.mul3(G.add3(G.mul3(u, Math.cos(turns * Math.PI * 2)), G.mul3(v, Math.sin(turns * Math.PI * 2))), r)))];
  return `<path class="iso-line" data-tone="lo" d="${back.map(P2).join("")}"/><path class="iso-line" data-tone="hi" style="stroke-width:1px" d="${front.map(P2).join("")}"/>` + dotsSvg(ends, { size: 0.9, tone: "hi" });
}
let warm;
const S = { h: 0, target: 0 };
function draw() {
  const pose = poseAt(S.h, warm);
  warm = pose.x;
  const Rm = rotation(pose.r);
  const rx = [Rm[0], Rm[3], Rm[6]], ry = [Rm[1], Rm[4], Rm[7]], rz = [Rm[2], Rm[5], Rm[8]];
  const Fk = G.frameOf(place(pose, [0, 0, 0]), rx, ry, rz);
  slots.blade.innerHTML = solid(G.prismOf(Fk, D.BLADE, D.BX[0], D.BX[1], P), "hi", true);
  slots.knuckle.innerHTML = solid(G.prismOf(Fk, D.KNUCKLE, D.KX[0], D.KX[1], P), "mid");
  const Fh = G.frameOf(place(pose, C0), rx, ry, rz);
  const facing = G.dot3(rx, D.V) > 0;
  slots.hub.innerHTML = solid(G.disc(D.KX[1] - C0[0], -3, 9, Fh, P), "mid") + solid(G.disc(-3, 1, 24, Fh, P), "hi") + (facing ? lineSvg(G.circleOf(Fh, 1, 18, P), { tone: "faint" }) : "") + solid(G.disc(1, 7, 8, Fh, P), "hi") + (facing ? dotsSvg(G.dotsOf(Fh, 7, 5, 5, P, { all: true }), { size: 0.5 }) : "");
  for (const [name, l] of Object.entries(LINKS)) {
    const outer = place(pose, l.outer);
    const dir = G.unit3(G.sub3(outer, l.inner));
    const L = G.len3(G.sub3(outer, l.inner));
    slots[`link.${name}`].innerHTML = solid(G.disc(4.6, L - 4.6, name === "spring" ? 3.6 : 2.4, G.frameAlong(l.inner, dir), P), name === "toe" ? "hi" : "mid");
    slots[`eye.${name}.inner`].innerHTML = solid(G.disc(-4, 4, 4.6, G.frameOf(l.inner, [0, 1, 0], [0, 0, 1], [1, 0, 0]), P), "mid");
    slots[`eye.${name}.outer`].innerHTML = solid(G.disc(-4, 4, 4.6, G.frameOf(outer, ry, rz, rx), P), "mid");
  }
  const so = place(pose, LINKS.spring.outer);
  const seat = G.lerp3(LINKS.spring.inner, so, SPRING_AT);
  const seatTop = [seat[0], seat[1], seat[2] + 6.6];
  slots["spring.seat"].innerHTML = solid(G.disc(seat[2] + 4.2, seatTop[2], 10, G.frameOf([seat[0], seat[1], 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), "mid");
  slots["spring.coil"].innerHTML = helix(seatTop, [seat[0] + 0, 8, D.BODY_Z[0] - 4], 8.6, 6.5);
  const dl = place(pose, DAMPER.lower);
  const dd = G.unit3(G.sub3(DAMPER.upper, dl));
  const dL = G.len3(G.sub3(DAMPER.upper, dl));
  const Fd = G.frameAlong(dl, dd);
  slots.damper.innerHTML = solid(G.disc(-3.6, 3.6, 3.6, G.frameOf(dl, ry, rz, rx), P), "mid") + solid(G.disc(3.6, 40, 4.6, Fd, P), "hi") + solid(G.disc(40, dL - 4.2, 1.6, Fd, P), "hi");
  const a = angles(pose);
  const text = `travel ${S.h >= 0 ? "+" : "−"}${Math.abs(S.h).toFixed(0)} · camber ${a.camber >= 0 ? "+" : "−"}${Math.abs(a.camber).toFixed(2)}° · ${a.toe >= 0 ? "toe-in" : "toe-out"} ${Math.abs(a.toe).toFixed(2)}°`;
  if (readout.textContent !== text) readout.textContent = text;
  for (const b of poseButtons) b.toggleAttribute("data-on", Math.abs(+b.dataset.h - S.target) < 0.5);
}
function step(dt, calm) {
  const d = S.target - S.h;
  S.h += calm ? d : d * (1 - Math.exp(-dt / 0.35));
  if (Math.abs(S.target - S.h) < 0.01) S.h = S.target;
}
let touring = !still.matches, tourClock = 0, idleTimer = 0;
const TOUR = [[0, 1.6], [24, 2.6], [0, 2], [-24, 2.6], [0, 2]];
let tourAt = 0;
const say = (h) => (live.textContent = h > 0 ? "bump: the short toe link pulls the front of the tyre in" : h < 0 ? "rebound: the wheel drops and tilts out" : "ride height");
let frame = 0, last = 0, visible = false;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { tourClock += dt; if (tourClock > TOUR[tourAt][1]) { tourClock = 0; tourAt = (tourAt + 1) % TOUR.length; S.target = TOUR[tourAt][0]; say(S.target); } }
  step(dt, still.matches);
  draw();
  frame = visible && (touring || S.h !== S.target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { step(1, true); draw(); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const pause = () => {
  touring = false;
  tourButton.removeAttribute("data-on");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (!still.matches) { touring = true; tourButton.setAttribute("data-on", ""); run(); } }, 8000);
};
const setTarget = (h) => { S.target = Math.max(TRAVEL[0], Math.min(TRAVEL[1], h)); stage.setAttribute("aria-valuenow", String(Math.round(S.target))); stage.setAttribute("aria-valuetext", `${Math.round(S.target)} travel`); run(); };
tourButton.toggleAttribute("data-on", touring);
tourButton.addEventListener("click", () => { touring = !touring; tourButton.toggleAttribute("data-on", touring); clearTimeout(idleTimer); run(); });
for (const b of poseButtons) b.addEventListener("click", () => { pause(); setTarget(+b.dataset.h); say(S.target); });
let drag = null;
stage.addEventListener("pointerdown", (e) => { drag = { y: e.clientY, h: S.target }; stage.setPointerCapture(e.pointerId); pause(); });
stage.addEventListener("pointermove", (e) => { if (!drag) return; const box = svg.getBoundingClientRect(); setTarget(drag.h - ((e.clientY - drag.y) / box.height) * 120); });
stage.addEventListener("pointerup", () => (drag = null));
stage.addEventListener("pointercancel", () => (drag = null));
stage.addEventListener("keydown", (e) => {
  const by = { ArrowUp: 3, ArrowDown: -3 }[e.key];
  if (by) { e.preventDefault(); pause(); setTarget(S.target + by * (e.shiftKey ? 3 : 1)); say(S.target); }
  if (e.key === "Home") { e.preventDefault(); pause(); setTarget(0); say(0); }
});
draw();
window.__bl = S;
