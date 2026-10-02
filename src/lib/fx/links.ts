import {
  gsap,
  SplitText,
  DUR,
  DESKTOP_QUERY,
  prefersReduced,
  qa,
  type Cleanup,
} from "@/lib/fx/core";

/**
 * Link label hover animation on `.link-inner` elements.
 *
 * NOTE: despite the name, legacy initLinks in slater-bundle.js does NOT do
 * anchor/same-origin navigation handling (that was barba's `prevent`
 * config). It binds a char-split hide/reveal hover timeline between
 * [data-link="label"] and [data-link="shadow"], desktop only, with an
 * optional [data-link-trigger] ancestor sharing the hover area. This port
 * mirrors that behavior exactly. Same-origin <a> clicks are intentionally
 * left alone so default Next.js navigation keeps working; external,
 * tel:, and mailto: links are untouched (no interception at all).
 *
 * Legacy ease "InOut" is not a canonical gsap ease name, so "power1.inOut"
 * (its evident meaning) is used; durations match DUR.S.
 */
type Splittable = HTMLElement & {
  _split?: SplitText;
  _setLinkText?: (text: string) => void;
};

const CHAR_STAGGER = 0.075;

function splitChars(el: HTMLElement): HTMLElement[] | null {
  const s = el as Splittable;
  s._split?.revert();
  const split = new SplitText(el, {
    type: "lines,words,chars",
    linesClass: "split-line",
    wordsClass: "split-word",
    charsClass: "split-char",
  });
  s._split = split;
  const chars = (split.chars ?? []) as HTMLElement[];
  if (chars.length === 0) return null;
  (split.lines ?? []).forEach((line) => {
    const l = line as HTMLElement;
    l.style.display = "block";
    l.style.overflow = "clip";
  });
  (split.words ?? []).forEach((word) => {
    (word as HTMLElement).style.overflow = "clip";
  });
  return chars;
}

function revertSplit(el: HTMLElement): void {
  const s = el as Splittable;
  s._split?.revert();
  delete s._split;
}

function bindLink(el: HTMLElement): Cleanup {
  const label = el.querySelector<HTMLElement>('[data-link="label"]');
  const shadow = el.querySelector<HTMLElement>('[data-link="shadow"]');
  if (!label || !shadow) return () => {};

  let tl: gsap.core.Timeline | null = null;

  const build = () => {
    gsap.set(shadow, { display: "block" });
    const shadowChars = splitChars(shadow);
    if (shadowChars) gsap.set(shadowChars, { yPercent: 100 });
    const labelChars = splitChars(label);
    const next = gsap.timeline({ paused: true });
    if (labelChars) {
      gsap.killTweensOf(labelChars);
      next.to(
        labelChars,
        {
          yPercent: -100,
          duration: DUR.S,
          stagger: { amount: CHAR_STAGGER },
          ease: "power1.inOut",
          overwrite: true,
        },
        0,
      );
    }
    if (shadowChars) {
      gsap.killTweensOf(shadowChars);
      next.fromTo(
        shadowChars,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: DUR.S,
          stagger: { amount: CHAR_STAGGER },
          ease: "power1.inOut",
          overwrite: true,
        },
        0,
      );
    }
    tl = next;
  };
  build();

  const onEnter = () => tl?.play();
  const onLeave = () => tl?.reverse();
  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);

  const trigger = el.closest<HTMLElement>("[data-link-trigger]");
  if (trigger) {
    trigger.addEventListener("mouseenter", onEnter);
    trigger.addEventListener("mouseleave", onLeave);
  }

  (el as Splittable)._setLinkText = (text: string) => {
    tl?.kill();
    revertSplit(label);
    revertSplit(shadow);
    label.textContent = text;
    shadow.textContent = text;
    build();
  };

  return () => {
    el.removeEventListener("mouseenter", onEnter);
    el.removeEventListener("mouseleave", onLeave);
    if (trigger) {
      trigger.removeEventListener("mouseenter", onEnter);
      trigger.removeEventListener("mouseleave", onLeave);
    }
    tl?.kill();
    tl = null;
    delete (el as Splittable)._setLinkText;
    revertSplit(label);
    revertSplit(shadow);
  };
}

export function initLinks(): Cleanup {
  const inners = qa<HTMLElement>(".link-inner");
  if (inners.length === 0 || prefersReduced()) return () => {};
  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    const cleanups = inners.map(bindLink);
    return () => {
      cleanups.forEach((fn) => fn());
    };
  });
  return () => {
    mm.revert();
  };
}
