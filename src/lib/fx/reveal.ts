import {
  gsap,
  ScrollTrigger,
  SplitText,
  DUR,
  prefersReduced,
  qa,
  type Cleanup,
} from "@/lib/fx/core";

/* ------------------------------------------------------------------ */
/* Ownership tracking                                                  */
/* ------------------------------------------------------------------ */

const liveTriggers = new Set<ScrollTrigger>();
const liveTweens = new Set<{ kill(): void }>();
const liveCleanups = new Set<Cleanup>();
const liveSplits = new Set<SplitText>();

function trackST(st: ScrollTrigger | undefined | null): void {
  if (st) liveTriggers.add(st);
}

function trackTw<T extends { kill(): void }>(tw: T): T {
  liveTweens.add(tw);
  return tw;
}

function trackCleanup(fn: Cleanup): void {
  liveCleanups.add(fn);
}

function trackSplit(sp: SplitText): SplitText {
  liveSplits.add(sp);
  return sp;
}

/** Global kill: reverses splits, kills every ScrollTrigger/tween owned by
 *  this module, runs listener cleanups. Safe to call when idle. */
export function killReveals(): void {
  liveTriggers.forEach((st) => st.kill());
  liveTriggers.clear();
  liveTweens.forEach((tw) => {
    try {
      tw.kill();
    } catch {
      /* noop */
    }
  });
  liveTweens.clear();
  liveCleanups.forEach((fn) => {
    try {
      fn();
    } catch {
      /* noop */
    }
  });
  liveCleanups.clear();
  liveSplits.forEach((sp) => {
    try {
      sp.revert();
    } catch {
      /* noop */
    }
  });
  liveSplits.clear();
  window.removeEventListener("load", onWindowLoadRefresh);
}

function onWindowLoadRefresh(): void {
  try {
    ScrollTrigger.refresh();
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Mode = "initial" | "reveal" | "hide";

interface SplitHost extends HTMLElement {
  _split?: SplitText;
}

type AnyTarget =
  | string
  | Element
  | Element[]
  | NodeListOf<Element>
  | null
  | undefined;

function toEls(target: AnyTarget, scope: ParentNode = document): HTMLElement[] {
  if (!target) return [];
  if (typeof target === "string") return qa<HTMLElement>(target, scope);
  if (target instanceof Element) return [target as HTMLElement];
  return Array.from(target as ArrayLike<Element>).map((e) => e as HTMLElement);
}

/* ------------------------------------------------------------------ */
/* Primitive animators                                                 */
/* ------------------------------------------------------------------ */

/** Text reveal with a glyph-morph feel: lines rise from their mask while
 *  heavily blurred + vertically stretched (the "different shape"), then
 *  snap into crisp focus as they land. One-shot feel preserved —
 *  masked rise (DUR.M, stagger DUR.STAGGER), blur resolving with it. */
const GOO_BLUR_ID = "text-goo-blur";
function gooBlurNode(): SVGElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(GOO_BLUR_ID) as unknown as SVGElement | null;
}
const LOGO_GOO_BLUR_ID = "logo-goo-blur";
function logoGooBlurNode(): SVGElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(LOGO_GOO_BLUR_ID) as unknown as SVGElement | null;
}
/** Hero-mark goo morph: the logo starts as a wobbling ink blob (melted
 *  by its own goo filter + squashed/rotated) and settles into the crisp
 *  mark — the same blob-to-form language as the text morph. Returns the
 *  wobble timeline so a master timeline can nest and await it. */
