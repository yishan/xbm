/**
 * Rocket: a tapered body with a round window, two fins at the base and a flame
 * below it. The pointer's height is the thrust, on one spring: the flame
 * lengthens and the rocket lifts a little. The pointer leaves, and it settles
 * back onto its fins with an idle flame still lit. The flame is the one bright
 * mark; the window is the only other line on the body.
 *
 * The pattern: a single object. A tapered solid written from two rings, a mark
 * on its near face, and one length the pointer's height sets.
 */
const {
  Cam, clamp, circ, disposer, facing, fit, hull, mk, open, pointer, poly,
  proj, put, register, ringAt, rrect, run, solid, spring, stepS,
} = HL;

const RF = 10, RT = 7, H = 34;               // body: foot radius, top radius, height (1:1.7)
const FIN = { out: 12, half: 4.5, thick: 1, h: 14, r: 0.9, lean: 0.8 };
const FL0 = 8, FL1 = 12;                     // flame: idle length, and thrust's share
let LIFT = 3.4; const REST = 0.2;                // full rise above the fins, and the idle thrust
const WR = 3.8, WZ = 0.58;                   // window radius, and its height up the body
const AZ = Math.SQRT1_2;                     // sin and cos of the camera's 45°

/** A tapered solid: a foot ring at z0, a top ring at z1, and the lid's crease. */
const stand = (P, front, foot, top, z0, z1, lid) => ({
  sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))),
  crease: lid ? open(ringAt(P, run(lid, front), z1)) : "",
});

/** A ring built in a turned frame, centred at (cx, cy), its first axis along (ux, uy). */
const turn = (ring, cx, cy, ux, uy) => ring.map((q) => ({
  u: cx + q.u * ux - q.v * uy,
  v: cy + q.u * uy + q.v * ux,
  nu: 0,
  nv: 0,
}));

/** A fin's footprint: a thin plate along the screen's horizontal, tapered at the outer top. */
function finRing(sgn, top) {
  const a = top ? (sgn > 0 ? [-FIN.half, FIN.lean] : [-FIN.lean, FIN.half]) : [-FIN.half, FIN.half];
  const b = top ? FIN.thick * 0.65 : FIN.thick;
  return turn(
    rrect(a[0], -b, a[1], b, FIN.r, 5),
    sgn * FIN.out * AZ, -sgn * FIN.out * AZ, AZ, -AZ,
  );
}

function mount({ stage, svg, read }) {
  const bag = disposer();
  const C = Cam(45, 0.5, 5.6);
  const P = proj(C), front = facing(C);

  const foot = rrect(-RF, -RF, RF, RF, RF, 14);     // a full round: rrect cuts r to half a side
  const top = rrect(-RT, -RT, RT, RT, RT, 14);
  const lid = rrect(-(RT - 1.4), -(RT - 1.4), RT - 1.4, RT - 1.4, RT - 1.4, 14);
  const jet = circ(5.5, 32), tip = circ(0.9, 24);

  const g = mk("g", {}, svg);
  const flame = solid(g);
  flame.sil.classList.add("hi");
  const finL = solid(g), finR = solid(g), body = solid(g);
  const mark = mk("path", { class: "nf" }, g);

  // Centre the most extreme pose: full lift, full flame, fins at their top.
  const fp = [];
  const add = (ring, z) => ring.forEach((q) => fp.push([q.u, q.v, z]));
  add(foot, 0); add(top, LIFT + H);
  add(jet, 0); add(tip, -FL0 - FL1);
  [-1, 1].forEach((s) => { add(finRing(s, false), 0); add(finRing(s, true), LIFT + FIN.h); });
  fit(C, fp, 200, 160);

  let drawn = NaN;
  const thr = spring(REST);

  function draw(t) {
    const lift = LIFT * clamp((t - REST) / (1 - REST), 0, 1);
    const fl = FL0 + FL1 * t;
    put(flame, stand(P, front, tip, jet, lift - fl, lift, null));
    put(finL, stand(P, front, finRing(-1, false), finRing(-1, true), lift, lift + FIN.h, null));
    put(finR, stand(P, front, finRing(1, false), finRing(1, true), lift, lift + FIN.h, null));
    put(body, stand(P, front, foot, top, lift, lift + H, lid));

    // The window: a ring on the body's near face, at the taper's radius there.
    const wr = RF + (RT - RF) * WZ, wz = lift + H * WZ, w = [];
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * Math.PI * 2, ca = Math.cos(a) * WR * AZ, sa = Math.sin(a) * WR;
      w.push(P(AZ * wr + ca, AZ * wr - ca, wz + sa));
    }
    mark.setAttribute("d", poly(w));
  }

  const B = register(stage, (dt) => {
    const moving = stepS(thr, dt);
    if (thr.x !== drawn) { drawn = thr.x; draw(thr.x); }
    return moving;
  });
  bag.add(B.unregister);

  function setTarget(y) {
    const v = clamp((268 - y) / 200, 0, 1);
    thr.t = v;
    read.textContent = `thrust ${v.toFixed(2)}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => setTarget(p[1]),
    leave: () => { thr.t = REST; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { LIFT = v; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rocket",
  means: "Raising the pointer feeds the flame: it lengthens and the rocket lifts.",
  rules: [1, 3, 4, 5, 9],
  range: [2, 3.4, 5],
  tour: [[200, 252], [200, 186], [200, 118], null],
  mount,
});

