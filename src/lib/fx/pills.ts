import { prefersReduced, qa, type Cleanup, noopCleanup } from "@/lib/fx/core";

/**
 * Contact-pill physics ([data-contact-pills] > .cg-pill), cloned from the
 * working mechanism of gopherproductions.com's contact section:
 *
 * - Pills are plain <a> elements positioned by client JS (no SSR pose).
 * - A tiny built-in 2D engine drops each pill under randomized gravity
 *   (random spawn, drift, spin, timing — a different fall every load).
 * - The wordmark letters are measured per-glyph (Range API) and act as
 *   SOLID static colliders: each pill bounces off the cap-top of the
 *   letter beneath it and settles there with a wobble.
 * - Pills are pointer-draggable: grab, fling with momentum, they rejoin
 *   the simulation on release. A moved drag suppresses the click-through.
 * - Hover invert + lift is pure CSS on an inner span (JS owns the outer
 *   transform, so the two never fight).
 *
 * No-op when hooks are absent. Teardown stops the loop and listeners.
 */

interface PillBody {
  el: HTMLElement;
  w: number;
  h: number;
  tilt: number;
  restX: number;
  restY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  e: number;
  bounces: number;
  settling: boolean;
  awake: boolean;
  startAt: number;
  grabbed: boolean;
  dragDist: number;
  lastPX: number;
  lastPY: number;
  lastPT: number;
  offX: number;
  offY: number;
  row: number;
}

const TILTS = [-20, -7, 4, 13, 24, -14, 8, 18];
const GRAVITY = 2600;
const MAX_FALL = 2400;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Metrics {
  fieldW: number;
  fieldH: number;
  letters: Array<{ l: number; r: number; top: number }>;
  nameTop: number;
  nameH: number;
}