export function animateLogoGoo(
  target: AnyTarget,
  mode: Mode,
  delay = 0.45,
  scope: ParentNode = document,
): gsap.core.Timeline | null {
  const els = toEls(target, scope);
  if (!els.length) return null;
  const bn = logoGooBlurNode();
  if (mode === "initial") {
    if (bn) gsap.set(bn, { attr: { stdDeviation: 14 } });
    els.forEach((el) => {
      gsap.set(el, {
        autoAlpha: 1,
        visibility: "visible",
        filter: "url(#logo-goo)",
        scaleX: 1.6,
        scaleY: 0.45,
        rotation: -12,
        transformOrigin: "50% 50%",
      });
    });
    return null;
  } else if (mode === "reveal") {
    let first: gsap.core.Timeline | null = null;
    els.forEach((el) => {
      gsap.set(el, { autoAlpha: 1, visibility: "visible" });
      const tl = gsap.timeline({
        delay,
        onComplete: () => {
          gsap.set(el, { clearProps: "filter,transform" });
        },
      });
      tl.to(el, {
        scaleX: 0.75,
        scaleY: 1.35,
        rotation: 9,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      })
        .to(el, {
          scaleX: 1.18,
          scaleY: 0.88,
          rotation: -5,
          duration: 0.42,
          ease: "power2.inOut",
        })
        .to(el, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: DUR.L + 0.3,
          ease: "elastic.out(1, 0.42)",
        });
      trackTw(tl);
      first ??= tl;
    });
    if (bn) {
      trackTw(
        gsap.to(bn, {
          attr: { stdDeviation: 0 },
          duration: DUR.M + 0.9,
          delay,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            qa<HTMLElement>("[data-logo-goo]", scope).forEach((e2) =>
              gsap.set(e2, { clearProps: "filter,transform" }),
            );
          },
        }),
      );
    } else {
      els.forEach((el) => gsap.set(el, { clearProps: "filter,transform" }));
    }
    return first;
  } else {
    els.forEach((el) => gsap.set(el, { clearProps: "filter,transform" }));
    trackTw(
      gsap.to(els, {
        opacity: 0,
        duration: DUR.S,
        delay,
        ease: "power2.in",
        overwrite: true,
      }),
    );
    return null;
  }
}
export function animateTextReveal(
  target: AnyTarget,
  mode: Mode,
  delay = 0.2,
  scope: ParentNode = document,
): void {
  const els = toEls(target, scope);
  if (!els.length) return;
  els.forEach((el, groupIdx) => {
    const host = el as SplitHost;
    if (!host._split) {
      host._split = trackSplit(
        new SplitText(host, {
          type: "lines",
          linesClass: "split-line",
          mask: "lines",
        }),
      );
    }
    const lines = (host._split.lines ?? []) as HTMLElement[];
    if (!lines.length) {
      gsap.set(host, { autoAlpha: mode === "hide" ? 0 : 1 });
      return;
    }
    const d = delay + groupIdx * DUR.STAGGER;
    if (mode === "initial") {
      gsap.set(host, { autoAlpha: 1, visibility: "visible" });
      gsap.set(lines, {
        yPercent: 110,
        filter: "blur(16px)",
        scaleY: 1.35,
        transformOrigin: "50% 100%",
      });
      // Melt the heading into one ink blob via the shared goo filter;
      // the reveal pass below tightens it back into sharp glyphs.
      gsap.set(host, { filter: "url(#text-goo)" });
      const bn = gooBlurNode();
      if (bn && !gsap.isTweening(bn)) {
        gsap.set(bn, { attr: { stdDeviation: 10 } });
      }
    } else if (mode === "reveal") {
      gsap.set(host, { autoAlpha: 1, visibility: "visible" });
      // Re-assert: a finished sibling group may have cleared the shared goo.
      gsap.set(host, { filter: "url(#text-goo)" });
      trackTw(
        gsap.to(lines, {
          yPercent: 0,
          filter: "blur(0px)",
          scaleY: 1,
          duration: DUR.M,
          delay: d,
          stagger: DUR.STAGGER,
          ease: "power4.out",
          overwrite: true,
        }),
      );
      const bn = gooBlurNode();
      if (bn) {
        trackTw(
          gsap.to(bn, {
            attr: { stdDeviation: 0 },
            duration: DUR.M + 0.35,
            delay: d,
            ease: "power2.inOut",
            overwrite: true,
            onComplete: () => {
              // Deviation is shared: completion means every goo pass is
              // done, so release all text hosts (not just this batch).
              qa<HTMLElement>('[data-reveal="text"]', scope).forEach((e2) =>
                gsap.set(e2, { clearProps: "filter" }),
              );
            },
          }),
        );
      }
    } else {
      gsap.set(host, { clearProps: "filter" });
      trackTw(
        gsap.to(lines, {
          yPercent: -110,
          filter: "blur(12px)",
          scaleY: 1.2,
          duration: DUR.S,
          delay,
          stagger: DUR.STAGGER * 0.5,
          ease: "power2.in",
          overwrite: true,
        }),
      );
    }
  });
}

export function killTextTweens(target: AnyTarget): void {
  toEls(target).forEach((el) => {
    const lines = ((el as SplitHost)._split?.lines ?? []) as HTMLElement[];
    if (lines.length) gsap.killTweensOf(lines);
    gsap.killTweensOf(el);
  });
}

/** Blur fade. Legacy-exact timings: reveal durL/power2.out, hide durS. */
export function animateDivReveal(
  target: AnyTarget,
  mode: Mode,
  delay?: number,
  scope: ParentNode = document,
): void {
  const els = toEls(target, scope);
  if (!els.length) return;
  if (mode === "initial") {
    gsap.set(els, { opacity: 0, filter: "blur(20px)" });
  } else if (mode === "reveal") {
    trackTw(
      gsap.to(els, {
        opacity: 1,
        filter: "blur(0px)",
        duration: DUR.L,
        delay: delay ?? 0.2,
        stagger: DUR.STAGGER,
        ease: "power2.out",
        overwrite: true,
      }),
    );
  } else {
    trackTw(
      gsap.to(els, {
        opacity: 0,
        filter: "blur(20px)",
        duration: DUR.S,
        delay: delay ?? 0,
        stagger: DUR.STAGGER * 0.5,
        ease: "power2.in",
        overwrite: true,
      }),
    );
  }
}

/** Char rise used for link label/shadow swap. Legacy-exact. */
export function animateLink(
  target: AnyTarget,
  mode: Mode | "initial",
  delay?: number,
  tl?: gsap.core.Timeline | typeof gsap,
  pos?: string | number,
  scope: ParentNode = document,
): void {
  const els = toEls(target, scope);
  if (!els.length) return;
  els.forEach((el, idx) => {
    const host = el as SplitHost;
    if (host._split) {
      try {
        host._split.revert();
      } catch {
        /* noop */
      }
      liveSplits.delete(host._split);
      delete host._split;
    }
    host._split = trackSplit(
      new SplitText(host, {
        type: "lines,words,chars",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
      }),
    );
    const chars = (host._split.chars ?? []) as HTMLElement[];
    if (!chars.length) return;
    host._split.lines?.forEach((l) => {
      const e = l as HTMLElement;
      e.style.display = "block";
      e.style.overflow = "clip";
    });
    host._split.words?.forEach((w) => {
      (w as HTMLElement).style.overflow = "clip";
    });
    const c = idx * DUR.STAGGER;
    if (mode === "reveal") {
      gsap.killTweensOf(chars);
      if (tl && tl !== gsap) {
        trackTw(
          tl.fromTo(
            chars,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: DUR.S,
              stagger: { amount: 0.075 },
              ease: "power3.inOut",
              overwrite: true,
            },
            pos ?? ">",
          ),
        );
      } else {
        trackTw(
          gsap.fromTo(
            chars,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: DUR.S,
              delay: (delay ?? 0.2) + c,
              stagger: { amount: 0.075 },
              ease: "power3.inOut",
              overwrite: true,
            },
          ),
        );
      }
    } else if (mode === "hide") {
      gsap.killTweensOf(chars);
      if (tl && tl !== gsap) {
        trackTw(
          tl.to(
            chars,
            {
              yPercent: -100,
              duration: DUR.S,
              stagger: { amount: 0.075 },
              ease: "power3.inOut",
              overwrite: true,
            },
            pos ?? ">",
          ),
        );
      } else {
        trackTw(
          gsap.to(chars, {
            yPercent: -100,
            duration: DUR.S,
            delay: (delay ?? 0) + 0,
            stagger: { amount: 0.075 },
            ease: "power3.inOut",
            overwrite: true,
          }),
        );
      }
    } else {
      gsap.killTweensOf(chars);
      gsap.set(chars, { yPercent: 100 });
    }
  });
}

