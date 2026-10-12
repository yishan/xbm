// Drawing helpers shared by the XBM figures: every helper puts a depth-sorted item into the
// recorder and records its true shape, so A.settle orders it and the audit can check it.
const TAU = Math.PI * 2;

export function parts({ P, R, k, G, A, NPH = 6 }) {
  const V = G.viewOf(P);
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const Dots = (pts, style) => k.dotsSvg(pts, style);
  const Faded = (list, style) => k.fadedSvg(list, style);
  const RIBFADE = [0.1, 0.55];
  const FADE = [0.04, 0.42];
  const { nameFor } = R;
  const record = R.solid;
  const SPIN = [];
  const FX = (y, z) => G.frameOf([0, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const FY = (x, z) => G.frameOf([x, 0, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
  const FZ = (x, y) => G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const FYZ = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const FXZ = G.frameOf([0, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0]);

  function put(name, ref, svg, { bias = 0, shapes = [], ...rest } = {}) {
    return R.put({ at: ref, bias, svg, shapes, name, piece: "", ...rest });
  }
  const join = (style, inner) => ({ tone: "mid", ...style, inner: (style.inner ?? "") + inner });
  function box(name, plan, z, h, style = {}, { extra = "", inner = "", bias = 0, steps = 3, bevel = 0.5, owner, ...rest } = {}) {
    const id = nameFor(name);
    const shape = record(A.slab(plan, z, h, { name: id, owner }, steps));
    put(id, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), join(style, inner)) + extra, { bias, shapes: [shape], ...rest });
    return shape;
  }
  // A short turned cylinder on any frame: s from s0 to s1 along F.a.
  function disc(name, F, s0, s1, r, style = {}, { extra = "", inner = "", bias = 0, owner, rIn = 0, ref, ...rest } = {}) {
    const id = nameFor(name);
    const paths = rIn ? G.ringBand(s0, s1, rIn, r, F, P) : G.disc(s0, s1, r, F, P);
    const shape = record(rIn ? A.ring(F, s0, s1, rIn, r, { name: id, owner }) : A.disc(F, s0, s1, r, { name: id, owner }));
    put(id, ref ?? G.pointOf(F, (s0 + s1) / 2, 0, 0), S(paths, join({ tone: "hi", ...style }, inner)) + extra, { bias, shapes: [shape], ...rest });
    return shape;
  }
  function prism(name, F, poly, s0, s1, style = {}, { extra = "", bias = 0, owner, ...rest } = {}) {
    const id = nameFor(name);
    const shape = record(A.prism(F, poly, s0, s1, { name: id, owner }));
    const cu = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cv = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const ref = G.add3(G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.mul3(F.u, cu)), G.mul3(F.v, cv));
    put(id, ref, S(G.prismOf(F, poly, s0, s1, P), { tone: "mid", ...style }) + extra, { bias, shapes: [shape], ...rest });
    return shape;
  }
  // Teeth or ribs on a rim, drawn at NPH phases across one pitch; the live page shows one phase at a time.
  function teeth(id, F, s0, s1, r, count, { tone = "lo", seams = true } = {}) {
    const groups = [];
    for (let ph = 0; ph < NPH; ph++) {
      const ribs = G.ribsOf(F, s0, s1, r, count, P, { phase: (ph / NPH) * (TAU / count), fade: RIBFADE });
      groups.push(`<g data-sp="${id}" data-ph="${ph}"${ph ? ' style="display:none"' : ""}>${Faded(ribs, { tone })}</g>`);
    }
    const edge = seams ? Ln(G.arcOf(F, s0, r, P) + G.arcOf(F, s1, r, P), { tone: "faint" }) : "";
    return groups.join("") + edge;
  }
  function gear(name, F, s0, s1, r, rb, { count, source, sign = 1, tone = "hi", face = "", ...rest } = {}) {
    const id = nameFor(name);
    SPIN.push({ id, teeth: count, source, sign });
    const shape = record(rb ? A.ring(F, s0, s1, rb, r, { name: id, owner: rest.owner }) : A.disc(F, s0, s1, r, { name: id, owner: rest.owner }));
    const paths = rb ? G.ringBand(s0, s1, rb, r, F, P) : G.disc(s0, s1, r, F, P);
    put(id, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(paths, { tone, inner: teeth(id, F, s0, s1, r, count) + face }), { shapes: [shape], ...rest });
    return id;
  }
  // A shaft along F drawn in pieces between the collars that wrap it.
  function shaft(name, F, r, s0, s1, collars, style = {}, opts = {}) {
    const cuts = collars.filter(([a, b]) => b > s0 && a < s1).sort((p, q) => p[0] - q[0]);
    let from = s0;
    const spans = [];
    for (const [a, b] of cuts) {
      if (a > from + 0.05) spans.push([from, a]);
      from = Math.max(from, b);
    }
    if (s1 > from + 0.05) spans.push([from, s1]);
    for (const [a, b] of spans) disc(name, F, a, b, r, { tone: "mid", crease: "none", ...style }, opts);
  }
  // Pillow block on a column, axis along x at (y, z).
  function pedestal(name, x, y, z, rh, { width = 8, rIn = 0, foot = 10 } = {}) {
    const f = { x: x - foot / 2, y: y - 12, w: foot, d: 24, r: 2 };
    box(`stand.${name}.foot`, f, 0, 2.6, {}, { extra: Dots(k.corners(f, 3).map(([px, py]) => at([px, py, 2.6])), { size: 0.45 }), bevel: 0.4 });
    const col = { x: x - width / 2, y: y - 8, w: width, d: 16, r: 1.5 };
    const top = z - rh + 0.3;
    box(`stand.${name}.column`, col, 2.6, top - 2.6, {}, { inner: Ln(k.sideSeam(col, Math.min(12, top - 4), P, 3), { tone: "faint" }), bevel: 0.4 });
    const F = FX(y, z);
    const x1 = x + width / 2;
    const face = Ln(G.circleOf(F, x1, rh - 2, P), { tone: "lo" }) + Dots(G.dotsOf(F, x1, rh - 3.6, 4, P, { all: true, phase: Math.PI / 4 }), { size: 0.45 });
    disc(`stand.${name}.housing`, F, x - width / 2, x1, rh, { tone: "mid" }, { extra: face, rIn });
  }
  // Bench plate on feet with a groove, corner screws, a ruler strip and a label plate.
  function bench(BASE, { height = 12, feet = 6, label, ruler } = {}) {
    const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -height - feet, height, P)}"/>`];
    for (const [x, y] of k.corners(BASE, 22).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
      out.push(S(k.cylinder(x, y, 8, -height - feet, 1.8, P, 32), { tone: "lo" }));
      out.push(S(k.cylinder(x, y, 6.2, -height - feet + 1.8, feet - 1.8, P, 32), { tone: "mid" }));
    }
    out.push(S(k.slabOf(BASE, -height, height, P, 9, 1.6), { tone: "mid", inner: Ln(k.sideSeam(BASE, -height + 4, P, 9), { tone: "faint" }) }));
    record(A.slab(BASE, -height, height, { name: "stand.base" }, 9));
    out.push(Ln(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "lo" }));
    const screws = k.corners(BASE, 11);
    out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 18)).join(""), { tone: "lo" }), Dots(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    if (ruler) {
      const strip = ruler;
      out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
      const px = G.scaleOf(P);
      const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y, 0.6, [Math.min(1.8, 3.6 / px), Math.min(3.4, 6.2 / px)], P);
      out.push(Ln(t.minor, { tone: "lo" }), Ln(t.major, { tone: "mid" }));
      out.push(Dots([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
    }
    if (label) {
      const { plan, text, along = "y" } = label;
      out.push(S(k.slabOf(plan, 0, 0.8, P, 4), { tone: "lo" }));
      out.push(Ln(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: "faint" }));
      const rules = along === "y"
        ? [8, 14, 20].map((dx, j) => k.lineOnTop([plan.x + dx + 6, plan.y + 7], [plan.x + dx + 6, plan.y + plan.d - 7 - j * 4], 0.8, P)).join("")
        : [8, 14, 20].map((dy, j) => k.lineOnTop([plan.x + 7, plan.y + dy + 6], [plan.x + plan.w - 7 - j * 4, plan.y + dy + 6], 0.8, P)).join("");
      out.push(Ln(rules, { tone: "lo", free: true }));
      const textAt = along === "y" ? [plan.x + 6, plan.y + plan.d / 2] : [plan.x + plan.w / 2, plan.y + 6];
      out.push(k.faceTextSvg(k.topMatrix(textAt, 0.8, P, along), text, { size: 4.2, tone: "mid", anchor: "middle" }));
      out.push(Dots([at([plan.x + 3, plan.y + 3, 0.8]), at([plan.x + plan.w - 3, plan.y + plan.d - 3, 0.8])], { size: 0.42 }));
    }
    return out.join("");
  }
  // SVG matrix mapping a flat local (u, v) drawing onto the plane x = x0 (u → +y, v → +z).
  const planeX = (x0) => {
    const o = at([x0, 0, 0]);
    const ey = G.sub3([...at([x0, 1, 0]), 0], [...o, 0]);
    const ez = G.sub3([...at([x0, 0, 1]), 0], [...o, 0]);
    return `matrix(${ey[0].toFixed(5)} ${ey[1].toFixed(5)} ${ez[0].toFixed(5)} ${ez[1].toFixed(5)} ${o[0].toFixed(3)} ${o[1].toFixed(3)})`;
  };
  const basis = () => {
    const o = at([0, 0, 0]);
    const d = (p) => [at(p)[0] - o[0], at(p)[1] - o[1]];
    return { O: o, EX: d([1, 0, 0]), EY: d([0, 1, 0]), EZ: d([0, 0, 1]), V, L: G.lightOf(P) };
  };
  return { V, at, S, Ln, Dots, Faded, FADE, RIBFADE, SPIN, FX, FY, FZ, FYZ, FXZ, put, box, disc, prism, teeth, gear, shaft, pedestal, bench, planeX, basis, record, nameFor };
}
