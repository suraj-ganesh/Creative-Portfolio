import { DUR, gsap, isDesktop, q, qa } from "@/lib/fx/core";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";

/**
 * First-visit preloader sequence, ported from legacy `initPreloader`.
 * Order: progress bar + 0-100 counter (~4s max, finishes early on window
 * load) -> [data-preloader="text-1|text-2"] reveals -> flies
 * [data-nav="grid|button"] in -> hides overlay chrome -> starts lenis.
 */

const EXCLUDED_NAMESPACES = new Set(["error-404", "demo"]);
const MAX_DURATION = 4;

let settled = false;
let pending: Promise<void> | null = null;

export function runPreloader(): Promise<void> {
  if (settled) return Promise.resolve();
  pending ??= start();
  return pending;
}

function namespace(): string | null {
  // Pages stamp <main data-page="..."> (home/works/contact/archive/error-404/slug).
  // Falls back to the path so the home branch works even without the marker.
  const marked = q("[data-page]")?.getAttribute("data-page") ?? null;
  if (marked) return marked;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/") return "home";
  return path;
}

function showStatic(els: Element[]): void {
  if (els.length) gsap.set(els, { visibility: "visible", opacity: 1 });
}

async function start(): Promise<void> {
  const hooks = qa("[data-preloader]");
  if (hooks.length === 0) {
    settled = true;
    return;
  }

  // Excluded pages (404/demo): hide preloader chrome, resolve.
  if (namespace() !== null && EXCLUDED_NAMESPACES.has(namespace() as string)) {
    gsap.set(hooks, { display: "none" });
    lenisStart();
    settled = true;
    return;
  }

  const progress = q<HTMLElement>('[data-preloader="progress"]');
  const count = q<HTMLElement>('[data-preloader="count"]');
  const text1 = q<HTMLElement>('[data-preloader="text-1"]');
  const text2s = qa<HTMLElement>('[data-preloader="text-2"]');
  const texts = [text1, ...text2s].filter(
    (el): el is HTMLElement => el !== null,
  );
  const navGrid = q<HTMLElement>('[data-nav="grid"]');
  const navButton = q<HTMLElement>('[data-nav="button"]');
  const stickyNames = qa<HTMLElement>("[data-sticky-name]");

  // Missing progress/count hooks: nothing to animate; show content, resolve.
  if (!progress || !count) {
    showStatic(texts);
    if (navGrid) gsap.set(navGrid, { visibility: "visible", x: 0, y: 0 });
    if (navButton) gsap.set(navButton, { visibility: "visible", x: 0, y: 0 });
    showStatic(stickyNames);
    lenisStart();
    settled = true;
    return;
  }

  // Reduced motion: everything visible instantly, resolve.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(progress, {
      visibility: "visible",
      height: "100%",
      opacity: 1,
    });
    gsap.set(count, { visibility: "visible", opacity: 0 });
    showStatic(texts);
    if (navGrid) gsap.set(navGrid, { visibility: "visible", x: 0, y: 0 });
    if (navButton) gsap.set(navButton, { visibility: "visible", x: 0, y: 0 });
    showStatic(stickyNames);
    lenisStart();
    settled = true;
    window.dispatchEvent(new CustomEvent("lenis:settled"));
    return;
  }

  const isHome = namespace() === "home";
  const off = isDesktop() ? 5 : 25;

  lenisStop();
  gsap.set([count, ...texts], { visibility: "visible", opacity: 1 });
  gsap.set(progress, { visibility: "visible", height: "0%" });
  if (navGrid)
    gsap.set(navGrid, { visibility: "visible", x: `-${off}vw`, y: `-${off}vw` });
  if (navButton)
    gsap.set(navButton, {
      visibility: "visible",
      x: `${off}vw`,
      y: `-${off}vw`,
    });
  gsap.fromTo(
    texts,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: DUR.S, ease: "power3.out" },
  );

  await new Promise<void>((resolve) => {
    let finished = false;
    const state = { value: 0 };
    const render = () => {
      count.textContent = `${Math.round(state.value)}%`;
      gsap.set(progress, { height: `${state.value}%` });
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("load", onLoad);
      tween?.kill();

      // Texts -> nav fly-in -> done.
      gsap.to(count, { autoAlpha: 0, duration: DUR.S, ease: "power2.in" });
      if (navGrid)
        gsap.to(navGrid, { x: 0, y: 0, duration: DUR.M, ease: "power3.out" });
      if (navButton)
        gsap.to(navButton, { x: 0, y: 0, duration: DUR.M, ease: "power3.out" });
      if (stickyNames.length) showStatic(stickyNames);

      const done = () => {
        // Legacy parity: home keeps progress + texts visible (they ARE the
        // hero); only the counter hides. Other pages fade texts + progress
        // (opacity only, never display:none — the layout underneath persists).
        gsap.to(count, { autoAlpha: 0, duration: DUR.S, ease: "power2.in" });
        if (!isHome && texts.length)
          gsap.to(texts, { autoAlpha: 0, duration: DUR.S, ease: "power2.in" });
        if (!isHome)
          gsap.to(progress, {
            opacity: 0,
            duration: DUR.S,
            delay: DUR.S,
            ease: "power2.in",
          });
        lenisStart();
        settled = true;
        window.dispatchEvent(new CustomEvent("lenis:settled"));
        resolve();
      };

      // Counter + nav fly-in, then done (legacy: durS + half stagger).
      gsap.delayedCall(DUR.S + 0.5 * DUR.STAGGER, done);
    };
    const onLoad = () => {
      tween?.kill();
      tween = gsap.to(state, {
        value: 100,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: render,
        onComplete: finish,
      });
    };
    let tween: gsap.core.Tween | null = gsap.to(state, {
      value: 100,
      duration: MAX_DURATION,
      ease: "power2.inOut",
      onUpdate: render,
      onComplete: finish,
    });
    // Safety: the page init gates on this promise — never hang longer than
    // the max progress run plus the finish beat.
    window.setTimeout(finish, MAX_DURATION * 1000 + 3000);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  });
}