export const CLIP_DIRS: Record<string, { hidden: string; visible: string }> = {
  "top-down": { hidden: "inset(0% 0% 100% 0%)", visible: "inset(0% 0% 0% 0%)" },
  "left-right": {
    hidden: "inset(0% 100% 0% 0%)",
    visible: "inset(0% 0% 0% 0%)",
  },
  "right-left": {
    hidden: "inset(0% 0% 0% 100%)",
    visible: "inset(0% 0% 0% 0%)",
  },
  "down-top": { hidden: "inset(100% 0% 0% 0%)", visible: "inset(0% 0% 0% 0%)" },
};

/** Legacy-exact clip-path reveal. */
export function animateClipReveal(
  target: AnyTarget,
  dir: keyof typeof CLIP_DIRS | string,
  mode: Mode,
  delay?: number,
  scope: ParentNode = document,
): void {
  const els = toEls(target, scope);
  if (!els.length) return;
  const r = CLIP_DIRS[dir];
  if (!r) return;
  if (mode === "initial") {
    gsap.set(els, { clipPath: r.hidden, webkitClipPath: r.hidden });
  } else if (mode === "reveal") {
    trackTw(
      gsap.to(els, {
        clipPath: r.visible,
        webkitClipPath: r.visible,
        duration: DUR.L,
        delay: delay ?? 0.2,
        stagger: DUR.STAGGER,
        ease: "power2.out",
        overwrite: true,
      }),
    );
  } else {
    trackTw(
      gsap.to(els, {
        clipPath: r.hidden,
        webkitClipPath: r.hidden,
        duration: DUR.S,
        delay: delay ?? 0,
        stagger: DUR.STAGGER * 0.5,
        ease: "power2.in",
        overwrite: true,
      }),
    );
  }
}

/* ------------------------------------------------------------------ */
/* revealNow — instant unhide, no animation                            */
/* ------------------------------------------------------------------ */

const UNHIDE_SEL = [
  "[data-reveal]",
  "[data-contact-reveal]",
  "[data-sticky-meta]",
  "[data-scrub-reveal]",
  "[data-parallax]",
  "[data-featured]",
  "[data-contact-dial]",
  "[data-works-item]",
  "[data-award]",
  ".icon-wrap",
  "[data-morph-final]",
].join(",");

/** Make every hidden hook visible immediately. Used for reduced-motion and
 *  excluded pages. Reverts SplitText so no masked lines stay offset. */
export function revealNow(scope: ParentNode = document): void {
  const els = qa<HTMLElement>(UNHIDE_SEL, scope);
  els.forEach((el) => {
    const host = el as SplitHost;
    if (host._split) {
      try {
        host._split.revert();
      } catch {
        /* noop */
      }
      liveSplits.delete(host._split);
      delete host._split;
    }
  });
  if (els.length) {
    gsap.set(els, {
      visibility: "visible",
      autoAlpha: 1,
      opacity: 1,
      clearProps: "transform,clipPath,webkitClipPath,filter,width,height",
    });
  }
  const contents = qa<HTMLElement>(
    "[data-filter-content]",
    scope,
  );
  contents.forEach((c) => {
    (c as HTMLElement).style.display = "";
  });
  const cutItems = qa<HTMLElement>('[data-cut="item"]', scope);
  cutItems.forEach((c) => {
    (c as HTMLElement).style.display = "";
  });
}

/* ------------------------------------------------------------------ */
/* Serial staging: any reveal hook may carry data-reveal-delay="0.65" to  */
/* join a choreographed entrance cascade instead of firing with the pack. */
/* ------------------------------------------------------------------ */

/** True when the home hero owns its entrance: elements tagged
 *  [data-intro-step] are staged hidden here and driven serially by the
 *  hero-intro master timeline (lib/fx/heroIntro.ts) instead of firing
 *  their own ScrollTrigger one-shots. Every home visit replays the
 *  cascade, so there is no stuck-hidden state to manage. */
function stagesHeroIntro(scope: ParentNode): boolean {
  const root = scope instanceof Element ? scope : document;
  if (!root.querySelector("[data-intro-step]")) return false;
  return document.querySelector('main[data-page="home"]') !== null;
}

function stagedDelay(el: HTMLElement, fallback: number): number {
  const raw = el.getAttribute("data-reveal-delay");
  if (raw === null) return fallback;
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

/* ------------------------------------------------------------------ */
/* Section builders (all no-op when hooks absent)                       */
/* ------------------------------------------------------------------ */

function oneShot(
  trigger: Element,
  start: string,
  onEnter: () => void,
): ScrollTrigger {
  const st = ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter,
  });
  trackST(st);
  return st;
}

function wireTextReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>('[data-reveal="text"]', scope).forEach((el) => {
    // Hero-intro members stay staged (hidden, unsplit) for the master
    // timeline; it splits and animates them serially itself.
    if (el.hasAttribute("data-intro-step") && stagesHeroIntro(scope)) {
      gsap.set(el, { visibility: "visible", autoAlpha: 0 });
      return;
    }
    gsap.set(el, { visibility: "visible" });
    animateTextReveal(el, "initial");
    // Legacy exact: start "top bottom", once, delay 0.1
    // (data-reveal-delay overrides for staged cascades, e.g. hero).
    const dl = stagedDelay(el, 0.1);
    local.push(
      oneShot(el, "top bottom", () => animateTextReveal(el, "reveal", dl)),
    );
  });
}

