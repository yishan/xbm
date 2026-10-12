// A flat toothed belt round a set of pulleys whose axes run along x, drawn on the plane band x0…x1.
const TAU = Math.PI * 2;
export function hull2(points) {
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
export function belt({ P, k, G, pulleys, x0, x1, t = 1.6 }) {
  const at = (p) => k.iso(p, P);
  const V = G.viewOf(P);
  const L = G.lightOf(P);
  const loopOf = (extra) => hull2(pulleys.flatMap((p) => Array.from({ length: 96 }, (_, j) => [p.y + (p.r + extra) * Math.cos((j / 96) * TAU), p.z + (p.r + extra) * Math.sin((j / 96) * TAU)])));
  const OUTER = loopOf(t);
  const INNER = loopOf(0);
  function faces(loop, sign) {
    const shades = [[], [], [], [], []];
    let edges = "";
    for (let j = 0; j < loop.length; j++) {
      const a = loop[j];
      const b = loop[(j + 1) % loop.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const normal = [0, (sign * (b[1] - a[1])) / len, (-sign * (b[0] - a[0])) / len];
      if (G.dot3(normal, V) <= 1e-6) continue;
      const quad = [[x0, a[0], a[1]], [x0, b[0], b[1]], [x1, b[0], b[1]], [x1, a[0], a[1]]].map(at);
      shades[G.bandOf(G.dot3(normal, L))].push(k.pathOf(quad, true));
      edges += k.pathOf([quad[0], quad[1]]) + k.pathOf([quad[3], quad[2]]);
    }
    return { shades, edges };
  }
  const shadeSvg = (shades) => shades.map((list, i) => (list.length ? (i === 4 ? `<path class="iso-top" d="${list.join("")}"/>` : `<path class="iso-shade" data-shade="${i}" d="${list.join("")}"/>`) : "")).join("");
  const ring = (loop, x) => k.pathOf(loop.map(([y, z]) => at([x, y, z])), true);
  const inner = faces(INNER, -1);
  const outer = faces(OUTER, 1);
  const silhouette = k.pathOf(G.hullOf([...OUTER.map(([y, z]) => at([x0, y, z])), ...OUTER.map(([y, z]) => at([x1, y, z]))]), true);
  const front = `<path class="iso-fill" fill-rule="evenodd" d="${ring(OUTER, x1)}${ring([...INNER].reverse(), x1)}"/><path class="iso-shade" data-shade="2" fill-rule="evenodd" d="${ring(OUTER, x1)}${ring([...INNER].reverse(), x1)}"/>`;
  return {
    OUTER,
    inner: `<g class="iso-solid">${shadeSvg(inner.shades)}</g>`,
    outer: `<g class="iso-solid">${shadeSvg(outer.shades)}${front}<path class="iso-line" data-tone="lo" data-belt-teeth d=""/><path class="iso-line" data-tone="mid" d="${outer.edges}"/><path class="iso-line iso-edge" data-tone="hi" d="${silhouette}${ring(INNER, x1)}"/></g>`,
  };
}
// Page-side: tooth marks across the visible outer surface, moved along the loop by `shift` units.
export const BELT_LIVE = `
function beltTeeth(B, shift, screen, V, pitch = 3.2) {
  const LOOP = B.OUTER;
  B.seg ??= LOOP.map((p, j) => { const q = LOOP[(j + 1) % LOOP.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
  B.total ??= B.seg.reduce((a, b) => a + b, 0);
  let d = "", j = 0, s0 = 0;
  for (let s = ((shift % pitch) + pitch) % pitch; s < B.total; s += pitch) {
    while (j < B.seg.length - 1 && s0 + B.seg[j] < s) { s0 += B.seg[j]; j++; }
    const p = LOOP[j], q = LOOP[(j + 1) % LOOP.length];
    const f = (s - s0) / B.seg[j];
    const y = p[0] + (q[0] - p[0]) * f, z = p[1] + (q[1] - p[1]) * f;
    const ty = (q[0] - p[0]) / B.seg[j], tz = (q[1] - p[1]) / B.seg[j];
    if (tz * V[1] - ty * V[2] <= 0.05) continue;
    const a = screen([B.x0, y, z]), b = screen([B.x1, y, z]);
    d += "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + "L" + b[0].toFixed(1) + " " + b[1].toFixed(1);
  }
  return d;
}
`;
