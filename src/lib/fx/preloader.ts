import { DUR, gsap, isDesktop, q, qa, fxStatus } from "@/lib/fx/core";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";
import { waitForLoaderDone } from "@/lib/loaderGate";

/**
 * First-visit preloader sequence, ported from legacy `initPreloader`.
 * Order: wait for the initial loading cover (InitialLoader 1-100%, videos +
 * window load + webfonts) -> progress bar + brisk 0-100 count (home) ->
 * serial hero cascade: logo morph (via initReveals) -> role line ->
 * location lines -> name/texts (data-reveal-delay) -> menu -> lever ->
 * hides overlay chrome -> starts lenis.
 *
 * Gating on the loader means no content or intro animation is shown until
 * loading has actually completed. Non-home pages keep the legacy
 * load-paced count with texts rising alongside it.
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
  // Never reveal or animate anything until the initial loading cover has
  // reached 100% (videos buffered, window loaded, fonts ready). Hard
  // timeout inside the gate so this can never hang the boot sequence.
  await waitForLoaderDone();

  const hooks = qa("[data-preloader]");
  const ns = namespace();
  fxStatus().preloader = `hooks=${hooks.length} ns=${ns}`;
  if (hooks.length === 0) {
    settled = true;
    return;
  }

  // Excluded pages (404/demo): hide preloader chrome, resolve.
  if (ns !== null && EXCLUDED_NAMESPACES.has(ns as string)) {
    fxStatus().preloader += " excluded";
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
    fxStatus().preloader += ` no-${!progress ? "progress" : "count"}`;
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
    fxStatus().preloader += " os-reduced-motion";
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
  gsap.set(count, { visibility: "visible", opacity: 1 });
  gsap.set(progress, { visibility: "visible", height: "0%" });
  if (navGrid)
    gsap.set(navGrid, { visibility: "visible", x: `-${off}vw`, y: `-${off}vw` });
  if (navButton)
    gsap.set(navButton, {
      visibility: "visible",
      x: `${off}vw`,
      y: `-${off}vw`,
    });
  // Serial entrance: role line first, then the location/agency lines.
  const rise = { autoAlpha: 1, y: 0, duration: DUR.S, ease: "power3.out" } as const;
  const hiddenRise = { autoAlpha: 0, y: 12 } as const;
  if (!isHome) {
    gsap.set(texts, { visibility: "visible", opacity: 1 });
    if (text1) gsap.fromTo(text1, hiddenRise, rise);
    text2s.forEach((el, i) =>
      gsap.fromTo(
        el,
        hiddenRise,
        { ...rise, delay: 0.14 * (i + 1) },
      ),
    );
  } else {
    // Home: the role/location lines stay staged (hidden) during the count
    // and join the serial hero cascade in finish() — logo morph first,
    // then the line, then name/texts, then menu, then lever.
    if (text1) gsap.set(text1, { visibility: "visible", ...hiddenRise });
    text2s.forEach((el) => gsap.set(el, { visibility: "visible", ...hiddenRise }));
  }

  await new Promise<void>((resolve) => {
    let finished = false;
    const state = { value: 0 };
    // First visit must always show a real count-up: never rush to 100%
    // faster than this, even on instant window load (production loads so
    // fast the counter would otherwise flash by unseen).
    const MIN_COUNT_S = 2.4;
    const countStartedAt = performance.now();
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
      if (!isHome) {
        if (navGrid)
          gsap.to(navGrid, { x: 0, y: 0, duration: DUR.M, ease: "power3.out" });
        if (navButton)
          gsap.to(navButton, { x: 0, y: 0, duration: DUR.M, ease: "power3.out" });
      }
      // Home: role/location lines, menu and lever are driven serially by
      // the hero-intro master timeline (logo -> line -> name -> texts ->
      // menu -> lever), which starts from initPage right below.
      if (stickyNames.length) showStatic(stickyNames);

      const done = () => {
        fxStatus().preloader += " full-run";
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

      // Counter + nav fly-in, then done. Home waits out the loading-cover
      // fade (≈0.6s) so the logo morph starts on a fully revealed page.
      gsap.delayedCall(isHome ? 0.65 : DUR.S + 0.5 * DUR.STAGGER, done);
    };
    // Home already waited for window load + videos + fonts behind the
    // loader gate: brisk count-up beat, then straight into the cascade.
    // Other pages keep the legacy load-paced run.
    const HOME_COUNT_S = 1.0;
    let tween: gsap.core.Tween | null = null;
    if (isHome) {
      tween = gsap.to(state, {
        value: 100,
        duration: HOME_COUNT_S,
        ease: "power2.inOut",
        onUpdate: render,
        onComplete: finish,
      });
      window.setTimeout(finish, HOME_COUNT_S * 1000 + 3000);
      return;
    }
    const onLoad = () => {
      tween?.kill();
      // Stretch the catch-up run so the count-up stays visible for at
      // least MIN_COUNT_S from the moment counting started.
      const elapsedS = (performance.now() - countStartedAt) / 1000;
      tween = gsap.to(state, {
        value: 100,
        duration: Math.max(0.6, MIN_COUNT_S - elapsedS),
        ease: "power2.out",
        onUpdate: render,
        onComplete: finish,
      });
    };
    tween = gsap.to(state, {
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