const CLIP_ATTR: Record<string, string> = {
  "clip-down": "top-down",
  "clip-left": "left-right",
  "clip-right": "right-left",
  "clip-top": "down-top",
};

function wireClipReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  Object.entries(CLIP_ATTR).forEach(([attr, dir]) => {
    qa<HTMLElement>(`[data-reveal="${attr}"]`, scope).forEach((el) => {
      // Hero-intro members (the vertical divider lines) stay staged for
      // the master timeline's top-to-bottom draw.
      if (el.hasAttribute("data-intro-step") && stagesHeroIntro(scope)) {
        gsap.set(el, { visibility: "visible" });
        animateClipReveal(el, dir, "initial");
        return;
      }
      gsap.set(el, { visibility: "visible" });
      animateClipReveal(el, dir, "initial");
      const dl = stagedDelay(el, 0.1);
      local.push(
        oneShot(el, "top bottom", () => animateClipReveal(el, dir, "reveal", dl)),
      );
    });
  });
}

function wireDivReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>('[data-reveal="div"]', scope).forEach((el) => {
    const wrap = el.closest('[data-reveal="w"]') ?? el;
    // The theme lever joins the hero cascade last; stage it without an
    // auto trigger on home.
    if (el.hasAttribute("data-intro-step") && stagesHeroIntro(scope)) {
      gsap.set(el, { visibility: "visible" });
      animateDivReveal(el, "initial");
      return;
    }
    gsap.set(el, { visibility: "visible" });
    animateDivReveal(el, "initial");
    const dl = stagedDelay(el, 0.1);
    local.push(
      oneShot(wrap, "top bottom", () => animateDivReveal(el, "reveal", dl)),
    );
  });
}

/** Hero-mark goo morph hooks ([data-logo-goo]). Blob initial state,
 *  wobble-settle reveal on scroll into view — mirrors the div hooks. */
function wireLogoGoo(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>("[data-logo-goo]", scope).forEach((el) => {
    gsap.set(el, { visibility: "visible" });
    animateLogoGoo(el, "initial");
    // Hero mark morphs first in the master timeline — stage the blob
    // without an auto trigger on home.
    if (el.hasAttribute("data-intro-step") && stagesHeroIntro(scope)) return;
    const dl = stagedDelay(el, 0.45);
    local.push(
      oneShot(el, "top bottom", () => animateLogoGoo(el, "reveal", dl)),
    );
  });
}

/** Width expand. Legacy has no dedicated animator (only uses [data-reveal="w"]
 *  as a trigger anchor for inner divs); this adds a simple 0->measured width
 *  expand so standalone [data-reveal="w"] hooks still reveal. */
function wireWidthReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>('[data-reveal="w"]', scope).forEach((el) => {
    if (el.querySelector('[data-reveal="div"]')) return; // inner div handles it
    const full = el.scrollWidth || el.offsetWidth || 0;
    if (!full) {
      gsap.set(el, { visibility: "visible" });
      return;
    }
    gsap.set(el, { visibility: "visible", width: 0, overflow: "hidden" });
    const dl = stagedDelay(el, 0.1);
    local.push(
      oneShot(el, "top bottom", () => {
        trackTw(
          gsap.to(el, {
            width: full,
            duration: DUR.L,
            delay: dl,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => gsap.set(el, { clearProps: "width" }),
          }),
        );
      }),
    );
  });
}

function wireLinks(scope: ParentNode): void {
  if (!window.matchMedia("(min-width: 992px)").matches) return;
  qa<HTMLElement>(".link-inner", scope).forEach((inner) => {
    const label = inner.querySelector('[data-link="label"]');
    const shadow = inner.querySelector('[data-link="shadow"]');
    if (!label || !shadow) return;
    gsap.set(shadow as HTMLElement, { display: "block" });
    animateLink(shadow, "initial");
    const tl = trackTw(gsap.timeline({ paused: true }));
    animateLink(label, "hide", 0, tl, 0);
    animateLink(shadow, "reveal", 0, tl, 0);
    const play = (): void => {
      tl.play();
    };
    const rev = (): void => {
      tl.reverse();
    };
    inner.addEventListener("mouseenter", play);
    inner.addEventListener("mouseleave", rev);
    const triggerEl = inner.closest("[data-link-trigger]");
    triggerEl?.addEventListener("mouseenter", play);
    triggerEl?.addEventListener("mouseleave", rev);
    const cleanup: Cleanup = () => {
      inner.removeEventListener("mouseenter", play);
      inner.removeEventListener("mouseleave", rev);
      triggerEl?.removeEventListener("mouseenter", play);
      triggerEl?.removeEventListener("mouseleave", rev);
      try {
        tl.kill();
      } catch {
        /* noop */
      }
      liveTweens.delete(tl);
    };
    trackCleanup(cleanup);
  });
}

const MORPH_RECT = "M0 0 L95 0 L95 160 L0 160 Z";

/** Logo path morph (rect -> final mark) with a clip opening. Returned
 *  timeline lets the hero-intro master nest and await the full morph. */
