import { DUR, gsap, isDesktop, q, qa, type Cleanup } from "@/lib/fx/core";

/**
 * Nav dropdown + indicators, ported from legacy `initNavDropdown` and
 * `updateNavIndicators`. Legacy does NOT stop lenis for the menu, so neither
 * do we. Route changes close the menu via `closeMenu()` (also exposed as
 * `window.closeMenu` for legacy compat) plus popstate/link-click hooks.
 */

declare global {
  interface Window {
    closeMenu?: () => void;
  }
}

let activeClose: (() => void) | null = null;

/** Close the open nav menu, if any. Safe to call when closed. */
export function closeMenu(): void {
  activeClose?.();
}

const normalizePath = (pathname: string): string =>
  pathname.replace(/\/$/, "") || "/";

export function updateNavIndicators(): void {
  const current = normalizePath(window.location.pathname);
  qa('[data-nav="link"]').forEach((link) => {
    const indicator = link.querySelector('[data-nav="indicator"]');
    if (!indicator) return;
    const href = (link as HTMLAnchorElement).href;
    if (!href) return;
    let path: string;
    try {
      path = normalizePath(new URL(href, window.location.origin).pathname);
    } catch {
      return;
    }
    const isCurrent =
      path === "/" ? current === "/" : current === path || current.startsWith(`${path}/`);
    indicator.classList.toggle("is-current", isCurrent);
  });
}

export function initNav(): Cleanup {
  const cleanups: Cleanup[] = [];
  const on = <K extends keyof WindowEventMap>(
    type: K,
    fn: (ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void => {
    window.addEventListener(type, fn, options);
    cleanups.push(() => window.removeEventListener(type, fn, options));
  };

  updateNavIndicators();
  on("popstate", () => {
    closeMenu();
    updateNavIndicators();
  });

  const buttons = qa<HTMLElement>('[data-nav="button"]');
  const group = q<HTMLElement>('[data-nav="link-group"]');
  if (buttons.length === 0 || !group) return () => cleanups.forEach((fn) => fn());

  const links = Array.from(group.querySelectorAll<HTMLElement>('[data-nav="link"]'));
  if (links.length === 0) return () => cleanups.forEach((fn) => fn());

  const archive = group.querySelector<HTMLElement>('[data-nav-link="archive"]');
  const mobile = () => !isDesktop();
  const hiddenClip = () =>
    mobile() ? "inset(0% 0% 0% 100%)" : "inset(0% 0% 100% 0%)";
  const shownClip = "inset(0% 0% 0% 0%)";
  const visibleLinks = () =>
    mobile() && archive ? links.filter((link) => link !== archive) : links;

  gsap.set(group, { display: "none" });
  gsap.set(visibleLinks(), { clipPath: hiddenClip() });
  if (archive) gsap.set(archive, { yPercent: 100 });

  const setLabel = (text: string): void => {
    buttons.forEach((button) => {
      const inners = button.querySelectorAll(".link-inner");
      const scopes: Element[] =
        inners.length > 0 ? Array.from(inners) : [button];
      scopes.forEach((scope) => {
        scope
          .querySelectorAll('[data-nav="label"]')
          .forEach((label) => {
            label.textContent = text;
          });
      });
    });
  };

  let open = false;
  let tl: gsap.core.Timeline | null = null;
  let anchorY = window.scrollY;

  const kill = (): void => {
    tl?.kill();
    tl = null;
    gsap.killTweensOf(
      [...links, ...(archive ? [archive] : []), group].filter(Boolean),
    );
  };

  const doClose = (): void => {
    if (!open) return;
    open = false;
    setLabel("Menu");
    kill();
    const targets = visibleLinks();
    tl = gsap.timeline();
    if (archive)
      tl.to(archive, { yPercent: 100, duration: DUR.S, ease: "power2.in" }, 0);
    tl
      .to(
        targets,
        {
          clipPath: hiddenClip(),
          duration: DUR.S,
          ease: "power2.in",
          stagger: { each: DUR.STAGGER, from: mobile() ? "end" : "start" },
        },
        0,
      )
      .set(group, { display: "none" });
  };

  const doOpen = (): void => {
    open = true;
    anchorY = window.scrollY;
    setLabel("Close");
    kill();
    const targets = visibleLinks();
    tl = gsap.timeline();
    tl.set(group, { display: "flex" });
    tl.to(targets, {
      clipPath: shownClip,
      duration: DUR.M,
      ease: "power3.out",
      overwrite: "auto",
      stagger: {
        amount: DUR.STAGGER * targets.length,
        from: mobile() ? "start" : "end",
      },
    });
    if (archive)
      tl.to(
        archive,
        { yPercent: 0, duration: DUR.M, ease: "power3.out", overwrite: "auto" },
        `-=${0.5 * DUR.M}`,
      );
  };

  activeClose = doClose;
  window.closeMenu = closeMenu;
  cleanups.push(() => {
    if (activeClose === doClose) activeClose = null;
    if (window.closeMenu === closeMenu) delete window.closeMenu;
  });

  buttons.forEach((button) => {
    const toggle = (e: Event) => {
      e.stopPropagation();
      if (open) doClose();
      else doOpen();
    };
    button.addEventListener("click", toggle);
    cleanups.push(() => button.removeEventListener("click", toggle));
  });

  links.forEach((link) => {
    const onLink = () => doClose();
    link.addEventListener("click", onLink);
    cleanups.push(() => link.removeEventListener("click", onLink));
  });

  on(
    "scroll",
    () => {
      if (open && Math.abs(window.scrollY - anchorY) > 10) doClose();
    },
    { passive: true },
  );

  return () => {
    doClose();
    tl?.kill();
    tl = null;
    cleanups.forEach((fn) => fn());
  };
}
