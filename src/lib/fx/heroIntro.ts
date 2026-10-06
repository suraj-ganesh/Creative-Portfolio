import { gsap, ScrollTrigger, SplitText, qa, q } from "@/lib/fx/core";
import {
  animateLogoGoo,
  playLogoMorph,
  CLIP_DIRS,
} from "@/lib/fx/reveal";

/**
 * Hero-intro master timeline — the strictly serial entrance played on
 * every home visit after loading completes:
 *
 *   1. logo morphs (goo blob -> mark, plus rect -> path morph when the
 *      fallback mark is in use)
 *   2. the vertical divider lines draw top -> bottom
 *   3. "Suraj Ganesh" rises
 *   4. the "Video Editor & Colorist" role line rises
 *   5. the remaining hero texts (Edit / Cinematic / bio / motto) cascade
 *   6. the menu flies in
 *   7. the theme lever fades in
 *
 * Each phase starts only after the previous one ends (single timeline,
 * sequential positions). Companion wiring in lib/fx/reveal.ts stages
 * [data-intro-step] elements hidden without auto triggers on home, so
 * this timeline is the only driver — nothing can appear all at once.
 */

const CLIP_ATTR: Record<string, string> = {
  "clip-down": "top-down",
  "clip-left": "left-right",
  "clip-right": "right-left",
  "clip-top": "down-top",
};

let active: gsap.core.Timeline | null = null;
let safetyTimer = 0;

export function killHeroIntro(): void {
  try {
    active?.kill();
  } catch {
    /* ignore */
  }
  active = null;
  if (safetyTimer) {
    try {
      window.clearTimeout(safetyTimer);
    } catch {
      /* ignore */
    }
    safetyTimer = 0;
  }
}

function steps(n: number): HTMLElement[] {
  return qa<HTMLElement>(`[data-intro-step="${n}"]`);
}

/** Split a staged text host and rise its lines with the blur-morph feel. */
function textSub(host: HTMLElement, dur: number): gsap.core.Timeline {
  const sub = gsap.timeline();
  const split = new SplitText(host, {
    type: "lines",
    linesClass: "split-line",
    mask: "lines",
  });
  const lines = (split.lines ?? []) as HTMLElement[];
  sub.set(host, {
    autoAlpha: 1,
    visibility: "visible",
    filter: "url(#text-goo)",
  });
  if (lines.length) {
    sub.fromTo(
      lines,
      {
        yPercent: 110,
        filter: "blur(16px)",
        scaleY: 1.35,
        transformOrigin: "50% 100%",
      },
      {
        yPercent: 0,
        filter: "blur(0px)",
        scaleY: 1,
        duration: dur,
        stagger: 0.08,
        ease: "power4.out",
      },
      0,
    );
  }
  return sub;
}

/** Add sub-timelines starting at `pos + i * gap` (internal flow), and
 *  return the end of the longest one so the next phase starts strictly
 *  after this one finishes. */
function addStaggered(
  tl: gsap.core.Timeline,
  subs: gsap.core.Timeline[],
  gap: number,
): void {
  const start = tl.duration();
  subs.forEach((sub, i) => tl.add(sub, start + i * gap));
}

/** Instantly reveal every staged intro element to its final state.
 *  Safety net: called on any failure (or a stalled master) so content
 *  can never strand hidden. */
export function revealHeroInstant(): void {
  killHeroIntro();
  try {
    // Reduced motion: everything to its final state, no animation.
    qa<HTMLElement>("[data-intro-step]").forEach((el) => {
    gsap.set(el, {
      visibility: "visible",
      autoAlpha: 1,
      opacity: 1,
      y: 0,
      yPercent: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      filter: "none",
      clipPath: "inset(0% 0% 0% 0%)",
      clearProps: "transform",
    });
  });
  const path = document.querySelector<HTMLElement>("[data-morph-final]");
  if (path) {
    const final =
      path.dataset.morphFinal || path.getAttribute("d") || undefined;
    if (final) gsap.set(path, { attr: { d: final } });
  }
  const navGrid = q<HTMLElement>('[data-nav="grid"]');
  const navButton = q<HTMLElement>('[data-nav="button"]');
  if (navGrid) gsap.set(navGrid, { visibility: "visible", x: 0, y: 0 });
  if (navButton) gsap.set(navButton, { visibility: "visible", x: 0, y: 0 });
  } catch {
    /* instant reveal must never throw */
  }
}