export function playLogoMorph(
  wrap: HTMLElement,
  path: HTMLElement,
  final: string,
  clipDur: number = DUR.M,
  morphDur: number = DUR.L,
): gsap.core.Timeline {
  gsap.killTweensOf([path, wrap]);
  gsap.set(path, { attr: { d: MORPH_RECT } });
  const tl = gsap.timeline();
  tl.set(wrap, { visibility: "visible", clipPath: "inset(0% 0% 100% 0%)" });
  tl.to(wrap, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: clipDur,
    ease: "power2.out",
  });
  tl.to(
    path,
    {
      morphSVG: final,
      duration: morphDur,
      ease: "power2.out",
    } as gsap.TweenVars,
  );
  return trackTw(tl);
}

function wireLogoMorph(scope: ParentNode): void {
  const path = scope.querySelector<HTMLElement>("[data-morph-final]");
  if (!path) return;
  // Empty data-morph-final means "morph from the reveal rect into the
  // path's own shape" — fall back to the inlined d attribute.
  const final =
    path.dataset.morphFinal ||
    path.getAttribute("d") ||
    undefined;
  if (final && !path.dataset.morphFinal) path.dataset.morphFinal = final;
  const wrap = scope.querySelector<HTMLElement>(".icon-wrap");
  if (!wrap || !final) return;
  // Hero mark is morphed by the master timeline on home — never here.
  if (wrap.hasAttribute("data-intro-step") && stagesHeroIntro(scope)) return;
  playLogoMorph(wrap, path, final);
}

function wireAwards(scope: ParentNode): void {
  const items = qa<HTMLElement>('[data-award="item"]', scope);
  if (!items.length) return;
  let z = 1;
  items.forEach((item) => {
    const cert = item.querySelector<HTMLElement>('[data-award="certificate"]');
    if (!cert) return;
    gsap.set(cert, {
      display: "block",
      clipPath: "inset(100% 0% 0% 0%)",
      scale: 0.9,
    });
    const show = (): void => {
      z += 1;
      gsap.set(cert, { zIndex: z });
      trackTw(
        gsap.to(cert, {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
        }),
      );
    };
    const hide = (): void => {
      trackTw(
        gsap.to(cert, {
          clipPath: "inset(0% 0% 100% 0%)",
          scale: 0.9,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
        }),
      );
    };
    item.addEventListener("mouseenter", show);
    item.addEventListener("mouseleave", hide);
    trackCleanup(() => {
      item.removeEventListener("mouseenter", show);
      item.removeEventListener("mouseleave", hide);
    });
  });
}

function wireFeaturedWidth(scope: ParentNode, local: ScrollTrigger[]): void {
  const heading = scope.querySelector<HTMLElement>(
    '[data-featured="heading"]',
  );
  const globe = scope.querySelector<HTMLElement>('[data-featured="globe"]');
  if (!heading || !globe) return;
  const texts = qa<HTMLElement>('[data-featured="text"]', scope);
  const links = qa<HTMLElement>('[data-featured="link"]', scope);
  const full = heading.scrollWidth;
  const parentW = heading.parentElement?.offsetWidth ?? full;
  gsap.set(heading, { width: full });
  const tl = trackTw(
    gsap.timeline({
      scrollTrigger: {
        trigger: globe,
        start: "top 75%",
        end: "bottom 25%",
        scrub: true,
        onUpdate: (self) => {
          if (self.progress >= 0.99) {
            texts.forEach((e) => {
              e.style.display = "none";
            });
            links.forEach((e) => {
              e.style.display = "block";
            });
            heading.style.flexDirection = "column";
            heading.style.alignItems = "center";
            heading.style.justifyContent = "center";
          } else {
            texts.forEach((e) => {
              e.style.display = "";
            });
            links.forEach((e) => {
              e.style.display = "none";
            });
            heading.style.flexDirection = "";
            heading.style.alignItems = "";
            heading.style.justifyContent = "space-between";
          }
        },
      },
    }),
  );
  if (tl.scrollTrigger) {
    trackST(tl.scrollTrigger as ScrollTrigger);
    local.push(tl.scrollTrigger as ScrollTrigger);
  }
  tl.to(heading, { width: parentW, ease: "none" }).to(heading, {
    width: full,
    ease: "none",
  });
  trackCleanup(() => {
    gsap.set(heading, { clearProps: "width" });
  });
}

function wireFeaturedHeightMobile(
  scope: ParentNode,
  local: ScrollTrigger[],
): void {
  const wrap = scope.querySelector<HTMLElement>('[m-data-featured="wrap"]');
  const heading = scope.querySelector<HTMLElement>(
    '[m-data-featured="heading"]',
  );
  const list = scope.querySelector<HTMLElement>('[m-data-featured="list"]');
  if (!wrap || !heading || !list) return;
  const texts = qa<HTMLElement>('[m-data-featured="text"]', scope);
  const links = qa<HTMLElement>('[m-data-featured="link"]', scope);
  const h = heading.scrollHeight;
  gsap.set(heading, { height: h });
  gsap.set(list, { xPercent: 100 });
  const tw = trackTw(
    gsap.fromTo(
      list,
      { xPercent: 100 },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      },
    ),
  );
  if (tw.scrollTrigger) {
    trackST(tw.scrollTrigger as ScrollTrigger);
    local.push(tw.scrollTrigger as ScrollTrigger);
  }
  const tl = trackTw(
    gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          if (self.progress >= 0.99) {
            texts.forEach((e) => {
              e.style.display = "none";
            });
            links.forEach((e) => {
              e.style.display = "block";
            });
          } else {
            texts.forEach((e) => {
              e.style.display = "";
            });
            links.forEach((e) => {
              e.style.display = "none";
            });
          }
        },
      },
    }),
  );
  if (tl.scrollTrigger) {
    trackST(tl.scrollTrigger as ScrollTrigger);
    local.push(tl.scrollTrigger as ScrollTrigger);
  }
  tl.to(list, { xPercent: -100, duration: 0.8, ease: "none" }, 0).to(
    heading,
    { height: 0.12 * h, duration: 1, ease: "none" },
    0.28,
  );
}

