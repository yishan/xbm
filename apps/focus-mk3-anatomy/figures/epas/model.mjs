// Focus Mk3 electric power-assisted steering (EPAS).
// Published (2012 Focus sedan spec sheet): 14.7:1 overall ratio, 2.6 turns lock to lock.
// Hardware (Ford service information, Focus repair specialists): the motor and its control module
// are mounted on the rack and drive it through a toothed belt (most likely onto a ball nut); a torque
// sensor at the pinion input measures the twist of a torsion bar between the column and the pinion.
// The boost curve and tyre load below are illustrative of the behaviour Ford describes (full assist
// when parking, less as speed rises), not Ford's calibration.

export const RATIO = 14.7;
export const TURNS = 2.6;
export const LOCK = (TURNS / 2) * 360; // steering-wheel degrees each side
export const ROAD_LOCK = LOCK / RATIO;
export const TORSION = 1.5; // N·m per degree of torsion-bar twist (illustrative, typical)

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
// Assist multiplier: motor torque at the pinion = boost × driver torque.
export const boost = (kmh) => 1 + 9 * Math.exp(-kmh / 22);
// Torque the tyres push back with, at the pinion (N·m): scrub when parked, aligning torque on the move.
export function loadAt(kmh, roadDeg) {
  const share = Math.min(1, Math.abs(roadDeg) / ROAD_LOCK);
  const parked = 36 * Math.exp(-kmh / 12) * share ** 0.75;
  const moving = (kmh / 100) * 8 * Math.tanh((Math.abs(roadDeg) * kmh) / 150);
  return Math.sign(roadDeg) * (parked + moving + 1.2 * share);
}
export function torques(kmh, roadDeg) {
  const load = loadAt(kmh, roadDeg);
  const b = boost(kmh);
  const driver = load / (1 + b);
  return { load, driver, motor: load - driver, boost: b, twist: driver / TORSION };
}

// Steering geometry in the figure's own units: two knuckles turned by tie rods from the rack ends.
export const GEO = { kingpin: [128, -30], arm: [-6, 30], inner: 78, z: 44 };
const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
export function sideOf(sign) {
  const K = [sign * GEO.kingpin[0], GEO.kingpin[1]];
  const arm = [sign * GEO.arm[0], GEO.arm[1]];
  const tip0 = [K[0] + arm[0], K[1] + arm[1]];
  const rod = len(tip0, [sign * GEO.inner, 0]);
  return { sign, K, arm, rod };
}
export const SIDES = [sideOf(-1), sideOf(1)];
// Yaw (radians) of one knuckle for a rack displacement d, from the fixed tie-rod length.
export function yawOf(side, d) {
  const inner = [side.sign * GEO.inner + d, 0];
  const f = (a) => { const t = rot(side.arm, a); return len([side.K[0] + t[0], side.K[1] + t[1]], inner) - side.rod; };
  // Walk out from straight ahead in the direction that shortens the error, to the first root.
  const f0 = f(0);
  if (Math.abs(f0) < 1e-9) return 0;
  const dir = f(0.01) * f0 < 0 || Math.abs(f(0.01)) < Math.abs(f0) ? 1 : -1;
  let a = 0, fa = f0;
  for (let i = 1; i <= 400; i++) {
    const b = dir * i * 0.004;
    const fb = f(b);
    if (Math.sign(fb) !== Math.sign(fa)) {
      let lo = a, hi = b;
      for (let j = 0; j < 40; j++) { const mid = (lo + hi) / 2; if (Math.sign(f(mid)) === Math.sign(fa)) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    a = b; fa = fb;
  }
  return a;
}
// Rack travel per steering-wheel degree, found so that the mean road-wheel angle at lock is LOCK / RATIO.
export const RACK_PER_DEG = (() => {
  const mean = (d) => (Math.abs(yawOf(SIDES[0], d)) + Math.abs(yawOf(SIDES[1], d))) / 2;
  let lo = 0, hi = 30;
  for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if ((mean(mid) * 180) / Math.PI < ROAD_LOCK) lo = mid; else hi = mid; }
  return (lo + hi) / 2 / LOCK;
})();
export { smooth, rot };
