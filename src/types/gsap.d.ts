declare module "gsap/all" {
  const gsap: any;
  namespace gsap {
    namespace core {
      const Tween: any;
      const Timeline: any;
      const PropTween: any;
      const Animation: any;
    }
    export const registerPlugin: any;
    export const to: any;
    export const from: any;
    export const fromTo: any;
    export const set: any;
    export const killTweensOf: any;
    export const quickTo: any;
    export const quickSetter: any;
    export const matchMedia: any;
    export const ticker: any;
    export const utils: any;
    export const config: any;
    export const defaults: any;
    export const getProperty: any;
    export const setDefaults: any;
    export const registerEffect: any;
    export const registerPlugin: any;
  }
  export default gsap;
  export { gsap };
  export const ScrollTrigger: any;
  export const SplitText: any;
  export const Draggable: any;
  export const InertiaPlugin: any;
  export const CustomEase: any;
  export const MorphSVGPlugin: any;
  export const CSSPlugin: any;
  export const Observer: any;
}

declare module "gsap/CustomEase" {
  const CustomEase: any;
  export { CustomEase };
  export default CustomEase;
}
