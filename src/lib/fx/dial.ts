import {
  gsap,
  Draggable,
  InertiaPlugin,
  DUR,
  DESKTOP_QUERY,
  prefersReduced,
  q,
  qa,
  type Cleanup,
  noopCleanup,
} from "@/lib/fx/core";
import { requestThemeMode, type ThemeMode } from "@/lib/theme";

/**
 * Contact-page rotary dial.
 *
 * Merges legacy `initContactDial` (hover readout: dual text buffers, logo
 * fade, per-kind labels) with legacy `initDialOverlay` (Draggable rotation on
 * the overlay, bounded 0–60°, finger-stop decor counter-rotation, snap back
 * to 0 on release). Rotation math is preserved verbatim; inertia and
 * pointer-based nearest-item readout are added per the native spec.
 */

// Verified against the bundle: initContactDial uses the "(min-width: 992px)"
// literal and initDialOverlay uses `breakPoint` = 992.
const MAX_ROTATION = 60; // legacy `o`
const DECOR_SWING = -5; // legacy `i`
const HIDE_DELAY = 100; // legacy mouseleave grace period
const CLICK_SUPPRESS_MS = 150; // ignore clicks right after a drag
const THROW_VELOCITY_MIN = 20; // deg/s — below this there is no throw to wait for

const LABELS: Record<string, string> = {
  theme: "change theme",
  email: "send email",
  instagram: "open instagram",
  behance: "open behance",
  linkedin: "open linkedin",
};

const THEME_MODES: ReadonlySet<string> = new Set([
  "base",
  "1",
  "2",
  "3",
  "4",
]);

function isThemeMode(v: string | null): v is ThemeMode {
  return v !== null && THEME_MODES.has(v);
}