/** Scrubbed works-overlay mask. Legacy-exact geometry; additionally mirrors
 *  progress into --hole-progress so the CSS-contract clip stays in sync. */
function wireWorksIntroMask(scope: ParentNode, local: ScrollTrigger[]): void {
  const overlay = scope.querySelector<HTMLElement>(".works-overlay");
  const trigger = scope.querySelector<HTMLElement>(
    '[data-works-intro="trigger"]',
  );
  const out = scope.querySelector<HTMLElement>('[data-works-intro="out"]');
  if (!overlay || !trigger || !out) return;
  // Mobile shows the overlay as a plain static header (see globals.css) —
  // the scrubbed hole mask stays desktop-only so a stalled/mis-measured
  // scrub can never seal the grid behind a solid cover on phones.
  try {
    if (window.matchMedia("(max-width: 991px)").matches) {
      overlay.style.clipPath = "none";
      overlay.style.setProperty("--hole-progress", "1");
      return;
    }
  } catch {
    /* matchMedia unavailable — fall through to the desktop path */
  }
  const leftText = scope.querySelector<HTMLElement>(
    '[data-works-intro="left-text"]',
  );
  const rightText = scope.querySelector<HTMLElement>(
    '[data-works-intro="right-text"]',
  );
  const mobile = window.matchMedia("(max-width: 991px)").matches;
  const measure = (cssW: string): number => {
    const d = document.createElement("div");
    d.style.width = cssW;
    document.body.appendChild(d);
    const w = parseFloat(getComputedStyle(d).width);
    document.body.removeChild(d);
    return Number.isFinite(w) ? w : 0;
  };
  let holeW: number;
  let holeH: number;
  if (mobile) {
    holeW = measure("60.305rem");
    holeH = measure("83.46rem");
  } else {
    const cs = getComputedStyle(overlay);
    const cell = parseFloat(cs.getPropertyValue("--_special-units---1-cell")) || 0;
    const gap = parseFloat(cs.getPropertyValue("--_special-units---grid-gap")) || 0;
    holeW = cell > 0 ? 4 * measure(`${cell}px`) + 3 * measure(`${gap}px`) : 0;
    holeH = 0.6 * window.innerHeight;
    if (!holeW) holeW = overlay.offsetWidth * 0.5;
  }
  const hx = holeW / 2;
  const hy = holeH / 2;
  const paint = (ex: number, ey: number): void => {
    overlay.style.clipPath =
      `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ` +
      `calc(50% - ${ex}px) calc(50% - ${ey}px), ` +
      `calc(50% + ${ex}px) calc(50% - ${ey}px), ` +
      `calc(50% + ${ex}px) calc(50% + ${ey}px), ` +
      `calc(50% - ${ex}px) calc(50% + ${ey}px), ` +
      `calc(50% - ${ex}px) calc(50% - ${ey}px))`;
  };
  const fullW = (): number => overlay.offsetWidth / 2;
  const fullH = (): number => overlay.offsetHeight / 2;
  const inPhase = (p: number): void => {
    paint(hx + (fullW() - hx) * p, hy + (fullH() - hy) * p);
    overlay.style.setProperty("--hole-progress", String(p));
    if (leftText) gsap.set(leftText, { x: `${-50 * p}vw` });
    if (rightText) gsap.set(rightText, { x: `${50 * p}vw` });
  };
  const outPhase = (p: number): void => {
    paint(fullW() + (hx - fullW()) * p, fullH() + (hy - fullH()) * p);
    overlay.style.setProperty("--hole-progress", String(1 - p));
  };
  local.push(
    trackSTReturn(
      ScrollTrigger.create({
        trigger,
        start: "center center",
        end: "top top",
        scrub: true,
        onUpdate: (self) => inPhase(self.progress),
      }),
    ),
  );
  local.push(
    trackSTReturn(
      ScrollTrigger.create({
        trigger: out,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => outPhase(self.progress),
      }),
    ),
  );
}

function trackSTReturn(st: ScrollTrigger): ScrollTrigger {
  trackST(st);
  return st;
}

/** Standalone filter tabs. Simplified vs legacy: legacy cross-faded globe /
 *  cards scenes with staggered card splits; here we toggle .is-active,
 *  opacity, and matching [data-filter-content] visibility, then refresh. */
function wireFilterTabs(scope: ParentNode): void {
  const tabs = qa<HTMLElement>("[data-filter-tab]", scope);
  const contents = qa<HTMLElement>("[data-filter-content]", scope);
  if (!tabs.length || !contents.length) return;
  const select = (name: string): void => {
    tabs.forEach((t) => {
      const active = t.getAttribute("data-filter-tab") === name;
      t.classList.toggle("is-active", active);
      trackTw(
        gsap.to(t, {
          opacity: active ? 1 : 0.4,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
        }),
      );
    });
    contents.forEach((c) => {
      const show = c.getAttribute("data-filter-content") === name;
      c.style.display = show ? "block" : "none";
    });
    ScrollTrigger.refresh();
  };
  tabs.forEach((tab) => {
    const name = tab.getAttribute("data-filter-tab") ?? "";
    const onClick = (): void => select(name);
    const onEnter = (): void => {
      trackTw(
        gsap.to(tab, {
          opacity: 1,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
        }),
      );
    };
    const onLeave = (): void => {
      if (tab.classList.contains("is-active")) return;
      trackTw(
        gsap.to(tab, {
          opacity: 0.4,
          duration: DUR.S,
          ease: "power2.out",
          overwrite: "auto",
        }),
      );
    };
    tab.addEventListener("click", onClick);
    tab.addEventListener("mouseenter", onEnter);
    tab.addEventListener("mouseleave", onLeave);
    trackCleanup(() => {
      tab.removeEventListener("click", onClick);
      tab.removeEventListener("mouseenter", onEnter);
      tab.removeEventListener("mouseleave", onLeave);
    });
  });
  const first = tabs[0]?.getAttribute("data-filter-tab") ?? "";
  select(first);
}

