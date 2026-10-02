import {
  gsap,
  DESKTOP_QUERY,
  prefersReduced,
  qa,
  type Cleanup,
} from "@/lib/fx/core";

/**
 * 3D tilt on [data-tilt="wrap"] > [data-tilt="card"].
 * Mirrors legacy initTiltCursor: transformPerspective 1000, preserve-3d,
 * rotationX range +/-25, rotationY range +/-40, quickTo 0.6s power3.out,
 * reset to 0 on mouseleave, desktop only.
 */
const MAX_ROTATION_X = 25;
const MAX_ROTATION_Y = 40;

export function initTiltCursor(scope: ParentNode = document): Cleanup {
  const wraps = qa<HTMLElement>('[data-tilt="wrap"]', scope);
  if (wraps.length === 0 || prefersReduced()) return () => {};

  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    const cleanups: Cleanup[] = [];
    wraps.forEach((wrap) => {
      const card = wrap.querySelector<HTMLElement>('[data-tilt="card"]');
      if (!card) return;
      gsap.set(card, {
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      });
      const toRotationX = gsap.quickTo(card, "rotationX", {
        duration: 0.6,
        ease: "power3.out",
      });
      const toRotationY = gsap.quickTo(card, "rotationY", {
        duration: 0.6,
        ease: "power3.out",
      });
      const onMouseMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        toRotationY(gsap.utils.mapRange(0, 1, -MAX_ROTATION_Y, MAX_ROTATION_Y, px));
        toRotationX(gsap.utils.mapRange(0, 1, MAX_ROTATION_X, -MAX_ROTATION_X, py));
      };
      const onMouseLeave = () => {
        toRotationX(0);
        toRotationY(0);
      };
      wrap.addEventListener("mousemove", onMouseMove);
      wrap.addEventListener("mouseleave", onMouseLeave);
      cleanups.push(() => {
        wrap.removeEventListener("mousemove", onMouseMove);
        wrap.removeEventListener("mouseleave", onMouseLeave);
        gsap.set(card, { clearProps: "transform" });
      });
    });
    return () => {
      cleanups.forEach((fn) => fn());
    };
  });

  return () => {
    mm.revert();
  };
}