export function playHeroIntro(): void {
  if (typeof window === "undefined") return;
  killHeroIntro();

  // NOTE: no prefers-reduced-motion early-out here on purpose. The rest
  // of the site (core.prefersReduced) animates unconditionally for legacy
  // parity, and the staged hero must always play its entrance — otherwise
  // the initial animations silently disappear for anyone with the OS
  // "animation effects" toggle off. revealHeroInstant stays available
  // purely as the failure/stall fallback below.
  try {
    playSerial();
  } catch (err) {
    console.error("[fx] hero intro failed, revealing instantly:", err);
    revealHeroInstant();
  }
}

function playSerial(): void {
  const logoEls = steps(1);
  if (!logoEls.length) return;

  const lineEls = steps(2);
  const nameEls = steps(3);
  const roleEls = steps(4);
  const otherEls = steps(5);
  const leverEls = steps(7);
  const navGrid = q<HTMLElement>('[data-nav="grid"]');
  const navButton = q<HTMLElement>('[data-nav="button"]');

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      try {
        qa<HTMLElement>("[data-intro-step]").forEach((el) =>
          gsap.set(el, { clearProps: "filter" }),
        );
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
      if (active === tl) active = null;
      if (safetyTimer) {
        try {
          window.clearTimeout(safetyTimer);
        } catch {
          /* ignore */
        }
        safetyTimer = 0;
      }
    },
  });
  active = tl;

  // Shared text-goo melt across the name/role/other phases (one tween —
  // per-group tweens would fight over the shared filter deviation).
  const gooBlur = document.getElementById(
    "text-goo-blur",
  ) as unknown as SVGElement | null;
  if (gooBlur) tl.set(gooBlur, { attr: { stdDeviation: 10 } }, 0);

  // 1 — logo morphs: goo blob wobble + rect->path morph in parallel.
  logoEls.forEach((wrap) => {
    const goo = animateLogoGoo(wrap, "reveal", 0);
    if (goo) {
      goo.timeScale(1.35);
      tl.add(goo, 0);
    }
    const path = wrap.querySelector<HTMLElement>("[data-morph-final]");
    if (path) {
      const final =
        path.dataset.morphFinal || path.getAttribute("d") || undefined;
      if (final) tl.add(playLogoMorph(wrap, path, final, 0.6, 0.8), 0);
    }
  });

  // 2 — divider lines draw top -> bottom.
  addStaggered(
    tl,
    lineEls.map((el) => {
      const dir =
        CLIP_DIRS[CLIP_ATTR[el.getAttribute("data-reveal") ?? ""] ?? ""];
      const sub = gsap.timeline();
      if (dir) {
        sub.set(el, {
          visibility: "visible",
          clipPath: dir.hidden,
          webkitClipPath: dir.hidden,
        });
        sub.to(el, {
          clipPath: dir.visible,
          webkitClipPath: dir.visible,
          duration: 0.6,
          ease: "power2.inOut",
        });
      } else {
        sub.set(el, { visibility: "visible", autoAlpha: 1 });
      }
      return sub;
    }),
    0.15,
  );

  // 3 — "Suraj Ganesh".
  const nameStart = tl.duration();
  addStaggered(
    tl,
    nameEls.map((el) => textSub(el, 0.55)),
    0.12,
  );

  // 4 — role line.
  roleEls.forEach((el) => {
    const sub = gsap.timeline();
    sub.fromTo(
      el,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
    tl.add(sub, tl.duration());
  });

  // 5 — remaining hero texts cascade.
  addStaggered(
    tl,
    otherEls.map((el) => textSub(el, 0.55)),
    0.08,
  );
  const othersEnd = tl.duration();
  if (gooBlur && othersEnd > nameStart) {
    tl.to(
      gooBlur,
      {
        attr: { stdDeviation: 0 },
        duration: othersEnd - nameStart,
        ease: "power2.inOut",
      },
      nameStart,
    );
  }

  // 6 — menu flies in.
  const navTargets = [navGrid, navButton].filter(
    (el): el is HTMLElement => el !== null,
  );
  if (navTargets.length) {
    tl.to(
      navTargets,
      { x: 0, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 },
      tl.duration(),
    );
  }

  // 7 — lever fades in last.
  leverEls.forEach((el) => {
    const sub = gsap.timeline();
    sub.fromTo(
      el,
      { autoAlpha: 0, filter: "blur(20px)" },
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power2.out",
      },
    );
    tl.add(sub, tl.duration());
  });

  tl.play();
  // Safety: if the master ever stalls (backgrounded tab, killed tween),
  // never strand hidden content — reveal instantly instead.
  if (safetyTimer) {
    try {
      window.clearTimeout(safetyTimer);
    } catch {
      /* ignore */
    }
  }
  safetyTimer = window.setTimeout(() => {
    safetyTimer = 0;
    if (active === tl) {
      console.error("[fx] hero intro stalled, revealing instantly");
      revealHeroInstant();
    }
  }, 14000);
}