function measureLetters(nameEl: HTMLElement): Metrics["letters"] {
  // NOTE: only left/right come from ranges. Tops MUST NOT be read from
  // getClientRects here: the goo reveal holds split lines translated
  // down ~110% at init, which would sink every floor a full line into
  // the glyphs. Cap tops are derived from the host box (never
  // transformed) + computed font size in layout() below.
  const boxes: Array<{ l: number; r: number; top: number }> = [];
  const walker = document.createTreeWalker(nameEl, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n = walker.nextNode();
  while (n) {
    if (n.textContent && n.textContent.length) nodes.push(n as Text);
    n = walker.nextNode();
  }
  const range = document.createRange();
  for (const node of nodes) {
    const len = node.data.length;
    for (let i = 0; i < len; i++) {
      const ch = node.data[i];
      if (ch === " " || ch === "\n") continue;
      try {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getClientRects()[0];
        if (r && r.width > 0) boxes.push({ l: r.left, r: r.right, top: r.top });
      } catch {
        /* ignore */
      }
    }
  }
  range.detach?.();
  return boxes;
}

export function initContactPills(scope: ParentNode = document): Cleanup {
  const fields = qa<HTMLElement>("[data-contact-pills]", scope);
  if (!fields.length) return noopCleanup;
  const pills: HTMLElement[] = [];
  fields.forEach((f) => {
    f.querySelectorAll<HTMLElement>(":scope > .cg-pill").forEach((p) => pills.push(p));
  });
  if (!pills.length) return noopCleanup;

  // NOTE: no mobile early-out — the fall/bounce/settle loop runs on phones
  // too by request. transform-only paints keep it cheap; drag-on-touch may
  // yield to page scroll (touch-action), taps still open links.
  const nameEl = (
    scope instanceof Document
      ? scope.querySelector(".cg-name.is-cut")
      : ((scope as Element).querySelector?.(".cg-name.is-cut") ?? null)
  ) as HTMLElement | null;

  const bodies: PillBody[] = pills.map((el, i) => ({
    el,
    w: 0,
    h: 0,
    tilt: TILTS[i % TILTS.length],
    restX: 0,
    restY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    va: 0,
    e: 0.42,
    bounces: 0,
    settling: false,
    awake: false,
    startAt: 0,
    grabbed: false,
    dragDist: 0,
    lastPX: 0,
    lastPY: 0,
    lastPT: 0,
    offX: 0,
    offY: 0,
    row: 0,
  }));

  let raf = 0;
  let running = false;
  let dead = false;
  let metrics: Metrics = { fieldW: 0, fieldH: 0, letters: [], nameTop: 0, nameH: 0 };
  const field = fields[0];

  const floorY = (cx: number): number => {
    const { letters, nameTop, nameH } = metrics;
    let best = Infinity;
    for (const b of letters) {
      if (cx >= b.l - 2 && cx <= b.r + 2 && b.top < best) best = b.top;
    }
    // Gaps between letters nestle slightly deeper, like the reference.
    if (!Number.isFinite(best)) best = nameTop + nameH * 0.38;
    return best;
  };

  const layout = () => {
    const fr = field.getBoundingClientRect();
    const letters = nameEl ? measureLetters(nameEl) : [];
    const nr = nameEl?.getBoundingClientRect();
    // Uniform cap-top from the host box + font size — immune to the
    // reveal transforms shifting the inner lines (see note above).
    const fs = nameEl ? parseFloat(getComputedStyle(nameEl).fontSize) || 16 : 16;
    const capTop = nr ? nr.top - fr.top + fs * 0.08 : fr.height;
    metrics = {
      fieldW: fr.width,
      fieldH: fr.height,
      letters: letters.map((b) => ({
        l: b.l - fr.left,
        r: b.r - fr.left,
        top: capTop,
      })),
      nameTop: nr ? nr.top - fr.top : fr.height,
      nameH: nr ? nr.height : 0,
    };
    const n = bodies.length;
    const narrow = metrics.fieldW < 640;
    // Pass 1: measure + spread rest X across the wordmark.
    bodies.forEach((b, i) => {
      b.w = b.el.offsetWidth || 120;
      b.h = b.el.offsetHeight || 44;
      b.row = narrow && i % 2 === 1 ? 1 : 0;
      const frac = n === 1 ? 0.5 : 0.06 + (0.88 * i) / (n - 1);
      b.restX = Math.min(
        Math.max(frac * metrics.fieldW - b.w / 2 + rand(-26, 26), 4),
        Math.max(4, metrics.fieldW - b.w - 4),
      );
    });
    // Pass 2: de-overlap rest poses per row (rotated extents + gap), so
    // settled pills never touch each other. Two sweeps converge.
    const halfExt = (b: PillBody) => {
      const t = (b.tilt * Math.PI) / 180;
      return (b.w * Math.abs(Math.cos(t)) + b.h * Math.abs(Math.sin(t))) / 2;
    };
    const GAP = 10;
    for (let pass = 0; pass < 2; pass++) {
      for (let r = 0; r <= 1; r++) {
        const group = bodies
          .filter((b) => b.row === r)
          .sort((p, q) => p.restX - q.restX);
        if (!group.length) continue;
        for (let k = 1; k < group.length; k++) {
          const prev = group[k - 1];
          const cur = group[k];
          const prevC = prev.restX + prev.w / 2;
          const minC = prevC + halfExt(prev) + halfExt(cur) + GAP;
          const curC = cur.restX + cur.w / 2;
          if (curC < minC) cur.restX += minC - curC;
        }
        const last = group[group.length - 1];
        const overflow = last.restX + last.w / 2 + halfExt(last) - (metrics.fieldW - 4);
        if (overflow > 0) {
          const first = group[0];
          const shift = Math.min(overflow, first.restX + first.w / 2 - halfExt(first) - 4);
          if (shift > 0) group.forEach((b) => (b.restX -= shift));
        }
      }
    }
    // Pass 3: rest Y from the letter floors at the final centers.
    bodies.forEach((b) => {
      const rowLift = b.row === 1 ? b.h + 14 : 0;
      const cx = b.restX + b.w / 2;
      b.restY = floorY(cx) - b.h - rowLift;
      if (!b.awake && !b.grabbed) {
        b.x = b.restX;
        b.y = b.restY;
        b.angle = b.tilt;
        paint(b);
      }
    });
  };

  const paint = (b: PillBody) => {
    b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.angle.toFixed(2)}deg)`;
  };

  const spawn = (b: PillBody, i: number, t0: number) => {
    const vh = window.innerHeight || 800;
    // Spawned fully on-screen horizontally; only the fall starts above.
    b.x = Math.min(
      Math.max(b.restX + rand(-200, 200), 0),
      Math.max(0, metrics.fieldW - b.w),
    );
    b.y = b.restY - (vh * rand(0.75, 1.05) + i * 40);
    b.vx = rand(-140, 140);
    b.vy = rand(-60, 60);
    b.angle = b.tilt + (i % 2 === 0 ? rand(40, 110) : -rand(40, 110));
    b.va = rand(-3, 3);
    b.e = rand(0.3, 0.42);
    b.bounces = 0;
    b.settling = false;
    b.awake = true;
    b.startAt = t0 + 1600 + i * 100 + rand(0, 500);
    b.el.style.opacity = "0";
    paint(b);
  };

  const step = (b: PillBody, dt: number) => {
    if (b.grabbed) return;
    if (b.settling) {
      // Exponential settle into the resting tilt — no visible snap.
      const k = Math.min(1, 10 * dt);
      let d = (b.tilt - b.angle + 540) % 360 - 180;
      b.angle += d * k;
      b.vx *= Math.max(0, 1 - 8 * dt);
      b.x += b.vx * dt;
      b.y += (b.restY - b.y) * Math.min(1, 12 * dt);
      if (Math.abs(d) < 0.4 && Math.abs(b.vx) < 12) {
        b.angle = b.tilt;
        b.vx = 0;
        b.x = Math.abs(b.x - b.restX) < 2 ? b.restX : b.x;
        b.y = b.restY;
        b.awake = false;
        b.settling = false;
      }
      paint(b);
      return;
    }
    b.vy = Math.min(b.vy + GRAVITY * dt, MAX_FALL);
    b.vx *= Math.max(0, 1 - 0.12 * dt);
    b.va *= Math.pow(0.5, dt);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.va * dt;
    // Collide with the letter tops (solid structures).
    const fl = floorY(b.x + b.w / 2);
    if (b.y + b.h >= fl && b.vy > 0) {
      b.y = fl - b.h;
      b.vy = -b.vy * b.e;
      b.vx *= 0.82;
      b.va = b.va * 0.35 + (Math.random() - 0.5) * 1.6;
      b.bounces += 1;
      if (b.bounces >= 3 && Math.abs(b.vy) < 220) {
        b.vy = 0;
        b.settling = true;
      }
    }
    // Never leave the field sideways.
    if (b.x < -b.w * 0.6) {
      b.x = -b.w * 0.6;
      b.vx = Math.abs(b.vx) * 0.5;
    } else if (b.x > metrics.fieldW - b.w * 0.4) {
      b.x = metrics.fieldW - b.w * 0.4;
      b.vx = -Math.abs(b.vx) * 0.5;
    }
    // Never exit through the top after a hard bounce (spawn itself
    // legitimately starts above this line, so only clamp post-impact).
    if (b.bounces > 0) {
      const topLimit = -(window.innerHeight || 800) * 0.35;
      if (b.y < topLimit) {
        b.y = topLimit;
        b.vy = Math.abs(b.vy) * 0.4;
      }
    }
    paint(b);
  };

  // Mid-air pill-vs-pill deflection (asleep/settling pills count as
  // static bodies: the mover takes the full push). Keeps falling pills
  // from passing through each other; rest poses are already separated.
  const collidePairs = (now: number) => {
    const n = bodies.length;
    const deflect = (
      a: PillBody,
      c: PillBody,
      s: number,
      overlap: number,
      cStatic: boolean,
      axis: "x" | "y",
    ) => {
      if (cStatic) {
        if (axis === "x") a.x -= s * (overlap + 0.5);
        else a.y -= s * (overlap + 0.5);
        const rv = (axis === "x" ? a.vx : a.vy) * s;
        if (rv > 0) {
          if (axis === "x") a.vx -= s * rv * 1.4;
          else a.vy -= s * rv * 1.4;
        }
      } else {
        const push = overlap / 2 + 0.25;
        if (axis === "x") {
          a.x -= s * push;
          c.x += s * push;
        } else {
          a.y -= s * push;
          c.y += s * push;
        }
        const rav = axis === "x" ? a.vx : a.vy;
        const rcv = axis === "x" ? c.vx : c.vy;
        const rvn = (rav - rcv) * s;
        if (rvn > 0) {
          const imp = rvn * 0.675;
          if (axis === "x") {
            a.vx -= s * imp;
            c.vx += s * imp;
          } else {
            a.vy -= s * imp;
            c.vy += s * imp;
          }
        }
      }
      a.va += (Math.random() - 0.5) * 0.9;
      if (!cStatic) c.va += (Math.random() - 0.5) * 0.9;
      paint(a);
      paint(c);
    };
    for (let i = 0; i < n; i++) {
      const a = bodies[i];
      if (!a.awake || a.grabbed || a.settling || now < a.startAt) continue;
      for (let j = i + 1; j < n; j++) {
        const c = bodies[j];
        if (c.grabbed || now < c.startAt) continue;
        const cStatic = !c.awake || c.settling;
        const ox =
          (a.w + c.w) / 2 - Math.abs(a.x + a.w / 2 - (c.x + c.w / 2));
        const oy =
          (a.h + c.h) / 2 - Math.abs(a.y + a.h / 2 - (c.y + c.h / 2));
        if (ox <= 0 || oy <= 0) continue;
        if (ox < oy) {
          deflect(a, c, a.x + a.w / 2 < c.x + c.w / 2 ? 1 : -1, ox, cStatic, "x");
        } else {
          deflect(a, c, a.y + a.h / 2 < c.y + c.h / 2 ? 1 : -1, oy, cStatic, "y");
        }
      }
    }
  };

  const loop = () => {
    if (dead) return;
    const now = performance.now();
    let alive = false;
    for (const b of bodies) {
      if (!b.awake) continue;
      if (now < b.startAt) {
        alive = true;
        continue;
      }
      if (b.el.style.opacity !== "1") b.el.style.opacity = "1";
      step(b, 1 / 60);
      if (b.awake) alive = true;
    }
    collidePairs(now);
    if (alive) {
      raf = requestAnimationFrame(loop);
    } else {
      running = false;
    }
  };
  const kick = () => {
    if (!running && !dead) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  };

  const toLocal = (clientX: number, clientY: number) => {
    const fr = field.getBoundingClientRect();
    return { x: clientX - fr.left, y: clientY - fr.top };
  };

  const onMove = (e: PointerEvent) => {
    const b = bodies.find((v) => v.grabbed);
    if (!b) return;
    const p = toLocal(e.clientX, e.clientY);
    const now = performance.now();
    const dt = Math.max((now - b.lastPT) / 1000, 0.008);
    // Drag target clamped to the field so pills can't leave the screen.
    const tx = Math.min(
      Math.max(p.x - b.offX, -b.w * 0.5),
      Math.max(-b.w * 0.5, metrics.fieldW - b.w * 0.5),
    );
    const ty = Math.min(
      Math.max(p.y - b.offY, -(window.innerHeight || 800) * 0.5),
      metrics.fieldH + 120,
    );
    const nvx = ((tx - b.x) / dt + b.vx * 2) / 3;
    const nvy = ((ty - b.y) / dt + b.vy * 2) / 3;
    b.dragDist += Math.hypot(tx - b.lastPX, ty - b.lastPY);
    b.lastPX = tx;
    b.lastPY = ty;
    b.lastPT = now;
    // Weighty follow + lean into the motion.
    b.x += (tx - b.x) * 0.45;
    b.y += (ty - b.y) * 0.45;
    b.vx = Math.max(-1400, Math.min(1400, nvx));
    b.vy = Math.max(-1400, Math.min(1400, nvy));
    b.angle = b.tilt + Math.max(-0.4, Math.min(0.4, b.vx * 0.0004));
    paint(b);
  };
  const onUp = () => {
    const b = bodies.find((v) => v.grabbed);
    if (!b) return;
    b.grabbed = false;
    b.el.style.zIndex = "";
    // Throw with momentum, rejoin the simulation.
    b.va = Math.max(-3, Math.min(3, b.vx * 0.003));
    b.bounces = 0;
    b.settling = false;
    b.awake = true;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    kick();
  };

  const downs: Array<(e: PointerEvent) => void> = [];
  const clicks: Array<(e: MouseEvent) => void> = [];
  bodies.forEach((b) => {
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      const p = toLocal(e.clientX, e.clientY);
      b.grabbed = true;
      b.awake = true;
      b.settling = false;
      b.dragDist = 0;
      b.offX = p.x - b.x;
      b.offY = p.y - b.y;
      b.lastPX = b.x;
      b.lastPY = b.y;
      b.lastPT = performance.now();
      b.el.style.zIndex = "5";
      try {
        b.el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      kick();
    };
    const click = (e: MouseEvent) => {
      if (b.dragDist > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
      b.dragDist = 0;
    };
    b.el.addEventListener("pointerdown", down);
    b.el.addEventListener("click", click, true);
    downs.push(down);
    clicks.push(click);
  });

  let rT = 0;
  const onResize = () => {
    window.clearTimeout(rT);
    rT = window.setTimeout(() => {
      if (!dead) layout();
    }, 250);
  };
  window.addEventListener("resize", onResize);
  let fontsDone = false;
  const onFonts = () => {
    if (!fontsDone) {
      fontsDone = true;
      if (!dead) layout();
    }
  };
  try {
    document.fonts?.ready.then(onFonts).catch(() => {});
  } catch {
    /* ignore */
  }

  if (prefersReduced()) {
    layout();
    bodies.forEach((b) => {
      b.el.style.opacity = "1";
    });
    return () => {
      window.removeEventListener("resize", onResize);
      bodies.forEach((b, i) => {
        b.el.removeEventListener("pointerdown", downs[i]);
        b.el.removeEventListener("click", clicks[i], true);
      });
    };
  }

  layout();
  const t0 = performance.now();
  bodies.forEach((b, i) => spawn(b, i, t0));
  kick();

  return () => {
    dead = true;
    if (running) cancelAnimationFrame(raf);
    running = false;
    window.clearTimeout(rT);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    bodies.forEach((b, i) => {
      b.el.removeEventListener("pointerdown", downs[i]);
      b.el.removeEventListener("click", clicks[i], true);
    });
  };
}