function wireWorksItemHover(scope: ParentNode): void {
  const wraps = qa<HTMLElement>('[data-works-item="wrap"]', scope);
  if (!wraps.length) return;
  wraps.forEach((wrap) => {
    const btn = wrap.querySelector<HTMLElement>('[data-works-item="button"]');
    if (!btn) return;
    gsap.set(btn, { bottom: "-2.222rem" });
    const show = (): void => {
      trackTw(
        gsap.to(btn, {
          bottom: "1.111rem",
          duration: DUR.M,
          ease: "power3.inOut",
          overwrite: "auto",
        }),
      );
    };
    const hide = (): void => {
      trackTw(
        gsap.to(btn, {
          bottom: "-2.222rem",
          duration: DUR.M,
          ease: "power3.inOut",
          overwrite: "auto",
        }),
      );
    };
    wrap.addEventListener("mouseenter", show);
    wrap.addEventListener("mouseleave", hide);
    trackCleanup(() => {
      wrap.removeEventListener("mouseenter", show);
      wrap.removeEventListener("mouseleave", hide);
    });
  });
}

/** Truncates [data-cut="list"] to data-cut-max items + counter. No
 *  animation in legacy; cleanup restores hidden items. */
function wireCutList(scope: ParentNode): void {
  const lists = qa<HTMLElement>('[data-cut="list"]', scope);
  if (!lists.length) return;
  lists.forEach((list) => {
    const items = Array.from(
      list.querySelectorAll<HTMLElement>('[data-cut="item"]'),
    );
    if (!items.length) return;
    const max = parseInt(list.getAttribute("data-cut-max") ?? "", 10) || 1;
    let counter: HTMLElement | null = null;
    let p: ParentNode | null = list.parentElement;
    while (p && p !== scope.parentNode && !counter) {
      counter =
        p instanceof Element
          ? p.querySelector<HTMLElement>('[data-cut="counter"]')
          : null;
      p = p.parentNode;
    }
    const hidden = items.filter((_, i) => i >= max);
    hidden.forEach((e) => {
      e.style.display = "none";
    });
    const extra = items.length - max;
    const prevText = counter?.textContent ?? null;
    if (counter && extra > 0) {
      counter.textContent = `+${extra}`;
      counter.style.setProperty("display", "block", "important");
    }
    trackCleanup(() => {
      hidden.forEach((e) => {
        e.style.display = "";
      });
      if (counter && prevText !== null) {
        counter.textContent = prevText;
        counter.style.removeProperty("display");
      }
    });
  });
}

/** Keeps the next `count` entities after the current namespace.
 *  Legacy removes the rest; we hide instead so cleanup can restore. */
function wireNextEntity(scope: ParentNode, count = 1): void {
  const items = qa<HTMLElement>("[data-next-entity-item]", scope);
  if (!items.length) return;
  const host =
    scope instanceof Document
      ? document.querySelector("[data-barba-namespace]")
      : scope instanceof Element
        ? scope.querySelector("[data-barba-namespace]")
        : null;
  const current = (host as HTMLElement | null)?.dataset.barbaNamespace;
  const idx = items.findIndex((e) => e.dataset.nextEntityItem === current);
  const keep = new Set(
    Array.from(
      { length: count },
      (_, i) => items[(idx + 1 + i + items.length) % items.length],
    ),
  );
  const hidden = items.filter((e) => !keep.has(e));
  hidden.forEach((e) => {
    e.style.display = "none";
  });
  trackCleanup(() => {
    hidden.forEach((e) => {
      e.style.display = "";
    });
  });
}

/** Contact reveals. Legacy-exact: clip left/right, scale center, start
 *  "top 88%", once. Dial rotation itself lives in another module. */
function wireContactReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  const groups: Array<{ els: HTMLElement[]; from: object; to: object }> = [
    {
      els: qa<HTMLElement>('[data-contact-reveal="left"]', scope),
      from: { clipPath: "inset(0 0 0 100%)" },
      to: { clipPath: "inset(0 0 0 0%)", duration: DUR.L, ease: "power2.out" },
    },
    {
      els: qa<HTMLElement>('[data-contact-reveal="right"]', scope),
      from: { clipPath: "inset(0 100% 0 0)" },
      to: { clipPath: "inset(0 0% 0 0)", duration: DUR.L, ease: "power2.out" },
    },
    {
      els: qa<HTMLElement>('[data-contact-reveal="center"]', scope),
      from: { scale: 0, transformOrigin: "center center" },
      to: { scale: 1, duration: DUR.M, ease: "power2.out" },
    },
  ];
  groups.forEach(({ els, from, to }) => {
    els.forEach((el) => {
      gsap.killTweensOf(el);
      gsap.set(el, { visibility: "visible", ...(from as object) });
      local.push(
        oneShot(el, "top 88%", () => {
          trackTw(gsap.to(el, { ...(to as object) }));
        }),
      );
    });
  });
  const dialItems = qa<HTMLElement>("[data-contact-dial-item]", scope);
  dialItems.forEach((el, i) => {
    gsap.set(el, { visibility: "visible", opacity: 0, y: 24 });
    local.push(
      oneShot(el, "top 88%", () => {
        trackTw(
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: DUR.M,
            delay: Math.min(i * 0.05, 0.4),
            ease: "power2.out",
            overwrite: true,
          }),
        );
      }),
    );
  });
}

/** Scrubbed reveals. No legacy implementation exists (hooks only in CSS);
 *  simple y-drift + fade tied to scroll position. */
