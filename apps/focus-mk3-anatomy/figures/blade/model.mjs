// Focus Control Blade rear suspension, one corner (left rear seen from outboard and behind).
// Parts (Edmunds walk-arounds of the 2012 Focus): a pressed-steel trailing arm, the "blade", welded to
// the knuckle; a long lower link that carries the coil spring; a short toe link ahead of it; a curved
// upper camber link; a damper mounted apart from the spring. The blade is stiff fore-aft and
// vertically but meant to flex sideways, so the short toe link and the long spring link can steer the
// wheel a little as it rises.
// Kinematics: the knuckle is one rigid body held by three links of fixed length, with the blade's
// front bushing free to move sideways only (the flex). Travel sets the wheel-centre height. The
// geometry is this figure's own, so camber and toe are its true output, not Ford's published curves.

// x outboard (toward the wheel), y rearward, z up. Points at ride height.
export const C0 = [66, 0, 40]; // wheel centre
export const LINKS = {
  spring: { inner: [-62, 8, 26], outer: [48.4, 8, 20] },
  toe: { inner: [-28, -18, 31], outer: [48.4, -16, 26] },
  camber: { inner: [-44, -6, 70], outer: [48.4, -6, 62] },
};
export const BUSH = [50, -150, 44]; // blade front bushing (free sideways)
export const DAMPER = { lower: [49.4, 20, 24], upper: [34, 22, 84] };
export const SPRING_AT = 0.56; // seat position along the spring link from its inner pivot
export const TRAVEL = [-24, 24];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
export function rotation([rx, ry, rz]) {
  const t = Math.hypot(rx, ry, rz);
  if (t < 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const [x, y, z] = [rx / t, ry / t, rz / t];
  const c = Math.cos(t), s = Math.sin(t), C = 1 - c;
  return [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C];
}
const apply = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
// A pose: rotation vector r and translation t about the wheel centre at ride height.
export const place = (pose, p) => add(add(apply(rotation(pose.r), sub(p, C0)), C0), pose.t);
export const LEN = Object.fromEntries(Object.entries(LINKS).map(([k, l]) => [k, len(sub(l.outer, l.inner))]));

function residual(x, h) {
  const pose = { r: x.slice(0, 3), t: x.slice(3) };
  const out = [];
  for (const [k, l] of Object.entries(LINKS)) out.push(len(sub(place(pose, l.outer), l.inner)) - LEN[k]);
  const b = place(pose, BUSH);
  out.push(b[1] - BUSH[1], b[2] - BUSH[2]);
  out.push(place(pose, C0)[2] - (C0[2] + h));
  return out;
}
function solve6(A, b) {
  const n = 6;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}
// Knuckle pose for a wheel travel h (positive = bump), Newton from a warm start.
export function poseAt(h, start = [0, 0, 0, 0, 0, h]) {
  let x = [...start];
  for (let it = 0; it < 30; it++) {
    const f = residual(x, h);
    if (Math.max(...f.map(Math.abs)) < 1e-9) break;
    const J = f.map(() => new Array(6).fill(0));
    for (let j = 0; j < 6; j++) {
      const d = [...x];
      d[j] += 1e-6;
      const g = residual(d, h);
      for (let i = 0; i < 6; i++) J[i][j] = (g[i] - f[i]) / 1e-6;
    }
    const dx = solve6(J, f.map((v) => -v));
    x = x.map((v, i) => v + dx[i]);
  }
  return { r: x.slice(0, 3), t: x.slice(3), x };
}
// Camber (negative = top in) and toe (positive = toe-in, front of the wheel turned toward the car).
export function angles(pose) {
  const M = rotation(pose.r);
  const axis = apply(M, [1, 0, 0]);
  const forward = apply(M, [0, -1, 0]);
  const camber = (Math.asin(axis[2]) * 180) / Math.PI;
  const toe = (Math.atan2(-forward[0], -forward[1]) * 180) / Math.PI;
  const flex = place(pose, BUSH)[0] - BUSH[0];
  return { camber, toe, flex };
}