export function initContactDial(scope: ParentNode = document): Cleanup {
  const wrap =
    scope instanceof Element &&
    scope.matches('[data-contact-dial="wrap"]')
      ? (scope as HTMLElement)
      : q<HTMLElement>('[data-contact-dial="wrap"]', scope);
  if (!wrap) return noopCleanup;

  const overlay =
    q<HTMLElement>('[data-contact-dial="overlay"]', wrap) ??
    q<HTMLElement>('[data-contact-dial="overlay"]', scope);
  const decor =
    wrap.querySelector<HTMLElement>(".dial-decor") ??
    q<HTMLElement>(".dial-decor", scope);
  const text = q<HTMLElement>('[data-contact-dial="text"]', wrap);
  const logo = q<HTMLElement>('[data-contact-dial="logo"]', wrap);
  const items = qa<HTMLElement>("[data-contact-dial-item]", wrap);

  const reduced = prefersReduced();
  const cleanups: Cleanup[] = [];
  let dead = false;

  // ------------------------------------------------------------------
  // Center readout (legacy hover behavior). The mm context owns the ghost
  // buffer + hover listeners; `labels` lets the rotation drag drive the
  // same readout while dragging on any viewport.
  // ------------------------------------------------------------------
  let labels: { show: (kind: string) => void; hide: () => void } | null = null;

  if (text && logo && items.length > 0) {
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_QUERY, () => {
      const parent = text.parentNode as HTMLElement | null;
      if (!parent) return undefined;
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      const ghost = text.cloneNode(false) as HTMLElement;
      ghost.removeAttribute("data-contact-dial");
      parent.appendChild(ghost);
      const buffers = [text, ghost];
      buffers.forEach((el) =>
        gsap.set(el, {
          display: "block",
          position: "absolute",
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 0,
          pointerEvents: "none",
        }),
      );

      let shown: HTMLElement | null = null;
      let activeKind: string | null = null;
      let hovering = false;
      let hideTimer: ReturnType<typeof setTimeout> | null = null;

      const fadeIn = (el: HTMLElement) => {
        if (reduced) gsap.set(el, { autoAlpha: 1 });
        else {
          requestAnimationFrame(() => {
            if (!dead)
              gsap.to(el, {
                autoAlpha: 1,
                duration: DUR.M,
                ease: "InOut",
                overwrite: "auto",
              });
          });
        }
      };
      const fadeOut = (el: HTMLElement) => {
        if (reduced) gsap.set(el, { autoAlpha: 0 });
        else
          gsap.to(el, {
            autoAlpha: 0,
            duration: DUR.M,
            ease: "InOut",
            overwrite: "auto",
          });
      };
      const fadeLogo = (opacity: number) => {
        if (reduced) gsap.set(logo, { opacity });
        else
          gsap.to(logo, {
            opacity,
            duration: DUR.S,
            ease: "InOut",
            overwrite: "auto",
          });
      };

      const api = {
        show: (kind: string) => {
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
          hovering = true;
          if (kind === activeKind && shown) return;
          activeKind = kind;
          const next = shown === buffers[0] ? buffers[1] : buffers[0];
          if (shown) fadeOut(shown);
          next.textContent = LABELS[kind] ?? "";
          fadeIn(next);
          shown = next;
          fadeLogo(0);
        },
        hide: () => {
          hovering = false;
          activeKind = null;
          if (shown) {
            fadeOut(shown);
            shown = null;
          }
          fadeLogo(1);
        },
      };
      labels = api;

      const enterHandlers = new Map<Element, () => void>();
      const leaveHandlers = new Map<Element, (e: MouseEvent) => void>();
      items.forEach((item) => {
        const kind = item.getAttribute("data-contact-dial-item") ?? "";
        const onEnter = () => {
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
          api.show(kind);
        };
        const onLeave = (e: MouseEvent) => {
          const to = e.relatedTarget as Node | null;
          const overItem = items.some(
            (it) => it === to || (to !== null && it.contains(to)),
          );
          const center = wrap.querySelector(".dial-center");
          const overCenter =
            !!center &&
            (center === to || (to !== null && center.contains(to)));
          const overBuffer = buffers.some(
            (b) => b === to || (to !== null && b.contains(to)),
          );
          if (overItem || overCenter || overBuffer) return;
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            hideTimer = null;
            if (!hovering) return;
            api.hide();
          }, HIDE_DELAY);
        };
        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave as EventListener);
        enterHandlers.set(item, onEnter);
        leaveHandlers.set(item, onLeave);
      });

      return () => {
        labels = null;
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        items.forEach((item) => {
          const onEnter = enterHandlers.get(item);
          const onLeave = leaveHandlers.get(item);
          if (onEnter) item.removeEventListener("mouseenter", onEnter);
          if (onLeave)
            item.removeEventListener("mouseleave", onLeave as EventListener);
        });
        buffers.forEach((el) => gsap.killTweensOf(el));
        ghost.remove();
        gsap.set([text, logo], { clearProps: "all" });
        if (parent.style.position === "relative") parent.style.position = "";
      };
    });
    cleanups.push(() => mm.revert());
  }

  // ------------------------------------------------------------------
  // Theme items are buttons; email/social items are plain links and get
  // no handlers. Works on desktop + mobile.
  // ------------------------------------------------------------------
  let suppressClick = false;
  let suppressTimer: ReturnType<typeof setTimeout> | null = null;
  const themePairs: { item: HTMLElement; onClick: (e: MouseEvent) => void }[] =
    [];
  items.forEach((item) => {
    if (item.getAttribute("data-contact-dial-item") !== "theme") return;
    if (item.tagName === "A") return; // plain link — never hijack
    const onClick = () => {
      if (suppressClick || dead) return;
      const dot =
        item.querySelector("[data-theme-mode]") ??
        (item.matches("[data-theme-mode]") ? item : null);
      const mode = dot?.getAttribute("data-theme-mode") ?? null;
      if (isThemeMode(mode)) requestThemeMode(mode);
    };
    item.addEventListener("click", onClick);
    themePairs.push({ item, onClick });
  });
  cleanups.push(() => {
    themePairs.forEach(({ item, onClick }) =>
      item.removeEventListener("click", onClick),
    );
    if (suppressTimer) {
      clearTimeout(suppressTimer);
      suppressTimer = null;
    }
  });

  // ------------------------------------------------------------------
  // Rotary drag on the overlay (legacy rotation math + inertia + snap).
  // Active on all viewports (touch included); skipped for reduced motion.
  // ------------------------------------------------------------------
  if (overlay && !reduced) {
    gsap.set(overlay, { rotation: 0, transformOrigin: "50% 50%" });
    if (decor) gsap.set(decor, { rotation: 0, transformOrigin: "50% 50%" });

    let pressRotation = 0;
    let moved = false;

    const applyRotation = (rot: number) => {
      wrap.style.setProperty("--dial-rot", `${rot}deg`);
      if (decor) gsap.set(decor, { rotation: (rot / MAX_ROTATION) * DECOR_SWING });
    };

    const highlightNearest = (px: number, py: number) => {
      if (!labels || !items.length) return;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height / 2);
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = item;
        }
      });
      if (best)
        labels.show(
          (best as HTMLElement).getAttribute("data-contact-dial-item") ?? "",
        );
    };

    const snapBack = (drag: Draggable) => {
      const target = drag.target as Element;
      gsap.to(target, {
        rotation: 0,
        duration: DUR.M,
        ease: "Out",
        overwrite: "auto",
        onUpdate: () => {
          const r = Number(gsap.getProperty(target, "rotation")) || 0;
          applyRotation(r);
        },
        onComplete: () => applyRotation(0),
      });
      labels?.hide();
      if (moved) {
        suppressClick = true;
        if (suppressTimer) clearTimeout(suppressTimer);
        suppressTimer = setTimeout(() => {
          suppressClick = false;
          suppressTimer = null;
        }, CLICK_SUPPRESS_MS);
      }
      moved = false;
    };

    const created = Draggable.create(overlay, {
      type: "rotation",
      inertia: true,
      bounds: { minRotation: 0, maxRotation: MAX_ROTATION },
      onPress: function (this: Draggable) {
        pressRotation = this.rotation;
        moved = false;
        gsap.killTweensOf(this.target);
        if (decor) gsap.killTweensOf(decor);
      },
      onDrag: function (this: Draggable) {
        if (Math.abs(this.rotation - pressRotation) > 2) moved = true;
        applyRotation(this.rotation);
        highlightNearest(this.pointerX, this.pointerY);
      },
      onDragEnd: function (this: Draggable) {
        // With inertia the throw continues after this; snapping now would
        // kill it, so only snap immediately when there is no throw coming.
        const v = InertiaPlugin.getVelocity(
          this.target as Element,
          "rotation",
        );
        if (!this.isThrowing && Math.abs(v) < THROW_VELOCITY_MIN)
          snapBack(this);
      },
      onThrowUpdate: function (this: Draggable) {
        applyRotation(this.rotation);
      },
      onThrowComplete: function (this: Draggable) {
        snapBack(this);
      },
    });
    const drag = created[0];

    cleanups.push(() => {
      if (suppressTimer) {
        clearTimeout(suppressTimer);
        suppressTimer = null;
      }
      drag?.kill();
      gsap.killTweensOf(overlay);
      if (decor) gsap.killTweensOf(decor);
      gsap.set(overlay, { clearProps: "transform" });
      if (decor) gsap.set(decor, { clearProps: "transform" });
      wrap.style.removeProperty("--dial-rot");
    });
  }

  return () => {
    if (dead) return;
    dead = true;
    // Run in reverse so rotation teardown precedes label teardown.
    for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
  };
}