function wireScrubReveals(scope: ParentNode, local: ScrollTrigger[]): void {
  (["h", "p", "ctn"] as const).forEach((kind) => {
    qa<HTMLElement>(`[data-scrub-reveal="${kind}"]`, scope).forEach((el) => {
      const dist = kind === "h" ? 60 : kind === "p" ? 40 : 24;
      gsap.set(el, { visibility: "visible" });
      const tw = trackTw(
        gsap.fromTo(
          el,
          { y: dist, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: kind === "ctn" ? "center center" : "top 35%",
              scrub: true,
            },
          },
        ),
      );
      if (tw.scrollTrigger) {
        trackST(tw.scrollTrigger as ScrollTrigger);
        local.push(tw.scrollTrigger as ScrollTrigger);
      }
    });
  });
}

/** Parallax. No legacy implementation exists (hooks only in CSS);
 *  inner image drifts against its wrapper on scrub. */
function wireParallax(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>('[data-parallax="img"]', scope).forEach((el) => {
    const wrap = el.parentElement ?? el;
    gsap.set(el, { visibility: "visible" });
    const tw = trackTw(
      gsap.fromTo(
        el,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      ),
    );
    if (tw.scrollTrigger) {
      trackST(tw.scrollTrigger as ScrollTrigger);
      local.push(tw.scrollTrigger as ScrollTrigger);
    }
  });
  qa<HTMLElement>('[data-parallax="img-out"]', scope).forEach((el) => {
    const wrap = el.parentElement ?? el;
    gsap.set(el, { visibility: "visible" });
    const tw = trackTw(
      gsap.fromTo(
        el,
        { yPercent: 8, scale: 1.15 },
        {
          yPercent: -8,
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      ),
    );
    if (tw.scrollTrigger) {
      trackST(tw.scrollTrigger as ScrollTrigger);
      local.push(tw.scrollTrigger as ScrollTrigger);
    }
  });
}

/** Sticky meta: basic one-shot text rise only. The pinned sticky-name
 *  machine lives in another module. */
function wireStickyMeta(scope: ParentNode, local: ScrollTrigger[]): void {
  qa<HTMLElement>('[data-sticky-meta="text"]', scope).forEach((el) => {
    gsap.set(el, { visibility: "visible" });
    animateTextReveal(el, "initial");
    local.push(
      oneShot(el, "top 95%", () => animateTextReveal(el, "reveal", 0.1)),
    );
  });
  qa<HTMLElement>("[data-sticky-meta]", scope).forEach((el) => {
    if (el.matches('[data-sticky-meta="text"]')) return;
    gsap.set(el, { visibility: "visible", opacity: 0, y: 16 });
    local.push(
      oneShot(el, "top 95%", () => {
        trackTw(
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: DUR.M,
            ease: "power2.out",
            overwrite: true,
          }),
        );
      }),
    );
  });
}

/* ------------------------------------------------------------------ */
/* Public entry points                                                 */
/* ------------------------------------------------------------------ */

/** Wire every reveal behavior within scope. One-shot ScrollTriggers
 *  (legacy starts: "top bottom" for reveals, "top 88%" for contact).
 *  Above-the-fold elements fire on load via ScrollTrigger's initial check.
 *  Refreshes after fonts/images settle (fonts.ready + window load). */
export function initReveals(scope: ParentNode = document): Cleanup {
  if (prefersReduced()) {
    revealNow(scope);
    return () => {};
  }

  const knownTriggers = new Set(liveTriggers);
  const knownTweens = new Set(liveTweens);
  const knownCleanups = new Set(liveCleanups);
  const knownSplits = new Set(liveSplits);

  wireTextReveals(scope, []);
  wireLogoGoo(scope, []);
  wireClipReveals(scope, []);
  wireDivReveals(scope, []);
  wireWidthReveals(scope, []);
  // NOTE: link label/shadow hover is owned solely by initLinks() (links.ts),
  // which runs per-page after initReveals. wireLinks() below is kept exported
  // for API parity but must NOT run here — double-binding the same
  // .link-inner nodes splits chars twice and leaves stale hover timelines.
  wireLogoMorph(scope);
  wireAwards(scope);
  wireFeaturedWidth(scope, []);
  wireFeaturedHeightMobile(scope, []);
  wireWorksIntroMask(scope, []);
  wireFilterTabs(scope);
  wireWorksItemHover(scope);
  wireCutList(scope);
  wireNextEntity(scope, 1);
  wireContactReveals(scope, []);
  wireScrubReveals(scope, []);
  wireParallax(scope, []);
  wireStickyMeta(scope, []);

  const myTriggers = [...liveTriggers].filter((s) => !knownTriggers.has(s));
  const myTweens = [...liveTweens].filter((t) => !knownTweens.has(t));
  const myCleanups = [...liveCleanups].filter((c) => !knownCleanups.has(c));
  const mySplits = [...liveSplits].filter((s) => !knownSplits.has(s));

  const refresh = (): void => {
    try {
      ScrollTrigger.refresh();
    } catch {
      /* noop */
    }
  };
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready
      .then(() => refresh())
      .catch(() => {
        /* noop */
      });
  }
  window.addEventListener("load", onWindowLoadRefresh);

  // Initial check so above-the-fold one-shots play immediately.
  refresh();

  return () => {
    myTriggers.forEach((st) => {
      try {
        st.kill();
      } catch {
        /* noop */
      }
      liveTriggers.delete(st);
    });
    myTweens.forEach((tw) => {
      try {
        tw.kill();
      } catch {
        /* noop */
      }
      liveTweens.delete(tw);
    });
    myCleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* noop */
      }
      liveCleanups.delete(fn);
    });
    mySplits.forEach((sp) => {
      try {
        sp.revert();
      } catch {
        /* noop */
      }
      liveSplits.delete(sp);
    });
    window.removeEventListener("load", onWindowLoadRefresh);
  };
}
