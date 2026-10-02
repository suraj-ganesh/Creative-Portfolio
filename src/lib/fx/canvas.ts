import {
  gsap,
  Draggable,
  DUR,
  prefersReduced,
  q,
  qa,
  type Cleanup,
  noopCleanup,
} from "@/lib/fx/core";

/**
 * Archive-page infinite canvas.
 *
 * Legacy `initInfiniteCanvas` renders the `[data-canvas-img]` media pool as
 * planes in a full THREE.js WebGL scene (chunked infinite scroll, focus
 * transitions, breathing, bend, raycast hover). That engine is out of scope
 * for the native port, so this module preserves the interaction contract —
 * source images become draggable cards with Draggable + inertia, generous
 * bounds, and z-order promotion on grab — as a 2D DOM field instead.
 *
 * Source `<img data-canvas-img>` nodes are never moved; cards are clones.
 * Cleanup/destroy removes every created node and clears leftover props, so
 * the DOM is restored exactly.
 */

const activeWraps = new WeakSet<HTMLElement>();
const destroyers = new Set<() => void>();

/** Destroy every live infinite-canvas instance (legacy `destroyInfiniteCanvas`). */
export function destroyInfiniteCanvas(): void {
  Array.from(destroyers).forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore teardown errors */
    }
  });
  destroyers.clear();
}

function hashSeed(s: string): number {
  let h = 2166132811;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initInfiniteCanvas(scope: ParentNode = document): Cleanup {
  const wrap =
    scope instanceof Element && scope.matches("[data-infinite-canvas]")
      ? (scope as HTMLElement)
      : q<HTMLElement>("[data-infinite-canvas]", scope);
  if (!wrap || activeWraps.has(wrap)) return noopCleanup;

  const sources = qa<HTMLImageElement>("[data-canvas-img]", scope);
  if (!sources.length) return noopCleanup;

  const heading = q<HTMLElement>("[data-infinite-canvas-h]", scope);
  const reduced = prefersReduced();

  activeWraps.add(wrap);

  const wrapRect = wrap.getBoundingClientRect();
  const wrapW = Math.max(wrapRect.width, 1);
  const wrapH = Math.max(wrapRect.height, 1);

  // Deterministic scattered collage (seeded like the legacy chunk hashes).
  const count = sources.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const baseCardW = Math.min(Math.max(wrapW * 0.2, 160), 300);
  const stepX = Math.min(wrapW / Math.max(cols, 1), baseCardW * 1.35);
  const stepY = Math.min(wrapH / Math.max(rows, 1), baseCardW * 1.1);

  const cards: HTMLElement[] = [];
  const drags: Draggable[] = [];
  const ratioFixups: { img: HTMLImageElement; onLoad: () => void }[] = [];
  let topZ = count + 1;
  let dead = false;

  sources.forEach((src, i) => {
    const rand = mulberry32(hashSeed(`${src.currentSrc || src.src}|${i}`));
    const col = i % cols;
    const row = Math.floor(i / cols);
    const w = baseCardW * (0.85 + rand() * 0.3);
    const cx =
      wrapW / 2 +
      (col - (cols - 1) / 2) * stepX +
      (rand() - 0.5) * stepX * 0.5;
    const cy =
      wrapH / 2 +
      (row - (rows - 1) / 2) * stepY +
      (rand() - 0.5) * stepY * 0.5;
    const tilt = (rand() - 0.5) * 12;

    const card = document.createElement("div");
    card.setAttribute("data-canvas-card", "");
    card.style.position = "absolute";
    card.style.left = `${cx - w / 2}px`;
    card.style.top = `${cy - w / 4}px`;
    card.style.width = `${w}px`;
    card.style.aspectRatio = "4 / 3";
    card.style.overflow = "hidden";
    card.style.cursor = "grab";
    card.style.userSelect = "none";
    card.style.touchAction = "none";
    card.style.willChange = "transform";
    card.style.zIndex = String(i + 1);

    const img = src.cloneNode(false) as HTMLImageElement;
    img.draggable = false;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.display = "block";
    img.style.pointerEvents = "none";
    card.appendChild(img);

    const applyRatio = () => {
      if (dead) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (nw > 0 && nh > 0) card.style.aspectRatio = `${nw} / ${nh}`;
    };
    if (img.complete && img.naturalWidth > 0) applyRatio();
    else {
      img.addEventListener("load", applyRatio);
      ratioFixups.push({ img, onLoad: applyRatio });
    }

    wrap.appendChild(card);
    cards.push(card);

    if (!reduced) {
      gsap.set(card, { rotation: tilt });
      const left = cx - w / 2;
      const top = cy - w / 4;
      const created = Draggable.create(card, {
        type: "x,y",
        inertia: true,
        bounds: {
          minX: -left - 48,
          maxX: wrapW - left + 48,
          minY: -top - 48,
          maxY: wrapH - top + 48,
        },
        onPress: function (this: Draggable) {
          topZ += 1;
          (this.target as HTMLElement).style.zIndex = String(topZ);
          (this.target as HTMLElement).style.cursor = "grabbing";
        },
        onRelease: function (this: Draggable) {
          (this.target as HTMLElement).style.cursor = "grab";
        },
      });
      if (created[0]) drags.push(created[0]);
    }
  });

  if (heading && !reduced) {
    gsap.from(heading, {
      autoAlpha: 0,
      y: 24,
      duration: DUR.M,
      ease: "Out",
      overwrite: "auto",
    });
  }

  if (!reduced && cards.length > 0) {
    gsap.from(cards, {
      autoAlpha: 0,
      scale: 0.85,
      y: 40,
      duration: DUR.M,
      ease: "Out",
      stagger: 0.06,
      overwrite: "auto",
    });
  }

  const destroy = () => {
    if (dead) return;
    dead = true;
    destroyers.delete(destroy);
    activeWraps.delete(wrap);
    drags.forEach((d) => d.kill());
    drags.length = 0;
    gsap.killTweensOf(cards);
    ratioFixups.forEach(({ img, onLoad }) =>
      img.removeEventListener("load", onLoad),
    );
    ratioFixups.length = 0;
    cards.forEach((card) => card.remove());
    cards.length = 0;
    if (heading) {
      gsap.killTweensOf(heading);
      gsap.set(heading, { clearProps: "all" });
    }
  };
  destroyers.add(destroy);
  return destroy;
}
