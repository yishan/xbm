// Ford 1.6 Ti-VCT (Sigma): twin independent variable cam timing.
// Hardware (Ford Duratec Ti-VCT technical brief): a vane rotor fixed to each camshaft turns inside a
// housing fixed to its sprocket; engine oil, metered by one 4/3-way oil control valve per cam, fills
// the advance or retard chambers; a stopper pin locks the rotor at its park position.
// Ranges follow the axes of Ford's published timing maps: intake opening from +20° to −30° crank
// (50° of authority) and overlap from −30° (underlap at idle) to about +70°. The map shape below is
// an illustration of the behaviour Ford describes, not Ford's calibration.

export const BORE = 79.0;
export const STROKE = 81.4;
export const CC = 1596;
export const DURATION = 232; // crank degrees, both cams (illustrative)
export const IVO_PARK = 20; // intake opens 20° after TDC when parked (fully retarded)
export const EVC_PARK = -10; // exhaust closes 10° before TDC when parked (fully advanced)
export const AUTH = { intake: 50, exhaust: 50 }; // crank degrees
export const LIFT = 8.4; // mm, illustrative
export const IDLE = 750;
export const REDLINE = 6300;

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const bump = (x, mid, half) => Math.max(0, 1 - ((x - mid) / half) ** 2);

// Intake: passive (parked) up to just under half load, then advanced, most at low rpm and full load.
export function intakeAdvance(rpm, load) {
  return AUTH.intake * smooth((load - 0.45) / 0.5) * (1 - 0.55 * smooth((rpm - 1750) / 2750));
}
// Exhaust: retarded at part load for internal EGR (less pumping, less NOx), most overlap in the mid
// range at full load, little at high rpm, none near idle.
export function exhaustRetard(rpm, load) {
  const partLoad = 35 * smooth((load - 0.12) / 0.25);
  const fullLoad = 15 * smooth((load - 0.7) / 0.25) * bump(rpm, 2750, 2000);
  return Math.min(AUTH.exhaust, (partLoad + fullLoad) * (1 - 0.6 * smooth((rpm - 4000) / 1500)) * smooth((rpm - 850) / 400));
}
export function timing(rpm, load) {
  const a = intakeAdvance(rpm, load);
  const e = exhaustRetard(rpm, load);
  const ivo = IVO_PARK - a;
  const evc = EVC_PARK + e;
  return { advance: a, retard: e, ivo, ivc: ivo + DURATION, evc, evo: evc - DURATION, overlap: evc - ivo };
}
// Valve lift (0…1) at a crank angle (degrees after TDC of the intake stroke), for a valve open over [open, close].
export function liftAt(crank, open, close) {
  const span = close - open;
  let t = (((crank - open) % 720) + 720) % 720;
  if (t > span) return 0;
  const x = t / span;
  return Math.sin(Math.PI * x) ** 2 * (1 + 0.15 * Math.sin(Math.PI * x) ** 2) / 1.15;
}
export const fmtAngle = (deg) => (Math.abs(deg) < 0.5 ? "TDC" : deg < 0 ? `${Math.round(-deg)}° BTDC` : `${Math.round(deg)}° ATDC`);
export { smooth };
