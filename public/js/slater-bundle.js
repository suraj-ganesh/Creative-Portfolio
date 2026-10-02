function isExcludedPage() {
  const e = window.location.pathname.replace(/\/$/, "") || "/";
  if (EXCLUDED_PATHS.some((t) => e === t || e.startsWith(t + "/"))) return !0;
  const t = document.querySelector("[data-barba-namespace]")?.dataset
    .barbaNamespace;
  return EXCLUDED_PAGES_NS.includes(t);
}
function getSocket() {
  return (_socket || (_socket = io(SOCKET_URL)), _socket);
}
function runPageReveals() {
  window.__revealsPending &&
    (window.__transitionRunning ||
      window.__preloaderRunning ||
      ((window.__revealsPending = !1),
      initElementsReveal(),
      initLogoMorph(),
      initFluidReveal(),
      initOrbitTiles()));
}
function initPreloader(e = document) {
  if (isExcludedPage()) {
    ((window.__preloaderState.done = !0),
      (window.__preloaderState.startPage = null),
      (window.__preloaderRunning = !1));
    const t = e.querySelector('[data-nav="grid"]'),
      n = e.querySelector('[data-nav="button"]'),
      o = e.querySelectorAll("[data-sticky-name]"),
      i = e.querySelectorAll("[data-preloader]");
    return (
      i.length && gsap.set(i, { display: "none" }),
      t && gsap.set(t, { visibility: "visible", x: 0, y: 0 }),
      n && gsap.set(n, { visibility: "visible", x: 0, y: 0 }),
      o.length && gsap.set(o, { visibility: "visible" }),
      lenis.start(),
      void window.dispatchEvent(new CustomEvent("lenis:settled"))
    );
  }
  const t = e.querySelector('[data-preloader="progress"]'),
    n = e.querySelector('[data-preloader="count"]'),
    o = e.querySelector('[data-preloader="text-1"]'),
    i = [...e.querySelectorAll('[data-preloader="text-2"]')];
  if (!t || !n) return;
  const r = e.querySelector("[data-barba-namespace]")?.dataset.barbaNamespace,
    a = "home" === r,
    s = [n, o, ...i].filter(Boolean),
    l = e.querySelector('[data-nav="grid"]'),
    c = e.querySelector('[data-nav="button"]'),
    d = e.querySelectorAll("[data-sticky-name]");
  if (window.__preloaderState.done)
    return (
      gsap.set([o, ...i].filter(Boolean), {
        visibility: "visible",
        opacity: 1,
      }),
      gsap.set(n, { visibility: "visible", opacity: 0 }),
      void gsap.set(t, { visibility: "visible", height: "100%", opacity: 1 })
    );
  ((window.__preloaderState.startPage = r),
    (window.__preloaderRunning = !0),
    lenis.stop(),
    gsap.set(s, { visibility: "visible", opacity: 1 }),
    gsap.set(t, { visibility: "visible" }));
  const u = window.matchMedia("(max-width: 991px)").matches ? 25 : 5;
  (l && gsap.set(l, { visibility: "visible", x: `-${u}vw`, y: `-${u}vw` }),
    c && gsap.set(c, { visibility: "visible", x: `${u}vw`, y: `-${u}vw` }),
    animateTextReveal(n, "reveal", 0),
    o && animateTextReveal(o, "reveal", 0),
    i.length && animateTextReveal(i, "reveal", 0));
  const p = n._split?.lines?.[0];
  (gsap.to(t, { height: "100%", duration: 4, ease: "InOut" }),
    gsap.to(
      { value: 0 },
      {
        value: 100,
        duration: 2,
        ease: "InOut",
        onUpdate() {
          p && (p.textContent = `${Math.round(this.targets()[0].value)}%`);
        },
        onComplete() {
          (animateTextReveal(n, "hide", 0),
            l && gsap.to(l, { x: 0, y: 0, duration: durM, ease: "Out" }),
            c && gsap.to(c, { x: 0, y: 0, duration: durM, ease: "Out" }),
            d.length &&
              (gsap.set(d, { visibility: "visible" }),
              animateTextReveal(d, "reveal", 0)),
            (window.__preloaderState.done = !0),
            a
              ? gsap.delayedCall(durS + 0.5 * stagger, () => {
                  ((window.__preloaderRunning = !1),
                    (window.__preloaderState.homeHandled = !0),
                    lenis.start(),
                    runPageReveals(),
                    window.dispatchEvent(new CustomEvent("lenis:settled")));
                })
              : (o && animateTextReveal(o, "hide", 0),
                i.length && animateTextReveal(i, "hide", 0),
                gsap.to(t, { opacity: 0, duration: durS, delay: durS }),
                gsap.delayedCall(durS + 0.5 * stagger, () => {
                  ((window.__preloaderRunning = !1),
                    lenis.start(),
                    runPageReveals(),
                    window.dispatchEvent(new CustomEvent("lenis:settled")));
                })));
        },
      },
    ));
}
function initCustomScrollbar() {
  const e = document.querySelector(".scrollbar-wrap"),
    t = e?.querySelector(".scrollbar-thumb");
  if (!e || !t) return;
  window._destroyCustomScrollbar && window._destroyCustomScrollbar();
  let n = gsap.matchMedia();
  (n.add(`(min-width: ${breakPoint}px)`, () => {
    function n(t) {
      k !== t &&
        ((k = t),
        gsap.to(e, { autoAlpha: t ? 0 : 1, duration: 0.3, overwrite: "auto" }));
    }
    function o() {
      (clearTimeout(S),
        (S = setTimeout(() => {
          E || _ || M || n(!0);
        }, A)));
    }
    function i() {
      M || (n(!1), o());
    }
    function r() {
      return (
        (M = !lenis || lenis.limit <= 0 || lenis.isStopped),
        M && (clearTimeout(S), n(!0)),
        M
      );
    }
    function a() {
      ((b = e.clientHeight), r() || ((w = t.offsetHeight), s()));
    }
    function s() {
      if (!lenis || lenis.limit <= 0) return;
      const e = gsap.utils.clamp(0, 1, lenis.scroll / lenis.limit) * (b - w);
      E ? gsap.set(t, { y: e }) : L(e);
    }
    function l() {
      window.__transitionRunning || (r(), M || i(), E || s());
    }
    function c(n, o) {
      const i = e.getBoundingClientRect(),
        r = parseFloat(getComputedStyle(e).paddingTop) || 0,
        a = gsap.utils.clamp(0, b - w, n - i.top - r - x),
        s = b - w > 0 ? a / (b - w) : 0;
      (gsap.set(t, { y: a }),
        lenis.scrollTo(s * lenis.limit, { immediate: o }));
    }
    function d(e) {
      if (window.__transitionRunning) return;
      if (k) return;
      ((E = !0), clearTimeout(S));
      const n = gsap.getProperty(t, "y");
      L(n, n);
      const o = t.getBoundingClientRect();
      ((x = e.clientY - o.top),
        t.setPointerCapture(e.pointerId),
        document.documentElement.classList.add("is-scrollbar-dragging"),
        e.preventDefault());
    }
    function u(e) {
      E && c(e.clientY, !0);
    }
    function p(e) {
      if (!E) return;
      ((E = !1),
        t.releasePointerCapture(e.pointerId),
        document.documentElement.classList.remove("is-scrollbar-dragging"));
      const n = gsap.getProperty(t, "y");
      (L(n, n), o());
    }
    function m(e) {
      if (window.__transitionRunning) return;
      if (k) return;
      if (e.target === t || t.contains(e.target)) return;
      ((x = w / 2), c(e.clientY, !1));
      const n = gsap.getProperty(t, "y");
      (L(n, n), i());
    }
    function g() {
      ((_ = !0), M || (clearTimeout(S), n(!1)));
    }
    function f() {
      ((_ = !1), E || o());
    }
    function h() {
      (clearTimeout(T), (T = setTimeout(a, 150)));
    }
    function v() {
      a();
    }
    function y() {
      const e = M;
      (r(), e && !M && i());
    }
    let w = 0,
      b = 0,
      E = !1,
      _ = !1,
      x = 0,
      T = null,
      S = null,
      k = null,
      M = !1;
    const A = 1e3,
      L = gsap.quickTo(t, "y", { duration: 0.15, ease: "none" });
    return (
      lenis.on("scroll", l),
      t.addEventListener("pointerdown", d),
      t.addEventListener("pointermove", u),
      t.addEventListener("pointerup", p),
      t.addEventListener("pointercancel", p),
      e.addEventListener("pointerdown", m),
      e.addEventListener("pointerenter", g),
      e.addEventListener("pointerleave", f),
      window.addEventListener("resize", h),
      window.addEventListener("lenis:settled", v),
      gsap.ticker.add(y),
      a(),
      r() || n(!0),
      () => {
        (lenis.off("scroll", l),
          t.removeEventListener("pointerdown", d),
          t.removeEventListener("pointermove", u),
          t.removeEventListener("pointerup", p),
          t.removeEventListener("pointercancel", p),
          e.removeEventListener("pointerdown", m),
          e.removeEventListener("pointerenter", g),
          e.removeEventListener("pointerleave", f),
          window.removeEventListener("resize", h),
          window.removeEventListener("lenis:settled", v),
          gsap.ticker.remove(y),
          clearTimeout(T),
          clearTimeout(S),
          gsap.killTweensOf(e),
          document.documentElement.classList.remove("is-scrollbar-dragging"));
      }
    );
  }),
    (window._destroyCustomScrollbar = () => {
      (n.revert(), (window._destroyCustomScrollbar = null));
    }));
}
function initOnceFunctions() {
  onceFunctionsInitialized ||
    ((onceFunctionsInitialized = !0),
    initNavDropdown(),
    initCustomScrollbar(),
    initHaptics(),
    isExcludedPage() || initCursorTracker(),
    initMsgChannel());
}
function initBeforeEnterFunctions(e) {
  nextPage = e || document;
}
function initAfterEnterFunctions(e) {
  ((nextPage = e || document), initScripts());
}
function runPageOnceAnimation(e) {
  const t = gsap.timeline();
  return (
    t.call(
      () => {
        resetPage(e);
      },
      null,
      0,
    ),
    t
  );
}
function prepareForTransition(e, t) {
  const n = window.scrollY || 0;
  (hasScrollTrigger && ScrollTrigger.getAll().forEach((e) => e.kill(!1)),
    gsap.set(e, {
      position: "fixed",
      top: -n,
      left: 0,
      width: "100%",
      zIndex: 91,
      willChange: "opacity",
    }),
    gsap.set(t, { autoAlpha: 0, zIndex: 90 }),
    window.scrollTo(0, 0));
}
function settleAfterTransition(e, t) {
  (e
    .querySelectorAll('[data-globe="wrap"]')
    .forEach((e) => e._globeDestroy?.()),
    destroyFluidReveal(e),
    destroyInfiniteCanvas(e),
    e.remove(),
    gsap.set(t, { clearProps: "opacity,visibility,zIndex" }),
    (window.__transitionRunning = !1),
    hasLenis &&
      requestAnimationFrame(() => {
        (lenis.resize(),
          runPageReveals(),
          hasScrollTrigger && ScrollTrigger.refresh(),
          window.__preloaderRunning ||
            window.__holeIntroRunning ||
            lenis.start(),
          window.dispatchEvent(new CustomEvent("lenis:settled")));
      }));
}
function runPageLeaveAnimation(e, t) {
  ((window.__transitionRunning = !0), prepareForTransition(e, t));
  const n = gsap.timeline({
    onComplete: () => settleAfterTransition(e, t),
    onInterrupt: () => settleAfterTransition(e, t),
  });
  return reducedMotion
    ? (n.set(e, { autoAlpha: 0 }), n.set(t, { autoAlpha: 1 }), n)
    : (n.set(e, { filter: "blur(0px)" }, 0),
      n.to(
        e,
        { autoAlpha: 0, filter: "blur(24px)", duration: durM, ease: "InOut" },
        0,
      ),
      n.set(t, { filter: "blur(24px)" }, durM),
      n.to(
        t,
        { autoAlpha: 1, filter: "blur(0px)", duration: durM, ease: "InOut" },
        durM,
      ),
      n.set(t, { clearProps: "filter" }),
      n.set(e, { clearProps: "filter" }),
      n);
}
function initScripts() {
  (initLinks(),
    initThemeMode(),
    initTotemActivation(),
    initDevGrid(),
    initTiltCursor(),
    initStickyNameReveal(nextPage),
    initAwards(nextPage),
    initFeaturedHeadingWidth(nextPage),
    runPageReveals(),
    initWorksItemHover(nextPage),
    initContactDial(nextPage),
    initFilterTabs(nextPage),
    initGlobe(nextPage),
    initNextEntity(NEXT_ENTITY_COUNT),
    initCutList(nextPage),
    initFeaturedHeadingHeightMobile(nextPage),
    initInfiniteCanvas(nextPage),
    initFooterTime(nextPage),
    initFooterLogo(nextPage),
    initDialOverlay(nextPage),
    initTextRevealDemo(nextPage),
    initImageRevealDemo(nextPage));
}
function resetPage(e) {
  (window.scrollTo(0, 0),
    gsap.set(e, { clearProps: "position,top,left,right" }),
    !hasLenis ||
      window.__preloaderRunning ||
      window.__transitionRunning ||
      window.__holeIntroRunning ||
      (lenis.resize(), lenis.start()));
}
function initLenis() {
  (lenis && (lenis.destroy(), (lenis = null)),
    lenisTickerFn &&
      (gsap.ticker.remove(lenisTickerFn), (lenisTickerFn = null)),
    (lenis = new Lenis({
      wrapper: window,
      duration: 1.2,
      smoothWheel: !0,
      touchMultiplier: 2,
      easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)),
      infinite: !1,
    })),
    lenis.on("scroll", ScrollTrigger.update),
    (lenisTickerFn = (e) => lenis.raf(1e3 * e)),
    gsap.ticker.add(lenisTickerFn),
    gsap.ticker.lagSmoothing(0));
}
function initHaptics() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-haptic]");
    t && window._haptics?.trigger(t.dataset.haptic || "medium");
  });
}
function initThemeMode(e = document) {
  function t(e) {
    const t = s[e];
    if (!t) return;
    const n = document.querySelector('link[rel~="icon"]');
    if (n && n.href === t) return;
    const o = t.endsWith(".svg")
      ? "image/svg+xml"
      : t.endsWith(".ico")
        ? "image/x-icon"
        : "image/png";
    document
      .querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]')
      .forEach((e) => e.remove());
    const i = document.createElement("link");
    ((i.rel = "icon"),
      (i.type = o),
      (i.href = t),
      document.head.appendChild(i));
  }
  function n(e) {
    const n = r[e];
    n &&
      (Object.values(r).forEach((e) => l.classList.remove(e)),
      l.classList.add(n),
      t(e),
      sessionStorage.setItem(i, e));
  }
  function o(e) {
    m.forEach((t) => {
      gsap.to(t, {
        borderWidth: t === e ? d : u,
        duration: durS,
        ease: "Out",
        overwrite: "auto",
      });
    });
  }
  const i = "theme-mode",
    r = {
      base: "theme-mode-base",
      1: "theme-mode-1",
      2: "theme-mode-2",
      3: "theme-mode-3",
      4: "theme-mode-4",
    },
    a = {
      base: "#ffffff",
      1: "#bec1ca",
      2: "#FF633D",
      3: "#919E44",
      4: "#D5312F",
    },
    s = {
      base: "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a64bda305476e6f0c2ec4e4_favicon-mode_0.svg",
      1: "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a64bda35acf1e4ef4b2b360_favicon-mode_1.svg",
      2: "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a64bda3da4c3a9156fc8e24_favicon-mode_2.svg",
      3: "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a64bda387226e24625a83b8_favicon-mode_3.svg",
      4: "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a64bda37f172072e2128b2f_favicon-mode_4.svg",
    },
    l = document.body,
    c = window.matchMedia("(max-width: 991px)").matches,
    d = c ? "2.0356rem" : "0.555rem",
    u = c ? "0.0636rem" : "0.0694rem",
    p = sessionStorage.getItem(i) || "base";
  n(p);
  const m = e.querySelectorAll("[data-theme-mode]");
  if (!m.length) return;
  m.forEach((e) => gsap.set(e, { borderWidth: u }));
  const g = e.querySelector(`[data-theme-mode="${p}"]`);
  if ((g && o(g), !window.__themeLiquid)) {
    const e = new THREE.WebGLRenderer({ alpha: !0, antialias: !1 });
    (e.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
      e.setSize(window.innerWidth, window.innerHeight));
    const t = e.domElement;
    (Object.assign(t.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "0",
      pointerEvents: "none",
      display: "none",
    }),
      document.body.appendChild(t));
    const n = new THREE.Scene(),
      o = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
      i = {
        uProgress: { value: 0 },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uColor: { value: new THREE.Color("#000000") },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uTime: { value: 0 },
      },
      r = new THREE.ShaderMaterial({
        transparent: !0,
        uniforms: i,
        vertexShader:
          "\n        varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = vec4(position, 1.0);\n        }\n      ",
        fragmentShader:
          "\n        varying vec2 vUv;\n        uniform float uProgress;\n        uniform vec2 uCenter;\n        uniform vec3 uColor;\n        uniform float uAspect;\n        uniform float uTime;\n\n        float hash(vec2 p) {\n          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n        }\n        float noise(vec2 p) {\n          vec2 i = floor(p); vec2 f = fract(p);\n          f = f * f * (3.0 - 2.0 * f);\n          return mix(\n            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\n            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),\n            f.y\n          );\n        }\n        float fbm(vec2 p) {\n          float v = 0.0; float a = 0.5;\n          for (int i = 0; i < 4; i++) {\n            v += a * noise(p);\n            p *= 2.1;\n            a *= 0.5;\n          }\n          return v;\n        }\n\n        void main() {\n          vec2 uv = vUv;\n          vec2 c = uCenter;\n          uv.x *= uAspect;\n          c.x *= uAspect;\n\n          float d = distance(uv, c);\n          float t = uTime * 0.3;\n\n          float ramp = smoothstep(0.0, 0.5, uProgress);\n\n          vec2 q = vec2(\n            fbm(uv * 3.0 + t),\n            fbm(uv * 3.0 + 37.2 - t)\n          );\n          float n = fbm(uv * 4.0 + q * 1.8) * 0.55 * ramp;\n\n          float g = (fbm(uv * 15.0 + 5.1 + t * 0.6) - 0.5) * 0.12 * ramp;\n\n          float edge = uProgress - n + g;\n          float mask = smoothstep(edge - 0.012, edge, d);\n\n          gl_FragColor = vec4(uColor, mask);\n        }\n      ",
      });
    n.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), r));
    let a = null;
    const s = () => {
      ((i.uTime.value += 0.016),
        e.render(n, o),
        (a = requestAnimationFrame(s)));
    };
    (window.addEventListener("resize", () => {
      (e.setSize(window.innerWidth, window.innerHeight),
        (i.uAspect.value = window.innerWidth / window.innerHeight));
    }),
      (window.__themeLiquid = {
        tween: null,
        run(e, n) {
          (this.tween && this.tween.kill(), cancelAnimationFrame(a));
          const o = window.innerWidth / window.innerHeight,
            r = e.clientX / window.innerWidth,
            l = 1 - e.clientY / window.innerHeight;
          (i.uCenter.value.set(r, l),
            i.uColor.value.set(n),
            (i.uProgress.value = 0));
          const c =
            [
              [0, 0],
              [o, 0],
              [0, 1],
              [o, 1],
            ].reduce(
              (e, [t, n]) => Math.max(e, Math.hypot(t - r * o, n - l)),
              0,
            ) + 0.75;
          ((t.style.display = "block"),
            s(),
            (this.tween = gsap.to(i.uProgress, {
              value: c,
              duration: 1.5,
              ease: "Out",
              onComplete: () => {
                ((t.style.display = "none"),
                  cancelAnimationFrame(a),
                  (this.tween = null));
              },
            })));
        },
      }));
  }
  m.forEach((e) => {
    e.addEventListener("click", (t) => {
      const r = e.getAttribute("data-theme-mode"),
        s = sessionStorage.getItem(i) || "base";
      r !== s && (window.__themeLiquid.run(t, a[s] || "#000"), n(r), o(e));
    });
  });
}
function initTotemActivation(e = document) {
  const t = e.querySelector(".totem-wrap"),
    n = e.querySelectorAll("[data-theme-mode]");
  if (!t || !n.length) return;
  const o = 10;
  gsap.set(t, {
    transformPerspective: 600,
    transformOrigin: "50% 50%",
    force3D: !0,
  });
  let i = null;
  const r = () => {
    (i && i.kill(), gsap.killTweensOf(t));
    const e = { ticks: 40 };
    (gsap.set(t, { display: "block", opacity: 1 }),
      (i = gsap.to(e, {
        ticks: 0,
        duration: 2,
        ease: "none",
        onUpdate: () => {
          const n = e.ticks / 40,
            i = n * n,
            r = n * i,
            a =
              (10.25 * r * i - 24.95 * i * i + 25.5 * r - 13.8 * i + 4 * n) *
              Math.PI,
            s = (50 + 175 * Math.sin(a)) / 225,
            l = 1 - n,
            c = o * Math.sin(l * Math.PI * 2) * Math.sin(l * Math.PI);
          gsap.set(t, {
            scale: Math.max(s, 0.001),
            rotationY: 720 * Math.abs(Math.sin(a)),
            rotationZ: c,
          });
        },
        onComplete: () => {
          (gsap.set(t, { display: "none", clearProps: "transform,opacity" }),
            (i = null));
        },
      })));
  };
  n.forEach((e) => {
    e.addEventListener("click", r);
  });
}
function initFooterTime(e = document) {
  const t = e.querySelector('[data-footer-time="hours"]'),
    n = e.querySelector('[data-footer-time="minutes"]');
  if (!t && !n) return;
  window.__footerTimeInterval &&
    (clearInterval(window.__footerTimeInterval),
    (window.__footerTimeInterval = null));
  const o = (e) => String(e).padStart(2, "0"),
    i = () => {
      const e = new Date(),
        i = o(e.getHours()),
        r = o(e.getMinutes());
      (t && t.textContent !== i && (t.textContent = i),
        n && n.textContent !== r && (n.textContent = r));
    };
  (i(), (window.__footerTimeInterval = setInterval(i, 1e3)));
}
function initFooterLogo(e = document) {
  const t = e.querySelector('[data-footer-logo="list"]');
  if (!t) return;
  const n = e.querySelector('[data-footer-logo="wrap"]') || t,
    o = Array.from(t.querySelectorAll('[data-footer-logo="item"]'));
  if (o.length < 2) return;
  (window.__footerLogoInterval &&
    (clearInterval(window.__footerLogoInterval),
    (window.__footerLogoInterval = null)),
    n._footerLogoClick &&
      (n.removeEventListener("click", n._footerLogoClick),
      (n._footerLogoClick = null)));
  const i = (e) => {
      ((e.style.position = "relative"), (e.style.display = "block"));
    },
    r = (e) => {
      ((e.style.position = "absolute"), (e.style.display = "none"));
    };
  let a = 0;
  o.forEach((e, t) => (0 === t ? i(e) : r(e)));
  const s = (e) => {
      e !== a && (r(o[a]), i(o[e]), (a = e));
    },
    l = () => s((a + 1) % o.length),
    c = () => {
      (window.__footerLogoInterval &&
        clearInterval(window.__footerLogoInterval),
        (window.__footerLogoInterval = setInterval(l, 5e3)));
    };
  ((n._footerLogoClick = () => {
    (l(), c());
  }),
    n.addEventListener("click", n._footerLogoClick),
    c());
}
function initDialOverlay(e = document) {
  const t = e.querySelector('[data-contact-dial="overlay"]');
  if (!t) return;
  const n = e.querySelector(".dial-decor"),
    o = 60,
    i = -5;
  let r = null;
  gsap.matchMedia().add(
    `(min-width: ${breakPoint}px)`,
    () => (
      gsap.set(t, { rotation: 0, transformOrigin: "50% 50%" }),
      n && gsap.set(n, { rotation: 0, transformOrigin: "50% 50%" }),
      ([r] = Draggable.create(t, {
        type: "rotation",
        inertia: !1,
        bounds: { minRotation: 0, maxRotation: o },
        onDrag() {
          n && gsap.set(n, { rotation: (this.rotation / o) * i });
        },
        onDragEnd() {
          (gsap.to(t, {
            rotation: 0,
            duration: durM,
            ease: "Out",
            overwrite: "auto",
          }),
            n &&
              gsap.to(n, {
                rotation: 0,
                duration: durM,
                ease: "Out",
                overwrite: "auto",
              }));
        },
      })),
      () => {
        (r && r.kill(),
          (r = null),
          gsap.killTweensOf(t),
          gsap.set(t, { clearProps: "transform" }),
          n &&
            (gsap.killTweensOf(n), gsap.set(n, { clearProps: "transform" })));
      }
    ),
  );
}
function initResetWebflow(e) {
  let t = new DOMParser()
    .parseFromString(e.next.html, "text/html")
    .querySelector("html")
    .getAttribute("data-wf-page");
  (document.documentElement.setAttribute("data-wf-page", t),
    window.Webflow.destroy(),
    window.Webflow.ready());
}
function initCursorTracker() {
  function e(e) {
    const t = document.createRange();
    (t.selectNodeContents(e), t.collapse(!1));
    const n = getSelection();
    (n.removeAllRanges(), n.addRange(t));
  }
  function t(e) {
    w[e] &&
      (clearTimeout(w[e].holdTimer),
      clearTimeout(w[e].fadeTimer),
      w[e].wrap.remove(),
      delete w[e]);
  }
  function n() {
    Object.keys(w).forEach(t);
  }
  function o(e) {
    let t = w[e];
    if (!t) {
      const n = document.createElement("div");
      (n.classList.add("remote-cursor-wrap"),
        (n.style.cssText =
          "position:absolute;top:0;left:0;pointer-events:none;"));
      const o = document.createElement("img");
      (o.classList.add("remote-cursor"),
        (o.src =
          "https://cdn.prod.website-files.com/6a2fcc5552066493ef9a5cf9/6a36b538efe357a44916fd89_cursor.svg"),
        (o.style.cssText = "width:1.25em;height:1.25em;display:block;"));
      const i = document.createElement("div");
      (i.classList.add("remote-cursor-msg"),
        (i.style.cssText =
          "position:absolute;left:14px;top:14px;display:none;opacity:1;"));
      const r = document.createElement("span");
      (r.classList.add("p1"),
        i.appendChild(r),
        n.appendChild(o),
        n.appendChild(i),
        T.appendChild(n),
        (t = w[e] =
          {
            wrap: n,
            img: o,
            bubble: i,
            textEl: r,
            lastSeen: 0,
            holdTimer: null,
            fadeTimer: null,
          }));
    }
    return t;
  }
  function i(e) {
    (clearTimeout(e.holdTimer),
      clearTimeout(e.fadeTimer),
      (e.bubble.style.transition = "opacity 120ms ease"),
      (e.bubble.style.opacity = "1"),
      (e.holdTimer = setTimeout(() => {
        ((e.bubble.style.transition = `opacity ${y}ms linear`),
          (e.bubble.style.opacity = "0"),
          (e.fadeTimer = setTimeout(() => {
            ((e.bubble.style.display = "none"), (e.textEl.textContent = ""));
          }, y)));
      }, v)));
  }
  function r() {
    (clearTimeout(A),
      clearTimeout(L),
      (S.style.transition = "opacity 120ms ease"),
      (S.style.opacity = "1"),
      (A = setTimeout(() => {
        ((S.style.transition = `opacity ${y}ms linear`),
          (S.style.opacity = "0"),
          (L = setTimeout(() => d(!0), y)));
      }, v)));
  }
  function a() {
    ((S.style.left = `${_()}px`), (S.style.top = `${x()}px`));
  }
  function s() {
    u.emit("cursorMove", {
      userId: p,
      x: _() / document.documentElement.scrollWidth,
      y: x() / document.documentElement.scrollHeight,
      page: b,
    });
  }
  function l(e) {
    u.emit("cursorMessage", { userId: p, text: e, page: b });
  }
  function c() {
    k ||
      ((k = !0),
      (S.textContent = ""),
      (S.style.display = "block"),
      a(),
      S.focus(),
      r(),
      (M = setInterval(s, f)));
  }
  function d(e) {
    k &&
      ((k = !1),
      clearTimeout(A),
      clearTimeout(L),
      clearInterval(M),
      (M = null),
      (S.style.display = "none"),
      (S.style.opacity = "1"),
      (S.textContent = ""),
      e || l(""));
  }
  if (
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  )
    return () => {};
  const u = getSocket(),
    p =
      localStorage.getItem("cursorUserId") ||
      Math.random().toString(36).substr(2, 9);
  localStorage.setItem("cursorUserId", p);
  const m = 5e3,
    g = 2e3,
    f = 2e3,
    h = 60,
    v = 8e3,
    y = 2500,
    w = {};
  let b = window.location.pathname,
    E = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const _ = () => E.x + window.scrollX,
    x = () => E.y + window.scrollY;
  if (!document.getElementById("cursor-chat-styles")) {
    const e = document.createElement("style");
    ((e.id = "cursor-chat-styles"),
      (e.textContent =
        ".cursor-chat-input:empty::before{content:attr(data-placeholder);opacity:.55;pointer-events:none;}"),
      document.head.appendChild(e));
  }
  const T = document.createElement("div");
  (T.classList.add("cursor-container"),
    (T.style.cssText =
      "position:absolute;top:0;left:0;width:0;height:0;z-index:9000;pointer-events:none;"),
    document.body.appendChild(T));
  const S = document.createElement("div");
  (S.classList.add("cursor-chat-input", "p1"),
    (S.contentEditable = "true"),
    (S.spellcheck = !1),
    S.setAttribute("data-placeholder", "Say something..."),
    (S.style.cssText =
      "position:absolute;display:none;z-index:99999;transform:translate(14px,14px);opacity:1;"),
    T.appendChild(S));
  let k = !1,
    M = null,
    A = null,
    L = null;
  window.__cursorPageSync = () => {
    ((b = window.location.pathname), n(), d(!0));
  };
  const C = (e) => {
      ((E = { x: e.clientX, y: e.clientY }), k && a(), s());
    },
    R = () => {
      (k && a(), s());
    },
    P = (e) => {
      null === e.relatedTarget &&
        (l(""), u.emit("cursorLeave", { userId: p }), d(!0));
    },
    I = () => {
      document.hidden
        ? (l(""), u.emit("cursorLeave", { userId: p }), d(!0))
        : s();
    },
    q = () => window.__cursorPageSync(),
    F = (e) =>
      e &&
      ("INPUT" === e.tagName ||
        "TEXTAREA" === e.tagName ||
        (e.isContentEditable && e !== S)),
    O = (e) => {
      k
        ? ("Escape" !== e.key && "Enter" !== e.key) ||
          (e.preventDefault(), d(!1))
        : "Slash" !== e.code ||
          F(document.activeElement) ||
          e.metaKey ||
          e.ctrlKey ||
          e.altKey ||
          (e.preventDefault(), c());
    },
    D = () => {
      (/[\r\n]/.test(S.textContent) &&
        ((S.textContent = S.textContent.replace(/[\r\n]+/g, " ")), e(S)),
        S.textContent.length > h &&
          ((S.textContent = S.textContent.slice(0, h)), e(S)),
        r(),
        l(S.textContent));
    },
    $ = () => {
      k &&
        requestAnimationFrame(() => {
          k && S.focus();
        });
    },
    z = (e) => {
      k && e.target !== S && e.preventDefault();
    };
  (document.addEventListener("mousemove", C),
    window.addEventListener("scroll", R, { passive: !0 }),
    document.addEventListener("mouseleave", P),
    document.addEventListener("visibilitychange", I),
    document.addEventListener("keydown", O),
    document.addEventListener("mousedown", z, !0),
    window.addEventListener("popstate", q),
    S.addEventListener("input", D),
    S.addEventListener("blur", $));
  const H = (e) => t(e.userId),
    U = (e) => {
      if (e.userId === p) return;
      if (e.page !== b) return t(e.userId);
      const n = o(e.userId);
      ((n.lastSeen = Date.now()),
        (n.wrap.style.left = e.x * document.documentElement.scrollWidth + "px"),
        (n.wrap.style.top =
          e.y * document.documentElement.scrollHeight + "px"));
    },
    N = (e) => {
      if (e.userId === p) return;
      if (e.page !== b) return;
      const t = o(e.userId);
      t.lastSeen = Date.now();
      const n = (e.text || "").trim();
      n
        ? ((t.textEl.textContent = n), (t.bubble.style.display = "block"), i(t))
        : (clearTimeout(t.holdTimer),
          clearTimeout(t.fadeTimer),
          (t.bubble.style.display = "none"),
          (t.textEl.textContent = ""));
    },
    B = (e) => t(e);
  (u.on("cursorLeave", H),
    u.on("cursorMove", U),
    u.on("cursorMessage", N),
    u.on("userDisconnect", B));
  const X = setInterval(() => {
    const e = Date.now();
    Object.keys(w).forEach((n) => {
      e - w[n].lastSeen > m && t(n);
    });
  }, g);
  return () => {
    (clearInterval(X),
      d(!0),
      document.removeEventListener("mousemove", C),
      window.removeEventListener("scroll", R),
      document.removeEventListener("mouseleave", P),
      document.removeEventListener("visibilitychange", I),
      document.removeEventListener("keydown", O),
      document.removeEventListener("mousedown", z, !0),
      window.removeEventListener("popstate", q),
      S.removeEventListener("input", D),
      S.removeEventListener("blur", $),
      u.off("cursorLeave", H),
      u.off("cursorMove", U),
      u.off("cursorMessage", N),
      u.off("userDisconnect", B),
      n(),
      T.remove());
    const e = document.getElementById("cursor-chat-styles");
    (e && e.remove(),
      window.__cursorPageSync && delete window.__cursorPageSync);
  };
}
function initMsgChannel() {
  const e = getSocket();
  let t = 0;
  const n = console.log,
    o = `Edit \u2116${Math.floor(100 + 900 * Math.random())}`;
  ((console.log = function (i) {
    if ("string" == typeof i && i.startsWith("/msg ")) {
      const r = i.replace("/msg ", "").trim();
      if (!r) return;
      const a = Date.now();
      if (a - t < 5e3)
        return void n(
          "%c\u26a0\ufe0f Please wait before sending another message.",
          "color:orange;font-weight:bold;",
        );
      ((t = a),
        e.emit("msg", { user: o, command: r }),
        n(`%c${o}: ${r}`, "color:red;font-weight:bold;"));
    } else n.apply(console, arguments);
  }),
    e.on("msg", (e) => {
      n(`%c${e.user}: ${e.command}`, "color:red;font-weight:bold;");
    }));
}
function getTextFeBlurs(e) {
  return gsap.utils
    .toArray(e)
    .flatMap((e) =>
      (e._split?.lines ?? [])
        .map((e) =>
          document.querySelector(`#${e.dataset.filterId} feGaussianBlur`),
        )
        .filter(Boolean),
    );
}
function killTextTweens(e) {
  gsap.killTweensOf(getTextFeBlurs(e));
}
function cleanupGooFilters() {
  const e = document.querySelector("svg#goo-defs");
  e &&
    e.querySelectorAll("filter").forEach((e) => {
      document.querySelector(`[data-filter-id="${e.id}"]`) || e.remove();
    });
}
function animateTextReveal(e, t, n) {
  function o() {
    let e = document.querySelector("svg#goo-defs");
    return (
      e ||
        ((e = document.createElementNS(a, "svg")),
        e.setAttribute("id", "goo-defs"),
        (e.style.cssText =
          "position:absolute;width:0;height:0;overflow:hidden;"),
        document.body.prepend(e)),
      e
    );
  }
  function i(e) {
    if (e.dataset.filterId) return;
    const t = `goo-${Math.random().toString(36).substr(2, 9)}`;
    e.dataset.filterId = t;
    const n = document.createElementNS(a, "filter");
    (n.setAttribute("id", t),
      n.setAttribute("x", "-25%"),
      n.setAttribute("y", "-25%"),
      n.setAttribute("width", "150%"),
      n.setAttribute("height", "150%"),
      n.setAttribute("color-interpolation-filters", "sRGB"),
      (n.innerHTML = `\n      <feGaussianBlur in="SourceGraphic" stdDeviation="${s}" result="blur"></feGaussianBlur>\n      <feColorMatrix in="blur" mode="matrix" values="${d(l, c)}" result="goo"></feColorMatrix>\n    `),
      o().appendChild(n),
      (e.style.filter = `url(#${t})`));
  }
  const r = gsap.utils.toArray(e);
  if (!r.length) return;
  const a = "http://www.w3.org/2000/svg",
    s = 50,
    l = 20,
    c = -8,
    d = (e, t) => `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${e} ${t}`,
    u = (e) => document.querySelector(`#${e.dataset.filterId} feGaussianBlur`),
    p = (e) => document.querySelector(`#${e.dataset.filterId} feColorMatrix`);
  r.forEach((e, o) => {
    (("reveal" !== t && "initial" !== t) || (e.style.display = ""),
      e._split || (e._split = new SplitText(e, { type: "lines" })),
      e._split.lines.forEach(i));
    const r = o * stagger;
    e._split.lines.length;
    switch (t) {
      case "initial":
        e._split.lines.forEach((e) => {
          const t = u(e),
            n = p(e);
          (t && t.setAttribute("stdDeviation", s),
            n && n.setAttribute("values", d(l, c)),
            (e.style.filter = `url(#${e.dataset.filterId})`));
        });
        break;
      case "reveal": {
        gsap.set(e, { autoAlpha: 1 });
        const t = gsap.timeline();
        e._split.lines.forEach((e, o) => {
          const i = u(e),
            a = p(e);
          if (!i || !a) return;
          (i.setAttribute("stdDeviation", s),
            a.setAttribute("values", d(l, c)),
            (e.style.filter = `url(#${e.dataset.filterId})`));
          const m = 0 === o ? (n ?? delayReveal) + r : 0;
          t.to(
            i,
            {
              attr: { stdDeviation: 0 },
              duration: durL,
              delay: m,
              ease: "Out",
            },
            o * stagger,
          );
          const g = { amp: l, off: c };
          t.to(
            g,
            {
              amp: 1,
              off: 0,
              duration: 0.35 * durL,
              ease: "none",
              onUpdate: () => a.setAttribute("values", d(g.amp, g.off)),
              onComplete: () => {
                (a.setAttribute("values", d(1, 0)), (e.style.filter = ""));
              },
            },
            ">-" + 0.35 * durL,
          );
        });
        break;
      }
      case "hide": {
        const t = gsap.timeline({
          onComplete: () => {
            (gsap.set(e, { autoAlpha: 0 }), (e.style.display = "none"));
          },
        });
        e._split.lines.forEach((e, o) => {
          const i = u(e),
            r = p(e);
          if (!i || !r) return;
          (i.setAttribute("stdDeviation", 0),
            r.setAttribute("values", d(1, 0)),
            (e.style.filter = `url(#${e.dataset.filterId})`));
          const a = 0 === o ? (n ?? 0) : 0,
            m = { amp: 1, off: 0 };
          (t.to(
            m,
            {
              amp: l,
              off: c,
              duration: 0.3 * durS,
              delay: a,
              ease: "none",
              onUpdate: () => r.setAttribute("values", d(m.amp, m.off)),
            },
            o * stagger * 0.5,
          ),
            t.to(
              i,
              {
                attr: { stdDeviation: s },
                duration: durS,
                delay: a,
                ease: "In",
              },
              o * stagger * 0.5,
            ));
        });
        break;
      }
    }
  });
}
function animateDivReveal(e, t, n) {
  const o = gsap.utils.toArray(e);
  if (o.length)
    switch (t) {
      case "initial":
        gsap.set(o, { opacity: 0, filter: "blur(20px)" });
        break;
      case "reveal":
        gsap.to(o, {
          opacity: 1,
          filter: "blur(0px)",
          duration: durL,
          delay: n ?? delayReveal,
          stagger: stagger,
          ease: "power2.out",
          overwrite: !0,
        });
        break;
      case "hide":
        gsap.to(o, {
          opacity: 0,
          filter: "blur(20px)",
          duration: durS,
          delay: n ?? 0,
          stagger: 0.5 * stagger,
          ease: "power2.in",
          overwrite: !0,
        });
    }
}
function animateLink(e, t, n, o, i) {
  const r = gsap.utils.toArray(e);
  r.length &&
    r.forEach((e, r) => {
      if (
        (e._split && e._split.revert(),
        (e._split = new SplitText(e, {
          type: "lines,words,chars",
          tag: "span",
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
        })),
        !e._split.chars?.length)
      )
        return;
      (e._split.lines.forEach((e) => {
        ((e.style.display = "block"), (e.style.overflow = "clip"));
      }),
        e._split.words.forEach((e) => {
          e.style.overflow = "clip";
        }));
      const a = e._split.chars,
        s = o ?? gsap,
        l = i ?? ">",
        c = r * stagger;
      switch (t) {
        case "reveal":
          (gsap.killTweensOf(a),
            s.fromTo(
              a,
              { yPercent: 100 },
              {
                yPercent: 0,
                duration: durS,
                delay: o ? 0 : (n ?? delayReveal) + c,
                stagger: { amount: 0.075 },
                ease: "InOut",
                overwrite: !0,
              },
              o ? l : void 0,
            ));
          break;
        case "hide":
          (gsap.killTweensOf(a),
            s.to(
              a,
              {
                yPercent: -100,
                duration: durS,
                delay: o ? 0 : (n ?? 0),
                stagger: { amount: 0.075 },
                ease: "InOut",
                overwrite: !0,
              },
              o ? l : void 0,
            ));
          break;
        case "initial":
          (gsap.killTweensOf(a), gsap.set(a, { yPercent: 100 }));
      }
    });
}
function animateClipReveal(e, t, n, o) {
  const i = gsap.utils.toArray(e);
  if (!i.length) return;
  const r = {
    "top-down": {
      hidden: "inset(0% 0% 100% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    "left-right": {
      hidden: "inset(0% 100% 0% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    "right-left": {
      hidden: "inset(0% 0% 0% 100%)",
      visible: "inset(0% 0% 0% 0%)",
    },
    "down-top": {
      hidden: "inset(100% 0% 0% 0%)",
      visible: "inset(0% 0% 0% 0%)",
    },
  }[t];
  if (r)
    switch (n) {
      case "initial":
        gsap.set(i, { clipPath: r.hidden, webkitClipPath: r.hidden });
        break;
      case "reveal":
        gsap.to(i, {
          clipPath: r.visible,
          webkitClipPath: r.visible,
          duration: durL,
          delay: o ?? delayReveal,
          stagger: stagger,
          ease: "power2.out",
          overwrite: !0,
        });
        break;
      case "hide":
        gsap.to(i, {
          clipPath: r.hidden,
          webkitClipPath: r.hidden,
          duration: durS,
          delay: o ?? 0,
          stagger: 0.5 * stagger,
          ease: "power2.in",
          overwrite: !0,
        });
    }
}
function initElementsReveal(e = document) {
  const t = e.querySelectorAll('[data-reveal="text"]');
  t.length &&
    t.forEach((e) => {
      (gsap.set(e, { visibility: "visible" }),
        ScrollTrigger.create({
          trigger: e,
          start: "top bottom",
          once: !0,
          onEnter: () => animateTextReveal(e, "reveal", 0.1),
        }),
        animateTextReveal(e, "initial"));
    });
  const n = {
    "clip-down": "top-down",
    "clip-left": "left-right",
    "clip-right": "right-left",
    "clip-top": "down-top",
  };
  Object.entries(n).forEach(([t, n]) => {
    const o = e.querySelectorAll(`[data-reveal="${t}"]`);
    o.length &&
      o.forEach((e) => {
        (gsap.set(e, { visibility: "visible" }),
          animateClipReveal(e, n, "initial"),
          ScrollTrigger.create({
            trigger: e,
            start: "top bottom",
            once: !0,
            onEnter: () => animateClipReveal(e, n, "reveal", 0.1),
          }));
      });
  });
  const o = e.querySelectorAll('[data-reveal="div"]');
  o.length &&
    o.forEach((e) => {
      const t = e.closest('[data-reveal="w"]');
      (gsap.set(e, { visibility: "visible" }),
        ScrollTrigger.create({
          trigger: t || e,
          start: "top bottom",
          once: !0,
          onEnter: () => animateDivReveal(e, "reveal", 0.1),
        }),
        animateDivReveal(e, "initial"));
    });
  const i = e.querySelectorAll('[data-contact-reveal="left"]'),
    r = e.querySelectorAll('[data-contact-reveal="right"]'),
    a = e.querySelectorAll('[data-contact-reveal="center"]'),
    s = (e, t) =>
      e.forEach((e) => {
        (gsap.killTweensOf(e),
          gsap.set(e, { visibility: "visible", ...t.from }),
          ScrollTrigger.create({
            trigger: e,
            start: "top 88%",
            once: !0,
            onEnter: () => gsap.to(e, t.to),
          }));
      });
  (s(i, {
    from: { clipPath: "inset(0 0 0 100%)" },
    to: { clipPath: "inset(0 0 0 0%)", duration: durL, ease: "Out" },
  }),
    s(r, {
      from: { clipPath: "inset(0 100% 0 0)" },
      to: { clipPath: "inset(0 0% 0 0)", duration: durL, ease: "Out" },
    }),
    s(a, {
      from: { scale: 0, transformOrigin: "center center" },
      to: { scale: 1, duration: durM, ease: "Out" },
    }));
  const l = e.querySelectorAll(".gallery-item");
  if (l.length) {
    const e = 12,
      t = 32,
      n = "__gallery-clips",
      o = "http://www.w3.org/2000/svg";
    let i = document.getElementById(n);
    i ||
      ((i = document.createElementNS(o, "svg")),
      (i.id = n),
      i.setAttribute(
        "style",
        "position:absolute;width:0;height:0;overflow:hidden",
      ),
      i.appendChild(document.createElementNS(o, "defs")),
      document.body.appendChild(i));
    const r = i.querySelector("defs");
    (l.forEach((e, t) => {
      ["item", "img"].forEach((e) => {
        if (document.getElementById(`gallery-cp-${e}-${t}`)) return;
        const n = document.createElementNS(o, "clipPath");
        ((n.id = `gallery-clip-${e}-${t}`),
          n.setAttribute("clipPathUnits", "userSpaceOnUse"));
        const i = document.createElementNS(o, "path");
        ((i.id = `gallery-cp-${e}-${t}`), n.appendChild(i), r.appendChild(n));
      });
    }),
      l.forEach((n, o) => {
        const i = n.querySelector("img");
        if (!i) return;
        gsap.set(n, { visibility: "visible" });
        const r = document.getElementById(`gallery-cp-item-${o}`),
          a = document.getElementById(`gallery-cp-img-${o}`),
          s = { progress: 0 },
          l = { progress: 0 },
          c = Array.from({ length: e }, () => (2 * Math.random() - 1) * t),
          d = () => ({ w: n.offsetWidth, h: n.offsetHeight }),
          u = (t) => {
            const { w: n, h: o } = d(),
              i = t * o,
              r = c.map((e) => i + e * Math.sin(t * Math.PI));
            let a = `M 0 ${r[0]} C`;
            for (let t = 0; t < e - 1; t++) {
              const o = ((t + 1) / (e - 1)) * n,
                i = ((t / (e - 1)) * n + o) / 2;
              a += ` ${i} ${r[t]} ${i} ${r[t + 1]} ${o} ${r[t + 1]}`;
            }
            return ((a += " V 0 H 0 Z"), a);
          };
        ((n.style.clipPath = `url(#gallery-clip-item-${o})`),
          (i.style.clipPath = `url(#gallery-clip-img-${o})`),
          gsap.set(i, { visibility: "visible" }),
          r.setAttribute("d", u(0)),
          a.setAttribute("d", u(0)),
          gsap.killTweensOf([s, l]));
        const p = gsap.timeline({
          paused: !0,
          defaults: { ease: "InOut", duration: durL },
        });
        (p.to(s, {
          progress: 1,
          onUpdate: () => r.setAttribute("d", u(s.progress)),
        }),
          p.to(
            l,
            { progress: 1, onUpdate: () => a.setAttribute("d", u(l.progress)) },
            0.1,
          ),
          ScrollTrigger.create({
            trigger: n,
            start: "top 90%",
            once: !0,
            onEnter: () => p.play(),
          }));
      }));
  }
  if (e.querySelector('[data-barba-namespace="home"]')) {
    if (!window.__preloaderState.done) return;
    if (
      "home" === window.__preloaderState.startPage &&
      window.__preloaderState.homeHandled
    )
      return void (window.__preloaderState.homeHandled = !1);
    const t = e.querySelector('[data-preloader="progress"]'),
      n = e.querySelector('[data-preloader="text-1"]'),
      o = e.querySelectorAll('[data-preloader="text-2"]');
    return (
      gsap.set(t, { height: "100%", visibility: "visible" }),
      gsap.set([n, ...o].filter(Boolean), { visibility: "visible" }),
      n && animateTextReveal(n, "reveal", 0),
      o.forEach((e) => animateTextReveal(e, "reveal", 0)),
      void gsap.fromTo(
        t,
        { opacity: 0 },
        { opacity: 1, duration: durM, ease: "Out" },
      )
    );
  }
  if (!e.querySelector('[data-barba-namespace="works"]')) return;
  const c = e.querySelector(".works-overlay");
  if (!c) return;
  ((window.__holeIntroRunning = !0), lenis.stop());
  const d = { progress: 0 },
    u = () => {
      c.style.setProperty("--hole-progress", d.progress);
    };
  gsap.fromTo(
    d,
    { progress: 0 },
    {
      progress: 1,
      duration: durL,
      ease: "Out",
      onUpdate: u,
      onComplete: () => {
        ((window.__holeIntroRunning = !1),
          initWorksIntroMask(e),
          hasScrollTrigger && ScrollTrigger.refresh(),
          lenis.start());
      },
    },
  );
}
function initNavDropdown() {
  const e = document.querySelectorAll('[data-nav="button"]');
  e.length &&
    e.forEach((e) => {
      const t = document.querySelector('[data-nav="link-group"]');
      if (!t) return;
      const n = t.querySelectorAll('[data-nav="link"]');
      if (!n.length) return;
      const o = t.querySelector('[data-nav-link="archive"]'),
        i = e.querySelectorAll(".link-inner"),
        r = (e) => {
          i.forEach((t) => {
            t._setLinkText
              ? t._setLinkText(e)
              : t
                  .querySelectorAll('[data-nav="label"]')
                  .forEach((t) => (t.textContent = e));
          });
        },
        a = () => window.matchMedia("(max-width: 991px)").matches,
        s = () => (a() ? "inset(0% 0% 0% 100%)" : "inset(0% 0% 100% 0%)"),
        l = "inset(0% 0% 0% 0%)",
        c = () =>
          a() && o ? Array.from(n).filter((e) => e !== o) : Array.from(n);
      (gsap.set(t, { display: "none" }),
        gsap.set(c(), { clipPath: s() }),
        o && gsap.set(o, { yPercent: 100 }));
      let d = !1,
        u = null,
        p = window.scrollY;
      const m = () => {
        (u && (u.kill(), (u = null)),
          gsap.killTweensOf([n, o, t].filter(Boolean)));
      };
      ((window.closeMenu = () => {
        if (!d) return;
        ((d = !1), r("Menu"), m());
        const e = c();
        ((u = gsap.timeline()),
          o && u.to(o, { yPercent: 100, duration: durS, ease: "In" }, 0),
          u
            .to(
              e,
              {
                clipPath: s(),
                duration: durS,
                ease: "In",
                stagger: { each: stagger, from: a() ? "end" : "start" },
              },
              0,
            )
            .set(t, { display: "none" }));
      }),
        e.addEventListener("click", (e) => {
          if ((e.stopPropagation(), d)) window.closeMenu();
          else {
            ((d = !0), (p = window.scrollY), r("Close"), m());
            const e = c();
            ((u = gsap.timeline()),
              u.set(t, { display: "flex" }),
              u.to(e, {
                clipPath: l,
                duration: durM,
                ease: "Out",
                overwrite: "auto",
                stagger: {
                  amount: stagger * e.length,
                  from: a() ? "start" : "end",
                },
              }),
              o &&
                u.to(
                  o,
                  {
                    yPercent: 0,
                    duration: durM,
                    ease: "Out",
                    overwrite: "auto",
                  },
                  "-=" + 0.5 * durM,
                ));
          }
        }),
        window.addEventListener(
          "scroll",
          () => {
            d && Math.abs(window.scrollY - p) > 10 && window.closeMenu();
          },
          { passive: !0 },
        ));
    });
}
function updateNavIndicators() {
  const e = (e) => e.pathname.replace(/\/$/, "") || "/",
    t = e(window.location);
  document.querySelectorAll('[data-nav="link"]').forEach((n) => {
    const o = n.querySelector('[data-nav="indicator"]');
    if (!o) return;
    const i = e(new URL(n.href, window.location.origin)),
      r = "/" === i ? "/" === t : t === i || t.startsWith(i + "/");
    o.classList.toggle("is-current", r);
  });
}
function stickyNameOnLeave(e) {
  if (!stickyName.tl || !stickyName.triggered) return;
  const t =
    !!e.querySelector('[data-barba-namespace="archive"]') ||
    "archive" === e.getAttribute("data-barba-namespace");
  if (!(e.scrollHeight > window.innerHeight + 2) && !t) return;
  stickyName.triggered = !1;
  const n = document.querySelectorAll('[data-sticky-meta="text"]');
  (killTextTweens(n), animateTextReveal(n, "hide"), stickyName.tl.reverse());
}
function initStickyNameReveal() {
  const e = document.querySelector(".sticky-name-inner"),
    t = document.querySelectorAll('[data-sticky-meta="text"]');
  if (!e) return;
  const n = e.closest(".sticky-name-wrap") || e.parentElement;
  if (!!document.querySelector('[data-barba-namespace="archive"]'))
    return (
      gsap.set(n, { position: "fixed", bottom: 0, left: 0, right: 0 }),
      void requestAnimationFrame(() => lenis.resize())
    );
  if (
    (gsap.set(n, { clearProps: "position,bottom,left,right" }),
    stickyName.inner === e && stickyName.checkBottom)
  )
    return void gsap.delayedCall(0.15, stickyName.checkBottom);
  (stickyName.scrollHandler && lenis.off("scroll", stickyName.scrollHandler),
    stickyName.settledHandler &&
      window.removeEventListener("lenis:settled", stickyName.settledHandler),
    stickyName.waitInterval && clearInterval(stickyName.waitInterval),
    stickyName.tl?.kill(),
    gsap.killTweensOf(e),
    gsap.set(e, { clearProps: "width" }),
    (stickyName = {
      inner: e,
      tl: null,
      scrollHandler: null,
      settledHandler: null,
      waitInterval: null,
      triggered: !1,
      checkBottom: null,
    }),
    gsap.set(e, { opacity: 0 }),
    animateTextReveal(t, "hide"));
  const o = () => {
    if (!stickyName.tl) return;
    if (window.__transitionRunning || window.__preloaderRunning) return;
    if (document.querySelector('[data-barba-namespace="archive"]'))
      return void (
        stickyName.triggered &&
        ((stickyName.triggered = !1),
        killTextTweens(t),
        animateTextReveal(t, "hide"),
        stickyName.tl.reverse())
      );
    const e = lenis.limit,
      n = e <= 2 || lenis.scroll >= e - 2;
    n && !stickyName.triggered
      ? ((stickyName.triggered = !0), stickyName.tl.play())
      : !n &&
        stickyName.triggered &&
        ((stickyName.triggered = !1),
        killTextTweens(t),
        animateTextReveal(t, "hide"),
        stickyName.tl.reverse());
  };
  stickyName.checkBottom = o;
  const i = () => {
      (gsap.set(e, { opacity: 1 }),
        gsap.set(t, { visibility: "visible" }),
        animateTextReveal(t, "initial"),
        (stickyName.tl = gsap
          .timeline({
            paused: !0,
            onReverseComplete: () => {
              (killTextTweens(t), animateTextReveal(t, "initial"));
            },
          })
          .fromTo(
            e,
            { width: "100%" },
            { width: "29.45rem", duration: durM, ease: "InOut" },
          )
          .fromTo(
            e,
            { opacity: 0.1 },
            { opacity: 1, duration: durS, ease: "InOut" },
            `-=${durS}`,
          )
          .add(() => {
            (killTextTweens(t), animateTextReveal(t, "reveal", 0));
          })),
        stickyName.tl.progress(0).pause(),
        (stickyName.scrollHandler = () => o()),
        lenis.on("scroll", stickyName.scrollHandler),
        (stickyName.settledHandler = o),
        window.addEventListener("lenis:settled", stickyName.settledHandler),
        gsap.delayedCall(0.15, o));
    },
    r = () => window.__preloaderState?.done && !window.__transitionRunning;
  r()
    ? i()
    : (stickyName.waitInterval = setInterval(() => {
        r() &&
          (clearInterval(stickyName.waitInterval),
          (stickyName.waitInterval = null),
          i());
      }, 50));
}
function initDevGrid() {
  const e = document.querySelector(".nav-grid"),
    t = document.querySelector(".grid-wrap"),
    n = document.querySelectorAll(".grid-column");
  if (!e || !t || !n.length) return;
  const o = gsap.timeline({
    paused: !0,
    onStart: () => {
      t.style.display = "flex";
    },
    onReverseComplete: () => {
      t.style.display = "none";
    },
  });
  o.fromTo(
    n,
    { width: 0 },
    { width: "11.25rem", duration: durS, ease: "InOut" },
  );
  const i = () =>
    o.reversed() || (o.paused() && 0 === o.progress()) ? o.play() : o.reverse();
  return (
    e.addEventListener("click", i),
    () => {
      (e.removeEventListener("click", i),
        o.kill(),
        gsap.set(n, { clearProps: "width" }),
        (t.style.display = "none"));
    }
  );
}
function initLinks(e = document) {
  const t = gsap.utils.toArray(".link-inner", e);
  if (!t.length) return;
  const n = (e) => {
      const t = e.querySelector('[data-link="label"]'),
        n = e.querySelector('[data-link="shadow"]');
      if (!t || !n) return () => {};
      let o;
      const i = () => {
        (gsap.set(n, { display: "block" }),
          animateLink(n, "initial"),
          (o = gsap.timeline({ paused: !0 })),
          animateLink(t, "hide", 0, o, 0),
          animateLink(n, "reveal", 0, o, 0));
      };
      i();
      const r = () => o.play(),
        a = () => o.reverse();
      (e.addEventListener("mouseenter", r),
        e.addEventListener("mouseleave", a));
      const s = e.closest("[data-link-trigger]");
      return (
        s &&
          (s.addEventListener("mouseenter", r),
          s.addEventListener("mouseleave", a)),
        (e._setLinkText = (e) => {
          (o.kill(),
            t._split && (t._split.revert(), delete t._split),
            n._split && (n._split.revert(), delete n._split),
            (t.textContent = e),
            (n.textContent = e),
            i());
        }),
        () => {
          (e.removeEventListener("mouseenter", r),
            e.removeEventListener("mouseleave", a),
            s &&
              (s.removeEventListener("mouseenter", r),
              s.removeEventListener("mouseleave", a)),
            o.kill(),
            delete e._setLinkText,
            t._split && (t._split.revert(), delete t._split),
            n._split && (n._split.revert(), delete n._split));
        }
      );
    },
    o = gsap.matchMedia();
  return (
    o.add("(min-width: 992px)", () => {
      const e = t.map(n);
      return () => e.forEach((e) => e());
    }),
    () => o.revert()
  );
}
function initLogoMorph(e = document) {
  const t = e.querySelector("[data-morph-final]");
  if (!t) return;
  let n = t.dataset.morphFinal;
  n || ((n = t.getAttribute("d")), (t.dataset.morphFinal = n));
  const o = "M0 0 L95 0 L95 160 L0 160 Z",
    i = e.querySelector(".icon-wrap");
  i &&
    (gsap.killTweensOf([t, i]),
    gsap.set(t, { attr: { d: o } }),
    gsap.set(i, { visibility: "visible", clipPath: "inset(0% 0% 100% 0%)" }),
    gsap.to(i, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: durM,
      ease: "Out",
      onComplete: () => {
        gsap.to(t, { morphSVG: n, duration: durL, ease: "Out" });
      },
    }));
}
function initFeaturedHeadingWidth(e = document) {
  const t = e.querySelector('[data-featured="heading"]'),
    n = e.querySelector('[data-featured="globe"]'),
    o = e.querySelectorAll('[data-featured="text"]'),
    i = e.querySelectorAll('[data-featured="link"]');
  if (!t || !n) return;
  const r = t.scrollWidth,
    a = t.parentElement.offsetWidth;
  (gsap.set(t, { width: r }),
    gsap
      .timeline({
        scrollTrigger: {
          trigger: n,
          start: "top 75%",
          end: "bottom 25%",
          scrub: !0,
          onUpdate(e) {
            e.progress >= 0.99
              ? (o.forEach((e) => (e.style.display = "none")),
                i.forEach((e) => (e.style.display = "block")),
                (t.style.flexDirection = "column"),
                (t.style.alignItems = "center"),
                (t.style.justifyContent = "center"))
              : (o.forEach((e) => (e.style.display = "")),
                i.forEach((e) => (e.style.display = "none")),
                (t.style.flexDirection = ""),
                (t.style.alignItems = ""),
                (t.style.justifyContent = "space-between"));
          },
        },
      })
      .to(t, { width: a, ease: "none" })
      .to(t, { width: r, ease: "none" }));
}
function initFeaturedHeadingHeightMobile(e = document) {
  const t = e.querySelector('[m-data-featured="wrap"]'),
    n = e.querySelector('[m-data-featured="heading"]'),
    o = e.querySelector('[m-data-featured="list"]'),
    i = e.querySelectorAll('[m-data-featured="text"]'),
    r = e.querySelectorAll('[m-data-featured="link"]');
  if (!t || !n || !o) return;
  const a = n.scrollHeight;
  (gsap.set(n, { height: a }),
    gsap.set(o, { xPercent: 100 }),
    gsap.fromTo(
      o,
      { xPercent: 100 },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: t,
          start: "top bottom",
          end: "top top",
          scrub: !0,
        },
      },
    ),
    gsap
      .timeline({
        scrollTrigger: {
          trigger: t,
          start: "top top",
          end: "bottom bottom",
          scrub: !0,
          onUpdate(e) {
            e.progress >= 0.99
              ? (i.forEach((e) => (e.style.display = "none")),
                r.forEach((e) => (e.style.display = "block")))
              : (i.forEach((e) => (e.style.display = "")),
                r.forEach((e) => (e.style.display = "none")));
          },
        },
      })
      .to(o, { xPercent: -100, duration: 0.8, ease: "none" }, 0)
      .to(n, { height: 0.12 * a, duration: 1, ease: "none" }, 0.28));
}
function initAwards(e = document) {
  const t = e.querySelectorAll('[data-award="item"]');
  if (!t.length) return;
  let n = 1;
  t.forEach((e) => {
    if (e._awardInit) return;
    e._awardInit = !0;
    const t = e.querySelector('[data-award="certificate"]');
    if (!t) return;
    gsap.set(t, {
      display: "block",
      clipPath: "inset(100% 0% 0% 0%)",
      scale: 0.9,
    });
    const o = () => {
        (n++,
          gsap.set(t, { zIndex: n }),
          gsap.killTweensOf(t),
          gsap.to(t, {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: durS,
            ease: "Out",
            overwrite: "auto",
          }));
      },
      i = () => {
        (gsap.killTweensOf(t),
          gsap.to(t, {
            clipPath: "inset(0% 0% 100% 0%)",
            scale: 0.9,
            duration: durS,
            ease: "Out",
            overwrite: "auto",
          }));
      };
    (e.addEventListener("mouseenter", o), e.addEventListener("mouseleave", i));
  });
}
function initWorksIntroMask(e = document, t = null) {
  const n = e.querySelector(".works-overlay"),
    o = e.querySelector('[data-works-intro="trigger"]'),
    i = e.querySelector('[data-works-intro="out"]'),
    r = e.querySelector('[data-works-intro="left-text"]'),
    a = e.querySelector('[data-works-intro="right-text"]');
  if (!n || !o || !i) return;
  const s = window.matchMedia("(max-width: 991px)").matches,
    l = getComputedStyle(n),
    c = (e) => {
      const t = document.createElement("div");
      ((t.style.width = e), document.body.appendChild(t));
      const n = parseFloat(getComputedStyle(t).width);
      return (document.body.removeChild(t), n);
    };
  let d, u;
  if (s) ((d = c("60.305rem")), (u = c("83.46rem")));
  else {
    ((d =
      4 * c(l.getPropertyValue("--_special-units---1-cell").trim()) +
      3 * c(l.getPropertyValue("--_special-units---grid-gap").trim())),
      (u = 0.6 * window.innerHeight));
  }
  const p = d / 2,
    m = u / 2,
    g = (e, t) => {
      n.style.clipPath = `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, calc(50% - ${e}px) calc(50% - ${t}px), calc(50% + ${e}px) calc(50% - ${t}px), calc(50% + ${e}px) calc(50% + ${t}px), calc(50% - ${e}px) calc(50% + ${t}px), calc(50% - ${e}px) calc(50% - ${t}px))`;
    },
    f = () => n.offsetWidth / 2,
    h = () => n.offsetHeight / 2,
    v = () => (t ? t.xOff : p),
    y = () => (t ? t.yOff : m),
    w = (e) => {
      const t = v(),
        n = y();
      (g(t + (f() - t) * e, n + (h() - n) * e),
        r && gsap.set(r, { x: -50 * e + "vw" }),
        a && gsap.set(a, { x: 50 * e + "vw" }));
    },
    b = (e) => {
      g(f() + (p - f()) * e, h() + (m - h()) * e);
    };
  (ScrollTrigger.create({
    trigger: o,
    start: "center center",
    end: "top top",
    scrub: !0,
    onUpdate: (e) => w(e.progress),
  }),
    ScrollTrigger.create({
      trigger: i,
      start: "top bottom",
      end: "bottom bottom",
      scrub: !0,
      onUpdate: (e) => b(e.progress),
    }));
}
function initFilterTabs(e = document) {
  const t = e.querySelectorAll("[data-filter-tab]"),
    n = e.querySelectorAll("[data-filter-content]");
  if (!t.length || !n.length) return;
  const o = e.querySelector('[data-globe="wrap"]'),
    i = "globe",
    r = "cards",
    a = (e, t) => {
      gsap.to(e, { opacity: t, duration: durS, ease: "Out" });
    },
    s = Array.from(n).find((e) => e.getAttribute("data-filter-content") === r),
    l = Array.from(n).find((e) => e.getAttribute("data-filter-content") === i);
  if (s) {
    const e = s.querySelector('[data-tab-content-reval="list"]');
    if (e) {
      const t = Array.from(
        e.querySelectorAll('[data-tab-content-reval="item"]'),
      );
      if (t.length) {
        const n = e.getBoundingClientRect(),
          o = n.left + n.width / 2,
          i = [],
          r = [];
        (t.forEach((e) => {
          const t = e.getBoundingClientRect();
          (t.left + t.width / 2 < o ? i : r).push(e);
        }),
          (s._splitCache = { left: i, right: r }));
      }
    }
  }
  if (o && s) {
    const e = new IntersectionObserver(
      (t) => {
        for (const n of t)
          if (n.isIntersecting) {
            (o._globeEnsureInit?.(), e.disconnect());
            break;
          }
      },
      { rootMargin: "50% 0% 50% 0%" },
    );
    e.observe(s);
  }
  let c = null;
  const d = (e, n = !1) => {
    if (e !== c || n) {
      if (
        ((c = e),
        t.forEach((t) => {
          const n = t.getAttribute("data-filter-tab") === e;
          (t.classList.toggle("is-active", n),
            (t._isActive = n),
            a(t, n ? 1 : 0.4));
        }),
        n)
      )
        return (
          e === i
            ? (s && (s.style.display = "none"),
              animateGlobe(o, "initial"),
              l && (l.style.display = "block"),
              requestAnimationFrame(() => animateGlobe(o, "reveal", 0)))
            : (l && (l.style.display = "none"),
              s && (s.style.display = "block")),
          void requestAnimationFrame(() => ScrollTrigger.refresh())
        );
      e === i
        ? (animateGlobe(o, "initial"),
          l && (l.style.display = "block"),
          requestAnimationFrame(() => {
            (animateGlobe(o, "reveal", 0),
              animateCardsSplit(s, "hide", 0, () => {
                (s && c === i && (s.style.display = "none"),
                  ScrollTrigger.refresh());
              }));
          }))
        : e === r &&
          (animateCardsSplit(s, "initial"),
          s && (s.style.display = "block"),
          requestAnimationFrame(() => {
            (animateCardsSplit(s, "reveal", 0),
              animateGlobe(o, "hide", 0, () => {
                (l && c === r && (l.style.display = "none"),
                  ScrollTrigger.refresh());
              }));
          }));
    }
  };
  (t.forEach((e) => {
    const t = () => d(e.getAttribute("data-filter-tab")),
      n = () => a(e, 1),
      o = () => {
        e._isActive || a(e, 0.4);
      };
    (e.addEventListener("click", t),
      e.addEventListener("mouseenter", n),
      e.addEventListener("mouseleave", o),
      (e._filterHandler = t),
      (e._filterEnter = n),
      (e._filterLeave = o));
  }),
    d(r, !0));
}
function initWorksItemHover(e = document) {
  const t = e.querySelectorAll('[data-works-item="wrap"]');
  t.length &&
    t.forEach((e) => {
      const t = e.querySelector('[data-works-item="button"]');
      t &&
        (gsap.set(t, { bottom: "-2.222rem" }),
        e.addEventListener("mouseenter", () => {
          gsap.to(t, {
            bottom: "1.111rem",
            duration: durM,
            ease: "InOut",
            overwrite: "auto",
          });
        }),
        e.addEventListener("mouseleave", () => {
          gsap.to(t, {
            bottom: "-2.222rem",
            duration: durM,
            ease: "InOut",
            overwrite: "auto",
          });
        }));
    });
}
function initTiltCursor() {
  const e = document.querySelectorAll('[data-tilt="wrap"]');
  if (!e.length) return;
  const t = 25,
    n = 40;
  gsap.matchMedia().add("(min-width: 992px)", () => {
    const o = [];
    return (
      e.forEach((e) => {
        const i = e.querySelector('[data-tilt="card"]');
        if (!i) return;
        gsap.set(i, {
          transformPerspective: 1e3,
          transformStyle: "preserve-3d",
        });
        const r = gsap.quickTo(i, "rotationX", {
            duration: 0.6,
            ease: "power3.out",
          }),
          a = gsap.quickTo(i, "rotationY", {
            duration: 0.6,
            ease: "power3.out",
          }),
          s = (o) => {
            const i = e.getBoundingClientRect(),
              s = (o.clientX - i.left) / i.width,
              l = (o.clientY - i.top) / i.height;
            (a(gsap.utils.mapRange(0, 1, -n, n, s)),
              r(gsap.utils.mapRange(0, 1, t, -t, l)));
          },
          l = () => {
            (r(0), a(0));
          };
        (e.addEventListener("mousemove", s),
          e.addEventListener("mouseleave", l),
          o.push(() => {
            (e.removeEventListener("mousemove", s),
              e.removeEventListener("mouseleave", l),
              gsap.set(i, { clearProps: "transform" }));
          }));
      }),
      () => o.forEach((e) => e())
    );
  });
}
function initCutList(e = document) {
  const t = e.querySelectorAll('[data-cut="list"]');
  t.length &&
    t.forEach((t) => {
      let n = null,
        o = t.parentElement;
      for (; o && o !== e.parentElement && !n;)
        ((n = o.querySelector('[data-cut="counter"]')), (o = o.parentElement));
      const i = Array.from(t.querySelectorAll('[data-cut="item"]'));
      if (!i.length) return;
      const r = parseInt(t.getAttribute("data-cut-max"), 10) || 1,
        a = i.length - r;
      (i.forEach((e, t) => {
        t >= r && (e.style.display = "none");
      }),
        n &&
          a > 0 &&
          ((n.textContent = `+${a}`),
          n.style.setProperty("display", "block", "important")));
    });
}
function initNextEntity(e = 1) {
  const t = document.querySelector("[data-barba-namespace]");
  if (!t) return;
  const n = t.getAttribute("data-barba-namespace"),
    o = [...document.querySelectorAll("[data-next-entity-item]")];
  if (!o.length) return;
  const i = o.findIndex((e) => e.dataset.nextEntityItem === n),
    r = new Set(Array.from({ length: e }, (e, t) => o[(i + 1 + t) % o.length]));
  o.forEach((e) => {
    r.has(e) || e.remove();
  });
}
function initContactDial(e = document) {
  const t = e.querySelector('[data-contact-dial="wrap"]');
  if (!t) return;
  gsap.matchMedia().add("(min-width: 992px)", () => {
    function e(e) {
      (gsap.killTweensOf(e),
        killTextTweens(e),
        e._split && (e._split.revert(), delete e._split));
    }
    function n(e) {
      e &&
        (gsap.killTweensOf(e),
        killTextTweens(e),
        gsap.to(getTextFeBlurs(e), {
          attr: { stdDeviation: 50 },
          duration: durM,
          ease: "InOut",
        }),
        gsap.to(e, {
          autoAlpha: 0,
          duration: durM,
          ease: "InOut",
          overwrite: "auto",
        }));
    }
    function o(t, n) {
      (e(t),
        (t.textContent = n),
        animateTextReveal(t, "initial", 0),
        gsap.set(t, { autoAlpha: 0 }),
        requestAnimationFrame(() => {
          g &&
            (gsap.to(getTextFeBlurs(t), {
              attr: { stdDeviation: 0 },
              duration: durM,
              ease: "InOut",
            }),
            gsap.to(t, {
              autoAlpha: 1,
              duration: durM,
              ease: "InOut",
              overwrite: "auto",
            }));
        }));
    }
    const i = t.querySelectorAll("[data-contact-dial-item]"),
      r = t.querySelector('[data-contact-dial="text"]'),
      a = t.querySelector('[data-contact-dial="logo"]'),
      s = t.querySelector(".dial-center");
    if (!r || !a) return;
    const l = {
        theme: "change theme",
        email: "send email",
        instagram: "open instagram",
        behance: "open behance",
        linkedin: "open linkedin",
      },
      c = r.parentNode;
    "static" === getComputedStyle(c).position &&
      (c.style.position = "relative");
    const d = r.cloneNode(!1);
    (d.removeAttribute("data-contact-dial"), c.appendChild(d));
    const u = [r, d];
    u.forEach((e) =>
      gsap.set(e, {
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
    let p = null,
      m = null,
      g = !1,
      f = null;
    const h = new Map(),
      v = new Map();
    return (
      i.forEach((e) => {
        const t = e.getAttribute("data-contact-dial-item"),
          r = () => {
            if ((f && (clearTimeout(f), (f = null)), (g = !0), t === m && p))
              return;
            m = t;
            const e = p === u[0] ? u[1] : u[0];
            (n(p),
              o(e, l[t] ?? ""),
              (p = e),
              gsap.to(a, {
                opacity: 0,
                duration: durS,
                ease: "InOut",
                overwrite: "auto",
              }));
          },
          c = (e) => {
            [...i].some(
              (t) => t === e.relatedTarget || t.contains(e.relatedTarget),
            ) ||
              (s && (s === e.relatedTarget || s.contains(e.relatedTarget))) ||
              u.some(
                (t) => t === e.relatedTarget || t.contains(e.relatedTarget),
              ) ||
              (f && clearTimeout(f),
              (f = setTimeout(() => {
                ((f = null),
                  (g = !1),
                  (m = null),
                  n(p),
                  (p = null),
                  gsap.to(a, {
                    opacity: 1,
                    duration: durS,
                    ease: "InOut",
                    overwrite: "auto",
                  }));
              }, 100)));
          };
        (e.addEventListener("mouseenter", r),
          e.addEventListener("mouseleave", c),
          h.set(e, r),
          v.set(e, c));
      }),
      () => {
        (f && clearTimeout(f),
          i.forEach((e) => {
            (e.removeEventListener("mouseenter", h.get(e)),
              e.removeEventListener("mouseleave", v.get(e)));
          }),
          u.forEach((e) => {
            (gsap.killTweensOf(e),
              killTextTweens(e),
              e._split && (e._split.revert(), delete e._split));
          }),
          d.remove(),
          gsap.set([r, a], { clearProps: "all" }));
      }
    );
  });
}
function initGlobe(e = document) {
  const t = e.querySelector('[data-globe="wrap"]');
  if (!t) return;
  if (window.matchMedia("(max-width: 991px)").matches)
    return ((t._globeEnsureInit = null), void (t._globeDestroy = () => {}));
  const n = !!e.querySelector("[data-filter-tab]");
  let o = !1,
    i = null;
  const r = () => {
    o ||
      ((o = !0),
      i?.disconnect(),
      (i = null),
      _initGlobeReal(t, e),
      n ||
        requestAnimationFrame(() => {
          t._globeAnimate?.("reveal", 0);
        }));
  };
  ((t._globeEnsureInit = r),
    n ||
      ((i = new IntersectionObserver(
        (e) => {
          for (const t of e)
            if (t.isIntersecting) {
              r();
              break;
            }
        },
        { rootMargin: "50% 0% 50% 0%" },
      )),
      i.observe(t)),
    (t._globeDestroy = () => {
      i?.disconnect();
    }));
}
function _initGlobeReal(e, t) {
  function n(e) {
    const t = [],
      n = Math.PI * (3 - Math.sqrt(5));
    for (let o = 0; o < e; o++) {
      const i = 1 - (o / (e - 1)) * 2,
        r = Math.sqrt(1 - i * i),
        a = n * o;
      t.push(new h.Vector3(Math.cos(a) * r, i, Math.sin(a) * r));
    }
    return t;
  }
  function o(e) {
    return 0.5 * (Math.sin(e * Math.PI * 2) + 1);
  }
  function i(e, t = 1024) {
    const n = e.srcset || "";
    if (!n) return e.src || e.dataset.src;
    const o = n
        .split(",")
        .map((e) => {
          const [t, n] = e.trim().split(/\s+/);
          return { url: t, w: parseInt(n) || 0 };
        })
        .filter((e) => e.w > 0)
        .sort((e, t) => e.w - t.w),
      i = o.find((e) => e.w >= t) || o[o.length - 1];
    return i ? i.url : e.src || e.dataset.src;
  }
  function r() {
    for (; ve < $ && he.length;) {
      const e = he.shift();
      (ve++,
        e(() => {
          (ve--, requestAnimationFrame(r));
        }));
    }
  }
  function a(e, t, n, o) {
    ((e.anisotropy = Math.min(4, w.capabilities.getMaxAnisotropy())),
      (e.generateMipmaps = !0),
      (e.minFilter = h.LinearMipmapLinearFilter));
    const i = e.image.width || 1600,
      r = e.image.height || 900,
      a = _,
      s = _ / (i / r),
      l = t.clone().multiplyScalar(x),
      c = new h.PlaneGeometry(a, s),
      d = new h.MeshBasicMaterial({
        map: e,
        transparent: !0,
        side: h.DoubleSide,
      });
    d.onBeforeCompile = (e) => {
      e.fragmentShader = e.fragmentShader.replace(
        "#include <map_fragment>",
        "\n        vec2 mapUv = vUv;\n        if (!gl_FrontFacing) { mapUv.x = 1.0 - mapUv.x; }\n        vec4 sampledDiffuseColor = texture2D(map, mapUv);\n        diffuseColor *= sampledDiffuseColor;\n        ",
      );
    };
    const u = new h.Mesh(c, d);
    (u.position.copy(l),
      u.lookAt(0, 0, 0),
      u.rotateY(Math.PI),
      (u.frustumCulled = !1),
      u.scale.setScalar(0),
      (u.visible = !1),
      te.add(u));
    try {
      w.initTexture(e);
    } catch (e) {}
    try {
      w.compile(b, E);
    } catch (e) {}
    const p = {
      mesh: u,
      mat: d,
      slug: n,
      origPos: l.clone(),
      origDir: l.clone().normalize(),
      origQuat: u.quaternion.clone(),
      _t: 0,
      liftT: 0,
      pinned: !1,
      inOverlay: !1,
      snapPos: new h.Vector3(),
      snapQuat: new h.Quaternion(),
      hoverable: !1,
      cooldown: 0,
      revealT: 0,
    };
    "shown" === Be
      ? ((p.revealT = 1), (p.mesh.visible = !0))
      : "revealing" === Be &&
        ((p.mesh.visible = !0),
        gsap.to(p, { revealT: 1, duration: z, ease: "Out", overwrite: !0 }));
    const m = h.Mesh.prototype.raycast;
    ((u.raycast = function (e, t) {
      p.hoverable && m.call(this, e, t);
    }),
      oe.push(p),
      (ie = oe.map((e) => e.mesh)),
      o());
  }
  function s() {
    const e = x + 0.6 * _,
      t = (E.fov * Math.PI) / 180,
      n = 2 * Math.atan(Math.tan(t / 2) * E.aspect);
    E.position.z = 1.08 * Math.max(e / Math.tan(t / 2), e / Math.tan(n / 2));
  }
  function l(e) {
    e.inOverlay ||
      (e.mesh.getWorldPosition(e.snapPos),
      e.mesh.getWorldQuaternion(e.snapQuat),
      te.remove(e.mesh),
      e.mesh.position.copy(e.snapPos),
      e.mesh.quaternion.copy(e.snapQuat),
      e.mesh.scale.setScalar(1),
      ne.add(e.mesh),
      (e.inOverlay = !0));
  }
  function c(e) {
    e.inOverlay &&
      (ne.remove(e.mesh),
      e.mesh.position.copy(e.origPos),
      e.mesh.quaternion.copy(e.origQuat),
      e.mesh.scale.setScalar(1),
      (e.mesh.renderOrder = 0),
      (e.mat.depthTest = !0),
      (e._t = 0),
      (e.cooldown = P),
      te.add(e.mesh),
      (e.inOverlay = !1));
  }
  function d() {
    we && ((we.pinned = !1), (we = null));
  }
  function u() {
    (d(), ce(), (Re = 0), (Se = 0));
  }
  function p() {
    He = requestAnimationFrame(p);
    const t = Math.min($e.getDelta(), 0.05),
      n = Math.min(1, 60 * t);
    ((ze += t * q),
      _e || Ae || we
        ? ((Se = 0), (Te = 0))
        : ((Se += t), Se > R / 1e3 && (Te = C)),
      (xe += (Te - xe) * (Ae ? 0.18 : 0.03) * n),
      (Re *= Math.pow(Ae ? A : L, n)),
      (Pe += (Re + xe) * n),
      (te.rotation.y = Pe),
      (j.y = Pe),
      G.setFromEuler(j),
      Q.copy(G).invert());
    let i = null;
    if (_e && !Ae && "shown" === Be && ie.length) {
      be.setFromCamera(Ee, E);
      const e = be.intersectObjects(ie, !1);
      e.length && (i = oe.find((t) => t.mesh === e[0].object));
    }
    const r = Ae ? "grabbing" : i ? "pointer" : "grab";
    r !== Ue && ((e.style.cursor = r), (Ue = r));
    for (let e = 0; e < oe.length; e++) {
      const r = oe[e];
      r.cooldown > 0 && (r.cooldown = Math.max(0, r.cooldown - t));
      const a = r.revealT,
        s = a < 1,
        d = r === i && !r.pinned && 0 === r.cooldown && !s,
        u = r.pinned;
      (u && !r.inOverlay && l(r), !u && r.inOverlay && 0 === r.liftT && c(r));
      const p = u ? 1 : 0;
      if (
        ((r.liftT += 0.12 * (p - r.liftT) * n),
        0 === p && r.liftT < 0.005
          ? (r.liftT = 0)
          : 1 === p && r.liftT > 0.995 && (r.liftT = 1),
        r.inOverlay)
      ) {
        const e = r.origPos.y * F,
          t = o(ze + e) * I;
        (B.copy(r.origPos).addScaledVector(r.origDir, t).applyQuaternion(G),
          Y.copy(r.origQuat).premultiply(G));
        const i = u ? r.snapPos : B,
          a = u ? r.snapQuat : Y;
        (X.lerpVectors(i, J, r.liftT),
          r.mesh.position.copy(X),
          V.slerpQuaternions(a, ee, r.liftT),
          r.mesh.quaternion.copy(V));
        const s = 1 + (S - 1) * r.liftT;
        if (
          (r.mesh.scale.setScalar(s),
          (r.mesh.renderOrder = u ? O : D),
          (r.mat.depthTest = !1),
          (r.hoverable = !1),
          u)
        )
          r.mat.opacity = 1;
        else {
          (Z.copy(K).applyQuaternion(r.origQuat).applyQuaternion(G),
            W.copy(E.position).normalize());
          const e = Z.dot(W),
            t = e > 0.25 ? 1 : e > 0 ? 0.1 + (e / 0.25) * 0.9 : 0.1,
            o = r.liftT + t * (1 - r.liftT);
          r.mat.opacity += 0.12 * (o - r.mat.opacity) * n;
        }
      } else {
        ((r._t += 0.1 * ((d ? 1 : 0) - r._t) * n),
          r._t > 0.001
            ? (Y.copy(E.quaternion).premultiply(Q),
              r.mesh.quaternion.slerpQuaternions(r.origQuat, Y, r._t))
            : r.mesh.quaternion.copy(r.origQuat));
        const e = r.origPos.y * F,
          t = o(ze + e) * I;
        (B.copy(r.origPos).addScaledVector(r.origDir, t).multiplyScalar(a),
          r.mesh.position.copy(B),
          r.mesh.scale.setScalar(a),
          (r.mesh.renderOrder = 0),
          (r.mat.depthTest = !0),
          Z.copy(K).applyQuaternion(r.mesh.quaternion).applyQuaternion(G),
          W.copy(E.position).normalize());
        const i = Z.dot(W),
          l = (i > 0.25 ? 1 : i > 0 ? 0.1 + (i / 0.25) * 0.9 : 0.1) * a;
        s
          ? ((r.mat.opacity = l), (r.hoverable = !1))
          : ((r.hoverable = i > 0.05 && 0 === r.cooldown && "shown" === Be),
            (r.mat.opacity += 0.1 * (l - r.mat.opacity) * n));
      }
    }
    w.render(b, E);
  }
  function m() {
    null === He && ($e.getDelta(), p());
  }
  function g() {
    null !== He && (cancelAnimationFrame(He), (He = null));
  }
  function f() {
    We && (We.kill(), (We = null));
  }
  const h = window.THREE;
  if (!h) return;
  const v = () => e.clientWidth,
    y = () => e.clientHeight,
    w = new h.WebGLRenderer({
      antialias: !0,
      alpha: !0,
      powerPreference: "high-performance",
    });
  (w.setPixelRatio(Math.min(devicePixelRatio, 2)),
    w.setClearColor(0, 0),
    w.setSize(Math.max(v(), 1), Math.max(y(), 1)),
    e.appendChild(w.domElement),
    Object.assign(w.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    }),
    (e.style.cursor = "grab"));
  const b = new h.Scene(),
    E = new h.PerspectiveCamera(
      48,
      Math.max(v(), 1) / Math.max(y(), 1),
      0.1,
      1e3,
    ),
    _ = 0.4,
    x = 1.85,
    T = 1.8,
    S = 3.2,
    k = 0.11,
    M = 0.013,
    A = 0.9,
    L = 0.94,
    C = 0.003,
    R = 1e3,
    P = 0.4,
    I = 0.1,
    q = 0.1,
    F = 1.5,
    O = 999,
    D = 500,
    $ = 3,
    z = 1.4,
    H = 0.015,
    U = 0.6,
    N = 0.008,
    B = new h.Vector3(),
    X = new h.Vector3(),
    W = new h.Vector3(),
    Y = new h.Quaternion(),
    V = new h.Quaternion(),
    G = new h.Quaternion(),
    Q = new h.Quaternion(),
    j = new h.Euler(0, 0, 0, "YXZ"),
    Z = new h.Vector3(),
    K = new h.Vector3(0, 0, 1),
    J = new h.Vector3(0, 0, T),
    ee = new h.Quaternion(),
    te = new h.Group(),
    ne = new h.Group();
  b.add(te, ne);
  const oe = [];
  let ie = [];
  const re = Array.from(t.querySelectorAll("[data-works-info]")),
    ae = (e) =>
      re.find((t) => (t.getAttribute("data-works-info") || "").trim() === e);
  (animateDivReveal(re, "initial"),
    re.forEach((e) => {
      e.style.display = "none";
    }));
  let se = null;
  const le = durS,
    ce = () => {
      if (!se) return;
      const e = se;
      ((se = null),
        animateDivReveal(e, "hide"),
        gsap.delayedCall(le, () => {
          se !== e && (e.style.display = "none");
        }));
    },
    de = (e) => {
      const t = ae(e);
      if (t) {
        if (se !== t) {
          if (se) {
            const e = se;
            (animateDivReveal(e, "hide"),
              gsap.delayedCall(le, () => {
                se !== e && (e.style.display = "none");
              }));
          }
          ((se = t),
            animateDivReveal(t, "initial"),
            (t.style.display = "block"),
            requestAnimationFrame(() => {
              se === t && animateDivReveal(t, "reveal");
            }));
        }
      } else ce();
    },
    ue = t.querySelector('[data-globe="database"]'),
    pe = ue ? Array.from(ue.querySelectorAll('[data-globe="img"]')) : [];
  if (!pe.length) return;
  const me = new h.TextureLoader();
  me.crossOrigin = "anonymous";
  const ge = pe.length,
    fe = n(Math.ceil(2.5 * ge))
      .filter((e) => Math.abs(e.y) < 0.55)
      .slice(0, ge);
  ue &&
    Object.assign(ue.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      width: "0",
      height: "0",
      overflow: "hidden",
    });
  const he = [];
  let ve = 0;
  (pe.forEach((e, t) => {
    const n = fe[t],
      o = e.querySelector("img");
    if (!n || !o) return;
    const r = (
        e.getAttribute("data-works-database") ||
        o.getAttribute("data-works-database") ||
        ""
      ).trim(),
      s = i(o, 1024);
    s &&
      he.push((e) => {
        me.load(
          s,
          (t) => a(t, n, r, e),
          void 0,
          () => e(),
        );
      });
  }),
    r());
  const ye = new ResizeObserver(() => {
    const e = v(),
      t = y();
    0 !== e &&
      0 !== t &&
      (w.setSize(e, t), (E.aspect = e / t), E.updateProjectionMatrix(), s());
  });
  (ye.observe(e), s());
  let we = null;
  const be = new h.Raycaster(),
    Ee = new h.Vector2(-9, -9);
  let _e = !1,
    xe = C,
    Te = C,
    Se = 0;
  const ke = (t) => {
      const n = e.getBoundingClientRect();
      ((Ee.x = ((t.clientX - n.left) / n.width) * 2 - 1),
        (Ee.y = (-(t.clientY - n.top) / n.height) * 2 + 1),
        (_e =
          t.clientX >= n.left &&
          t.clientX <= n.right &&
          t.clientY >= n.top &&
          t.clientY <= n.bottom));
    },
    Me = () => {
      ((_e = !1), Ee.set(-9, -9));
    };
  let Ae = !1,
    Le = !1,
    Ce = 0,
    Re = 0,
    Pe = 0;
  const Ie = (e) => {
      ((Ae = !0), (Le = !1), (Ce = e.clientX), (Re = 0));
    },
    qe = () => {
      Ae = !1;
    },
    Fe = (e) => {
      if (!Ae) return;
      const t = e.clientX - Ce;
      (0 !== t && we && u(),
        Math.abs(t) > 3 && (Le = !0),
        (Re += t * M),
        Re > k ? (Re = k) : Re < -k && (Re = -k),
        (Ce = e.clientX));
    },
    Oe = () => {
      if (Le) return;
      be.setFromCamera(Ee, E);
      const e = be.intersectObjects(ie, !1),
        t = e.length ? oe.find((t) => t.mesh === e[0].object) : null;
      t && !t.pinned
        ? (we && d(), (t.pinned = !0), (t.cooldown = 0), (we = t), de(t.slug))
        : we && u();
    },
    De = () => {
      we && u();
    };
  (e.addEventListener("mousemove", ke),
    e.addEventListener("mouseleave", Me),
    e.addEventListener("mousedown", Ie),
    e.addEventListener("click", Oe),
    window.addEventListener("mouseup", qe),
    window.addEventListener("mousemove", Fe),
    lenis?.on && lenis.on("scroll", De),
    window.addEventListener("wheel", De, { passive: !0 }),
    window.addEventListener("touchmove", De, { passive: !0 }));
  const $e = new h.Clock();
  let ze = 0,
    He = null,
    Ue = "grab",
    Ne = !0,
    Be = "initial";
  const Xe = new IntersectionObserver(
    (e) => {
      for (const t of e)
        ((Ne = t.isIntersecting),
          Ne
            ? m()
            : ("shown" !== Be && "hidden" !== Be && "initial" !== Be) || g());
    },
    { threshold: 0 },
  );
  Xe.observe(e);
  let We = null;
  ((e._globeAnimate = (e, t, n) => {
    switch (e) {
      case "initial":
        (f(),
          u(),
          oe.forEach((e) => {
            ((e.revealT = 0),
              (e.mesh.visible = !1),
              e.mesh.scale.setScalar(0),
              (e.mat.opacity = 0),
              (e.hoverable = !1));
          }),
          (Be = "initial"));
        try {
          w.render(b, E);
        } catch (e) {}
        n?.();
        break;
      case "reveal": {
        (f(), (Be = "revealing"));
        const e = v(),
          o = y();
        (e > 0 &&
          o > 0 &&
          (w.setSize(e, o),
          (E.aspect = e / o),
          E.updateProjectionMatrix(),
          s()),
          m());
        const i = oe
          .map((e, t) => t)
          .sort(() => Math.random() - 0.5)
          .map((e) => oe[e]);
        (i.forEach((e) => {
          ((e.mesh.visible = !0), (e.revealT = 0));
        }),
          (We =
            0 === i.length
              ? gsap.delayedCall(z + (t ?? 0), () => {
                  ((Be = "shown"), (We = null), n?.());
                })
              : gsap.to(i, {
                  revealT: 1,
                  duration: z,
                  delay: t ?? 0,
                  ease: "Out",
                  stagger: H,
                  overwrite: !0,
                  onComplete: () => {
                    ((Be = "shown"), (We = null), n?.());
                  },
                })));
        break;
      }
      case "hide": {
        (f(), u(), (Be = "hiding"), m());
        const e = oe
          .map((e, t) => t)
          .sort(() => Math.random() - 0.5)
          .map((e) => oe[e]);
        if (0 === e.length) {
          ((Be = "hidden"), n?.());
          break;
        }
        We = gsap.to(e, {
          revealT: 0,
          duration: U,
          delay: t ?? 0,
          ease: "In",
          stagger: N,
          overwrite: !0,
          onComplete: () => {
            ((Be = "hidden"),
              oe.forEach((e) => {
                e.mesh.visible = !1;
              }),
              (We = null));
            try {
              w.render(b, E);
            } catch (e) {}
            (Ne || g(), n?.());
          },
        });
        break;
      }
    }
  }),
    (e._globeGetDuration = (e, t) => {
      const n = t ?? 0,
        o = Math.max(0, ge - 1);
      return "reveal" === e ? n + z + H * o : "hide" === e ? n + U + N * o : 0;
    }),
    (Be = "initial"),
    m(),
    (e._globeDestroy = () => {
      (f(),
        g(),
        Xe.disconnect(),
        ye.disconnect(),
        (he.length = 0),
        ce(),
        (e.style.cursor = ""),
        e.removeEventListener("mousemove", ke),
        e.removeEventListener("mouseleave", Me),
        e.removeEventListener("mousedown", Ie),
        e.removeEventListener("click", Oe),
        window.removeEventListener("mouseup", qe),
        window.removeEventListener("mousemove", Fe),
        lenis?.off && lenis.off("scroll", De),
        window.removeEventListener("wheel", De),
        window.removeEventListener("touchmove", De),
        oe.forEach((e) => {
          (e.mesh.geometry.dispose(), e.mat.map?.dispose(), e.mat.dispose());
        }),
        w.dispose(),
        w.domElement.parentNode === e && e.removeChild(w.domElement));
    }));
}
function animateGlobe(e, t, n, o) {
  return e
    ? (e._globeEnsureInit?.(),
      e._globeAnimate
        ? (e._globeAnimate(t, n, o), e._globeGetDuration?.(t, n) ?? 0)
        : (o?.(), 0))
    : (o?.(), 0);
}
function animateCardsSplit(e, t, n, o) {
  if (!e) return (o?.(), 0);
  const i = e.querySelector('[data-tab-content-reval="list"]');
  if (!i) return (o?.(), 0);
  const r = Array.from(i.querySelectorAll('[data-tab-content-reval="item"]'));
  if (!r.length) return (o?.(), 0);
  if (window.matchMedia("(max-width: 991px)").matches)
    return (gsap.killTweensOf(r), gsap.set(r, { clearProps: "x" }), o?.(), 0);
  if (!e._splitCache) {
    const t = i.getBoundingClientRect();
    if (0 === t.width) return (o?.(), 0);
    const n = t.left + t.width / 2,
      a = [],
      s = [];
    (r.forEach((e) => {
      const t = e.getBoundingClientRect();
      (t.left + t.width / 2 < n ? a : s).push(e);
    }),
      (e._splitCache = { left: a, right: s }));
  }
  const { left: a, right: s } = e._splitCache,
    l = n ?? 0,
    c = a.length >= s.length ? a : s;
  let d = !1;
  const u = () => {
    d || ((d = !0), o?.());
  };
  switch (t) {
    case "initial":
      return (
        gsap.killTweensOf(r),
        gsap.set(a, { x: "-100vw" }),
        gsap.set(s, { x: "100vw" }),
        u(),
        0
      );
    case "reveal":
      return (
        gsap.killTweensOf(r),
        gsap.set(a, { x: "-100vw" }),
        gsap.set(s, { x: "100vw" }),
        gsap.to(a, {
          x: 0,
          duration: splitWorksDur,
          delay: l,
          stagger: splitWorksStagger,
          ease: "Out",
          overwrite: !0,
          onComplete: c === a ? u : void 0,
        }),
        gsap.to(s, {
          x: 0,
          duration: splitWorksDur,
          delay: l,
          stagger: splitWorksStagger,
          ease: "Out",
          overwrite: !0,
          onComplete: c === s ? u : void 0,
        }),
        l + splitWorksDur + splitWorksStagger * Math.max(0, c.length - 1)
      );
    case "hide":
      return (
        gsap.killTweensOf(r),
        gsap.to(a, {
          x: "-100vw",
          duration: splitWorksDur,
          delay: l,
          stagger: splitWorksStagger,
          ease: "In",
          overwrite: !0,
          onComplete: c === a ? u : void 0,
        }),
        gsap.to(s, {
          x: "100vw",
          duration: splitWorksDur,
          delay: l,
          stagger: splitWorksStagger,
          ease: "In",
          overwrite: !0,
          onComplete: c === s ? u : void 0,
        }),
        l + splitWorksDur + splitWorksStagger * Math.max(0, c.length - 1)
      );
  }
  return (u(), 0);
}
function initFluidReveal(e = document) {
  if (window.matchMedia("(max-width: 991px)").matches) return;
  const t = e.querySelectorAll("[data-fluid-reveal]");
  t.length &&
    t.forEach((e) => {
      function t() {
        const e = getComputedStyle(I).color.match(/[\d.]+/g);
        e &&
          e.length >= 3 &&
          ((q[0] = e[0] / 255), (q[1] = e[1] / 255), (q[2] = e[2] / 255));
      }
      function n(e, t) {
        const n = D.createShader(e);
        return (D.shaderSource(n, t), D.compileShader(n), n);
      }
      function o(e) {
        const t = D.createProgram();
        (D.attachShader(t, B),
          D.attachShader(t, n(D.FRAGMENT_SHADER, e)),
          D.linkProgram(t));
        const o = {},
          i = D.getProgramParameter(t, D.ACTIVE_UNIFORMS);
        for (let e = 0; e < i; e++) {
          const n = D.getActiveUniform(t, e).name;
          o[n] = D.getUniformLocation(t, n);
        }
        return { p: t, uniforms: o };
      }
      function i(e, t) {
        const n = D.createTexture();
        (D.activeTexture(D.TEXTURE0),
          D.bindTexture(D.TEXTURE_2D, n),
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_MIN_FILTER, $),
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_MAG_FILTER, $),
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_WRAP_S, D.CLAMP_TO_EDGE),
          D.texParameteri(D.TEXTURE_2D, D.TEXTURE_WRAP_T, D.CLAMP_TO_EDGE),
          D.texImage2D(
            D.TEXTURE_2D,
            0,
            D.RGBA16F,
            e,
            t,
            0,
            D.RGBA,
            D.HALF_FLOAT,
            null,
          ));
        const o = D.createFramebuffer();
        return (
          D.bindFramebuffer(D.FRAMEBUFFER, o),
          D.framebufferTexture2D(
            D.FRAMEBUFFER,
            D.COLOR_ATTACHMENT0,
            D.TEXTURE_2D,
            n,
            0,
          ),
          D.viewport(0, 0, e, t),
          D.clearColor(0, 0, 0, 1),
          D.clear(D.COLOR_BUFFER_BIT),
          {
            tex: n,
            fbo: o,
            w: e,
            h: t,
            attach(e) {
              return (
                D.activeTexture(D.TEXTURE0 + e),
                D.bindTexture(D.TEXTURE_2D, this.tex),
                e
              );
            },
          }
        );
      }
      function r() {
        const e = I.width / Math.max(I.height, 1);
        let t, n;
        (e >= 1
          ? ((n = f), (t = Math.min(Math.round(f * e), h)))
          : ((t = f), (n = Math.min(Math.round(f / e), h))),
          (Q && Q.w === t && Q.h === n) ||
            (Q &&
              (D.deleteTexture(Q.tex),
              D.deleteFramebuffer(Q.fbo),
              D.deleteTexture(j.tex),
              D.deleteFramebuffer(j.fbo)),
            (Q = i(t, n)),
            (j = i(t, n)),
            (Z.texelX = 1 / t),
            (Z.texelY = 1 / n)));
      }
      function a(e) {
        (e
          ? (D.bindFramebuffer(D.FRAMEBUFFER, e.fbo),
            D.viewport(0, 0, e.w, e.h))
          : (D.bindFramebuffer(D.FRAMEBUFFER, null),
            D.viewport(0, 0, I.width, I.height)),
          D.drawArrays(D.TRIANGLE_STRIP, 0, 4));
      }
      function s(e, t) {
        const n = performance.now(),
          o = Math.max((n - ee) / 1e3, 0.004);
        ee = n;
        const i = J,
          r = (e - i.left) / i.width,
          a = 1 - (t - i.top) / i.height;
        (K.init
          ? ((K.px = K.x), (K.py = K.y))
          : ((K.px = r), (K.py = a), (K.init = !0)),
          (K.vx = (r - K.px) / o),
          (K.vy = (a - K.py) / o),
          (K.x = r),
          (K.y = a),
          (K.moved = !0));
      }
      function l(e, t, n, o, i) {
        (D.useProgram(X.p),
          D.uniform1i(X.uniforms.uField, Z.read.attach(0)),
          D.uniform1f(X.uniforms.aspectRatio, I.width / I.height),
          D.uniform2f(X.uniforms.point, e, t),
          D.uniform3f(X.uniforms.color, n, o, i),
          D.uniform1f(X.uniforms.radius, E),
          a(Z.write),
          Z.swap());
      }
      function c() {
        const e = I.width / Math.max(I.height, 1),
          t = Math.max(-M, Math.min(M, K.vx)) * v,
          n = Math.max(-M, Math.min(M, K.vy)) * v,
          o = Math.hypot((K.x - K.px) * e, K.y - K.py),
          i = Math.max(1, Math.ceil(o / (0.4 * Math.sqrt(E))));
        for (let e = 0; e < i; e++) {
          const o = 1 === i ? 1 : e / (i - 1);
          l(K.px + (K.x - K.px) * o, K.py + (K.y - K.py) * o, _, t, n);
        }
      }
      function d() {
        ae = requestAnimationFrame(d);
        const n = performance.now(),
          o = Math.min((n - re) / 1e3, 0.033);
        ((re = n),
          D.disable(D.BLEND),
          K.moved && (R() && c(), (K.moved = !1)),
          D.useProgram(W.p),
          D.uniform2f(W.uniforms.texelSize, Z.texelX, Z.texelY),
          D.uniform1f(W.uniforms.dt, o),
          D.uniform1f(W.uniforms.friction, y),
          D.uniform1f(W.uniforms.spread, w),
          D.uniform1f(W.uniforms.decay, b),
          D.uniform1f(W.uniforms.wobble, x),
          D.uniform1f(W.uniforms.grain, T),
          D.uniform1f(W.uniforms.time, 0.001 * n),
          D.uniform1i(W.uniforms.uField, Z.read.attach(0)),
          a(Z.write),
          Z.swap(),
          n < F && t(),
          D.useProgram(Y.p),
          D.uniform1i(Y.uniforms.uField, Z.read.attach(0)),
          D.uniform3f(Y.uniforms.maskColor, q[0], q[1], q[2]),
          D.uniform2f(Y.uniforms.edge, S, k),
          D.uniform1f(Y.uniforms.bottomFade, A),
          D.uniform1f(Y.uniforms.time, 0.001 * n),
          a(null),
          P &&
            !e._fluidPainted &&
            ((e._fluidPainted = !0), (P.style.display = "none")));
      }
      function u() {
        const t = e.getBoundingClientRect();
        J = t;
        const n = 1;
        ((I.width = Math.round(t.width * n)),
          (I.height = Math.round(t.height * n)),
          r());
      }
      function p() {
        null === ae &&
          ((re = performance.now()), t(), (J = e.getBoundingClientRect()), d());
      }
      function m() {
        null !== ae && (cancelAnimationFrame(ae), (ae = null));
      }
      function g() {
        Q &&
          (D.bindFramebuffer(D.FRAMEBUFFER, Q.fbo),
          D.viewport(0, 0, Q.w, Q.h),
          D.clearColor(0, 0, 0, 1),
          D.clear(D.COLOR_BUFFER_BIT),
          D.bindFramebuffer(D.FRAMEBUFFER, j.fbo),
          D.viewport(0, 0, j.w, j.h),
          D.clear(D.COLOR_BUFFER_BIT),
          D.useProgram(Y.p),
          D.uniform1i(Y.uniforms.uField, Z.read.attach(0)),
          D.uniform3f(Y.uniforms.maskColor, q[0], q[1], q[2]),
          D.uniform2f(Y.uniforms.edge, S, k),
          D.uniform1f(Y.uniforms.bottomFade, A),
          D.uniform1f(Y.uniforms.time, 0.001 * performance.now()),
          a(null));
      }
      if (e._fluidActive) return;
      e._fluidActive = !0;
      const f = 512,
        h = 1440,
        v = 1.6,
        y = 3,
        w = 0.79,
        b = 1.5,
        E = 0.004,
        _ = 3.5,
        x = 2.6,
        T = 0.7,
        S = 0.39,
        k = 0.4,
        M = 4,
        A = 0.18,
        L = "--_colors---background--bg",
        C = 1200,
        R = () =>
          window.__preloaderState?.done &&
          !window.__preloaderRunning &&
          !window.__transitionRunning,
        P = e.querySelector("[data-fluid-cover]");
      let I = e.querySelector("[data-fluid-canvas]");
      (I ||
        ((I = document.createElement("canvas")),
        I.setAttribute("data-fluid-canvas", ""),
        (I.style.cssText =
          "position:absolute; inset:0; width:100%; height:100%;"),
        e.appendChild(I)),
        (I.style.color = `var(${L})`));
      const q = [1, 1, 1];
      let F = performance.now() + C;
      t();
      const O = new MutationObserver(() => {
        F = performance.now() + C;
      });
      O.observe(document.body, { attributes: !0, attributeFilter: ["class"] });
      const D = I.getContext("webgl2", { alpha: !0, premultipliedAlpha: !1 });
      if (!D) return void (e._fluidActive = !1);
      D.getExtension("EXT_color_buffer_float");
      const $ = D.getExtension("OES_texture_float_linear")
          ? D.LINEAR
          : D.NEAREST,
        z =
          "#version 300 es\n      precision highp float;\n      in vec2 aPos;\n      out vec2 vUv;\n      void main () {\n        vUv = aPos * 0.5 + 0.5;\n        gl_Position = vec4(aPos, 0.0, 1.0);\n      }",
        H =
          "#version 300 es\n      precision highp float;\n      in vec2 vUv; out vec4 fragColor;\n      uniform sampler2D uField;\n      uniform float aspectRatio;\n      uniform vec3 color;\n      uniform vec2 point;\n      uniform float radius;\n      void main () {\n        vec2 p = vUv - point;\n        p.x *= aspectRatio;\n        float g = exp(-dot(p, p) / radius);\n        vec4 f = texture(uField, vUv);\n        float w = clamp(g * color.x, 0.0, 1.0);\n        fragColor = vec4(\n          f.r + g * color.x,\n          mix(f.g, color.y, w),\n          mix(f.b, color.z, w),\n          1.0\n        );\n      }",
        U =
          "#version 300 es\n      precision highp float;\n      in vec2 vUv; out vec4 fragColor;\n      uniform sampler2D uField;\n      uniform vec2 texelSize;\n      uniform float dt;\n      uniform float friction;\n      uniform float spread;\n      uniform float decay;\n      uniform float wobble;\n      uniform float grain;\n      uniform float time;\n\n      float hash(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n      float noise(vec2 p) {\n        vec2 i = floor(p); vec2 f = fract(p);\n        f = f * f * (3.0 - 2.0 * f);\n        return mix(\n          mix(hash(i), hash(i + vec2(1, 0)), f.x),\n          mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);\n      }\n      float fbm(vec2 p) {\n        return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;\n      }\n\n      void main () {\n        vec2 vel = texture(uField, vUv).gb;\n        vec2 coord = vUv - vel * dt;\n        vec4 s = texture(uField, coord);\n\n        float t = time * 0.3;\n        vec2 warp = (vec2(\n          fbm(vUv * 11.0 + t),\n          fbm(vUv * 11.0 + 37.2 - t)\n        ) - 0.5) * 2.0 * wobble * texelSize;\n\n        vec4 nL = texture(uField, coord + vec2(-texelSize.x, 0.0) + warp);\n        vec4 nR = texture(uField, coord + vec2( texelSize.x, 0.0) + warp);\n        vec4 nT = texture(uField, coord + vec2(0.0,  texelSize.y) + warp);\n        vec4 nB = texture(uField, coord + vec2(0.0, -texelSize.y) + warp);\n        float avgD = (nL.r + nR.r + nT.r + nB.r) * 0.25;\n        vec2 avgV = (nL.gb + nR.gb + nT.gb + nB.gb) * 0.25;\n\n        float d = mix(s.r, avgD, spread);\n        vec2 v = mix(s.gb, avgV, spread * 0.5);\n\n        float g = fbm(vUv * 15.0 + 5.1 + t * 0.6);\n        d *= 1.0 / (1.0 + (decay + grain * decay * (g - 0.5) * 2.0) * dt);\n        v *= 1.0 / (1.0 + friction * dt);\n\n        fragColor = vec4(max(d, 0.0), v, 1.0);\n      }",
        N =
          "#version 300 es\n      precision highp float;\n      in vec2 vUv; out vec4 fragColor;\n      uniform sampler2D uField;\n      uniform vec3 maskColor;\n      uniform vec2 edge;\n      uniform float bottomFade;\n      uniform float time;\n\n      float hash(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n      float noise(vec2 p) {\n        vec2 i = floor(p); vec2 f = fract(p);\n        f = f * f * (3.0 - 2.0 * f);\n        return mix(\n          mix(hash(i), hash(i + vec2(1, 0)), f.x),\n          mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);\n      }\n      float fbm(vec2 p) {\n        return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;\n      }\n\n      void main () {\n        float d = texture(uField, vUv).r;\n\n        float n = fbm(vec2(vUv.x * 9.0, time * 0.25));\n        float localFade = bottomFade * (0.35 + n * 1.3);\n        d *= smoothstep(0.0, localFade, vUv.y);\n\n        float alpha = 1.0 - smoothstep(edge.x, edge.y, d);\n        fragColor = vec4(maskColor, alpha);\n      }",
        B = n(D.VERTEX_SHADER, z),
        X = o(H),
        W = o(U),
        Y = o(N),
        V = D.createVertexArray();
      D.bindVertexArray(V);
      const G = D.createBuffer();
      (D.bindBuffer(D.ARRAY_BUFFER, G),
        D.bufferData(
          D.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          D.STATIC_DRAW,
        ),
        D.enableVertexAttribArray(0),
        D.vertexAttribPointer(0, 2, D.FLOAT, !1, 0, 0));
      let Q = null,
        j = null;
      const Z = {
          get read() {
            return Q;
          },
          get write() {
            return j;
          },
          swap() {
            const e = Q;
            ((Q = j), (j = e));
          },
          texelX: 1 / f,
          texelY: 1 / f,
        },
        K = {
          x: 0.5,
          y: 0.5,
          px: 0.5,
          py: 0.5,
          vx: 0,
          vy: 0,
          moved: !1,
          init: !1,
        };
      let J = e.getBoundingClientRect(),
        ee = performance.now();
      const te = (e) => s(e.clientX, e.clientY),
        ne = (e) => s(e.touches[0].clientX, e.touches[0].clientY),
        oe = () => {
          K.init = !1;
        };
      (e.addEventListener("mousemove", te),
        e.addEventListener("touchmove", ne, { passive: !0 }),
        e.addEventListener("mouseleave", oe));
      const ie = () => {
        J = e.getBoundingClientRect();
      };
      (lenis?.on && lenis.on("scroll", ie),
        window.addEventListener("scroll", ie, { passive: !0 }));
      let re = performance.now(),
        ae = null;
      const se = new ResizeObserver(u);
      se.observe(e);
      const le = new IntersectionObserver(
        ([e]) => {
          e.isIntersecting ? ((K.init = !1), p()) : (m(), g());
        },
        { threshold: 0 },
      );
      (le.observe(e),
        u(),
        p(),
        (e._destroyFluidReveal = () => {
          (m(),
            e.removeEventListener("mousemove", te),
            e.removeEventListener("touchmove", ne),
            e.removeEventListener("mouseleave", oe),
            lenis?.off && lenis.off("scroll", ie),
            window.removeEventListener("scroll", ie),
            se.disconnect(),
            le.disconnect(),
            O.disconnect());
          const t = D.getExtension("WEBGL_lose_context");
          (t && t.loseContext(), (e._fluidActive = !1));
        }));
    });
}
function destroyFluidReveal(e = document) {
  e.querySelectorAll("[data-fluid-reveal]").forEach((e) => {
    e._destroyFluidReveal && e._destroyFluidReveal();
  });
}
function initOrbitTiles(e = document) {
  e.querySelectorAll("[data-orbit-tiles-init]").forEach((e) => {
    function t() {
      return E.reduce(
        (e, t, n) =>
          Math.min(
            (((n - t.progress) % d) + d) % d,
            d - ((((n - t.progress) % d) + d) % d),
          ) <
          Math.min(
            (((e - E[e].progress) % d) + d) % d,
            d - ((((e - E[e].progress) % d) + d) % d),
          )
            ? n
            : e,
        0,
      );
    }
    function n() {
      const e = t();
      e !== S &&
        ((S = e),
        c.forEach((e, t) => {
          e.setAttribute(
            "data-orbit-tiles-item-status",
            t === S ? "active" : "not-active",
          );
        }));
    }
    function o() {
      const e = c[0].offsetWidth,
        t = e * u,
        o = e * p,
        i = e * m;
      (n(),
        c.forEach((e, n) => {
          const r = ((n - E[n].progress) / d) * Math.PI * 2,
            a = (Math.cos(r) + 1) / 2,
            s = Math.pow(a, 1.3),
            l = gsap.utils.interpolate(g, 1, s),
            c = gsap.utils.interpolate(f, 1, s),
            u = gsap.utils.interpolate(i, 0, s),
            p = gsap.utils.interpolate(h, 1, s);
          gsap.set(e, {
            x: Math.sin(r) * t,
            y: Math.cos(r) * o,
            scale: l,
            opacity: c,
            filter: `blur(${u}px) brightness(${p})`,
            zIndex: Math.round(1e3 * s),
          });
        }));
    }
    function i() {
      if (!T) return;
      const e = t(),
        n = E.map((t, n) => ({ state: t, offset: (n - e + d) % d })).sort(
          (e, t) => e.offset - t.offset,
        );
      ((_ = gsap.timeline({
        paused: !0,
        onComplete: () => {
          T && (x = gsap.delayedCall(y, i));
        },
      })),
        n.forEach(({ state: e }, t) => {
          _.to(
            e,
            {
              progress: e.progress + 1,
              duration: v,
              ease: "osmo",
              onUpdate: o,
            },
            t * w,
          );
        }),
        _.play());
    }
    function r() {
      ((T = !1), _ && _.pause(), x && x.pause(), k.forEach((e) => e.pause()));
    }
    function a() {
      ((T = !0),
        k.forEach((e) => e.play()),
        _ && _.progress() < 1 ? _.play() : i());
    }
    const s =
      e.querySelector("[data-orbit-tiles-collection]") ||
      (e.matches("[data-orbit-tiles-collection]") ? e : null);
    s && gsap.set(s, { display: "flex" });
    const l = e.querySelector("[data-orbit-tiles-list]"),
      c = e.querySelectorAll("[data-orbit-tiles-item]"),
      d = c.length;
    if (d < 2) return;
    const u = 1,
      p = 0,
      m = 0.04,
      g = 0.2,
      f = 1,
      h = 0.3,
      v = 2.5,
      y = 0,
      w = 0.03 * v,
      b = 24,
      E = Array.from(c, () => ({ progress: 0 }));
    let _,
      x,
      T = !1,
      S = -1;
    const k =
      l && 0 !== b
        ? [
            gsap.to(l, {
              rotate: 360,
              duration: b,
              ease: "none",
              repeat: -1,
              paused: !0,
            }),
            gsap.to(c, {
              rotate: -360,
              duration: b,
              ease: "none",
              repeat: -1,
              paused: !0,
            }),
          ]
        : [];
    (o(),
      y > 0 && new ResizeObserver(o).observe(e),
      ScrollTrigger.create({
        trigger: e,
        start: "top bottom",
        end: "bottom top",
        onToggle: (e) => (e.isActive ? a() : r()),
      }));
  });
}
function initInfiniteCanvas(e = document) {
  function t() {
    if (((He = Ue ? requestAnimationFrame(t) : null), !Ue)) return;
    const e = performance.now();
    ((Ne = (Ne + 1) & 1),
      be.focused ||
        ((be.keys.w || be.keys.arrowup) && (be.targetVel.z -= p),
        (be.keys.s || be.keys.arrowdown) && (be.targetVel.z += p),
        (be.keys.a || be.keys.arrowleft) && (be.targetVel.x -= p),
        (be.keys.d || be.keys.arrowright) && (be.targetVel.x += p),
        be.keys.q && (be.targetVel.y -= p),
        be.keys.e && (be.targetVel.y += p)));
    const n = Math.abs(be.velocity.z) > 0.05,
      o = B(be.basePos.z / 50, 0.3, 2),
      f = F * o,
      h = n ? 0.2 : 0.12;
    if (
      (be.focused
        ? ((be.drift.x = X(be.drift.x, 0, 0.25)),
          (be.drift.y = X(be.drift.y, 0, 0.25)))
        : be.isDragging ||
          (N
            ? ((be.drift.x = X(be.drift.x, 0, h)),
              (be.drift.y = X(be.drift.y, 0, h)))
            : ((be.drift.x = X(be.drift.x, be.mouse.x * f, h)),
              (be.drift.y = X(be.drift.y, be.mouse.y * f, h)))),
      be.focused ||
        ((be.targetVel.z += be.scrollAccum),
        (be.scrollAccum *= 0.8),
        (be.targetVel.x = B(be.targetVel.x, -l, l)),
        (be.targetVel.y = B(be.targetVel.y, -l, l)),
        (be.targetVel.z = B(be.targetVel.z, -l, l)),
        (be.velocity.x = X(be.velocity.x, be.targetVel.x, m)),
        (be.velocity.y = X(be.velocity.y, be.targetVel.y, m)),
        (be.velocity.z = X(be.velocity.z, be.targetVel.z, m)),
        (be.basePos.x += be.velocity.x),
        (be.basePos.y += be.velocity.y),
        (be.basePos.z += be.velocity.z),
        (be.targetVel.x *= g),
        (be.targetVel.y *= g),
        (be.targetVel.z *= g)),
      te.position.set(
        be.basePos.x + be.drift.x,
        be.basePos.y + be.drift.y,
        be.basePos.z,
      ),
      i && de && !be.focused)
    ) {
      Math.abs(be.velocity.x) +
        Math.abs(be.velocity.y) +
        Math.abs(be.velocity.z) >
      A
        ? ((pe = e), ue && ((ue = !1), animateTextReveal(i, "hide", 0)))
        : !ue && e - pe > L && ((ue = !0), animateTextReveal(i, "reveal", 0));
    }
    const M = e - be.lastScrollInput < y,
      R = Math.abs(be.velocity.z),
      P = R < E ? 0 : B((R - E) / (l - E), 0, 1);
    be.bendEnv =
      P > be.bendEnv ? X(be.bendEnv, P, 0.25) : X(be.bendEnv, P, 0.04);
    const O = M && be.bendEnv > 0.02 ? Math.min(1, 0.3 + 0.7 * be.bendEnv) : 0;
    be.bend = X(be.bend, O, M ? w : b);
    const D = !ce,
      z = null === le ? -1 : e - le;
    D && z > S + T && (ce = !0);
    const U = Math.floor(be.basePos.x / r),
      W = Math.floor(be.basePos.y / r),
      Y = Math.floor(be.basePos.z / r);
    if (!be.focused) {
      const t = `${U},${W},${Y}`;
      t !== be.lastChunkKey &&
        ((be.pendingChunk = { cx: U, cy: W, cz: Y }), (be.lastChunkKey = t));
      const o = Math.abs(be.velocity.z) > 1 ? 500 : n ? 400 : 100;
      if (be.pendingChunk && e - be.lastChunkUpdate >= o) {
        const t = be.pendingChunk;
        ((be.pendingChunk = null),
          (be.lastChunkUpdate = e),
          Te(t.cx, t.cy, t.cz));
      }
    }
    const V = Ee.v;
    _e += (V - _e) / H;
    const j = null !== be.focusMesh || V > 1e-4 || _e > 1e-4;
    if (
      ((se.length = 0),
      ve.forEach((t) => {
        const n = Math.max(
            Math.abs(t.cx - U),
            Math.abs(t.cy - W),
            Math.abs(t.cz - Y),
          ),
          o = n <= a ? 1 : Math.max(0, 1 - (n - a) / s);
        t.meshes.forEach((t) => {
          if (!t.__ready) return;
          if (be.focusMesh === t) {
            const n = Math.sin(e * x * t.__breathRate + t.__breathPhase) * _,
              i = t.__baseY + n,
              r = t.__baseX - te.position.x,
              a = i - te.position.y,
              s = r * r + a * a,
              l = t.__baseZ + be.bend * s * v,
              p = l - be.basePos.z,
              m = Math.sqrt(s + p * p);
            let g;
            if (m > d + 50) g = 0;
            else {
              const e = m <= c ? 1 : Math.max(0, 1 - (m - c) / (d - c));
              g = Math.min(o, e * e);
            }
            return (
              t.position.set(
                X(t.__baseX, be.focusTarget.x, V),
                X(i, be.focusTarget.y, V),
                X(l, be.focusTarget.z, V),
              ),
              t.scale.set(
                X(t.__baseScaleX, be.focusTarget.sx, V),
                X(t.__baseScaleY, be.focusTarget.sy, V),
                1,
              ),
              (t.__opacity = g),
              (t.material.opacity = X(g, 1, V)),
              (t.material.depthWrite = t.material.opacity > 0.99),
              void (t.visible = t.material.opacity > u)
            );
          }
          let n = 1;
          if (t.__introT < 1) {
            const e = z < 0 ? 0 : B((z - t.__introDelay) / T, 0, 1);
            ((t.__introT = e), (n = G(e)));
            const o = k + (1 - k) * Q(e);
            if (
              (t.scale.set(t.__baseScaleX * o, t.__baseScaleY * o, 1), 0 === e)
            )
              return ((t.material.opacity = 0), void (t.visible = !1));
          } else
            D &&
              t.scale.x !== t.__baseScaleX &&
              t.scale.set(t.__baseScaleX, t.__baseScaleY, 1);
          if (1 === n && t.__opacity < u && !t.visible && 0 === Ne) return;
          const i = Math.sin(e * x * t.__breathRate + t.__breathPhase) * _;
          t.position.y = t.__baseY + i;
          const r = t.position.x - te.position.x,
            a = t.position.y - te.position.y,
            s = r * r + a * a;
          t.position.z = t.__baseZ + be.bend * s * v;
          const l = t.position.z - be.basePos.z,
            p = Math.sqrt(s + l * l);
          if (p > d + 50)
            return (
              (t.__opacity = 0),
              (t.material.opacity = 0),
              (t.material.depthWrite = !1),
              void (t.visible = !1)
            );
          const m = p <= c ? 1 : Math.max(0, 1 - (p - c) / (d - c)),
            g = Math.min(o, m * m);
          t.__opacity = g < u && t.__opacity < u ? 0 : X(t.__opacity, g, 0.18);
          const f = t.__opacity > 0.99 && n > 0.99;
          let h = f ? 1 : t.__opacity * n,
            y = f;
          if (j) {
            const e = (t.__focusDelay || 0) * $,
              n = B((_e - e) / (1 - $), 0, 1);
            ((h *= 1 - n * n * (3 - 2 * n)), (y = !1));
          }
          ((t.material.opacity = h),
            (t.material.depthWrite = y),
            (t.visible = h > u),
            !N && t.visible && h > I && se.push(t));
        });
      }),
      !N)
    )
      if (be.focused || j)
        ("0" !== J.style.opacity && (J.style.opacity = "0"),
          "default" !== be.cursor &&
            ((be.cursor = "default"), (Se.style.cursor = "default")));
      else {
        let e = null;
        const t =
          Math.abs(be.velocity.x) +
          Math.abs(be.velocity.y) +
          Math.abs(be.velocity.z);
        if (ce && be.pointerActive && !be.isDragging && t < q) {
          const t = Se.getBoundingClientRect();
          if (
            be.clientX >= t.left &&
            be.clientX <= t.right &&
            be.clientY >= t.top &&
            be.clientY <= t.bottom
          ) {
            ((ie.x = ((be.clientX - t.left) / t.width) * 2 - 1),
              (ie.y = (-(be.clientY - t.top) / t.height) * 2 + 1),
              oe.setFromCamera(ie, te));
            const n = oe.intersectObjects(se, !1);
            n.length && (e = n[0].object);
          }
        }
        if (((be.hoveredMesh = e), e)) {
          const t = 0.5 * e.scale.x,
            n = 0.5 * e.scale.y;
          (re.set(e.position.x - t, e.position.y - n, e.position.z).project(te),
            ae
              .set(e.position.x + t, e.position.y + n, e.position.z)
              .project(te));
          const o = Se.clientWidth,
            i = Se.clientHeight,
            r = (0.5 * re.x + 0.5) * o,
            a = (0.5 * -re.y + 0.5) * i,
            s = (0.5 * ae.x + 0.5) * o,
            l = (0.5 * -ae.y + 0.5) * i,
            c = Math.min(r, s),
            d = Math.min(a, l),
            u = Math.abs(s - r),
            p = Math.abs(l - a);
          ((J.style.transform = `translate(calc(${c}px - ${C}rem), calc(${d}px - ${C}rem))`),
            (J.style.width = `calc(${u}px + ${2 * C}rem)`),
            (J.style.height = `calc(${p}px + ${2 * C}rem)`),
            (J.style.opacity = "1"));
        } else "0" !== J.style.opacity && (J.style.opacity = "0");
        const n = be.isDragging ? "grabbing" : e ? "pointer" : "grab";
        be.cursor !== n && ((be.cursor = n), (Se.style.cursor = n));
      }
    K.render(ee, te);
  }
  const n = e.querySelector("[data-infinite-canvas]");
  if (!n || n.__icInit) return;
  n.__icInit = !0;
  const o = Array.from(e.querySelectorAll("[data-canvas-img]"))
    .map((e) => ({
      url: e.currentSrc || e.src,
      width: parseInt(e.getAttribute("width")) || e.naturalWidth || 0,
      height: parseInt(e.getAttribute("height")) || e.naturalHeight || 0,
    }))
    .filter((e) => e.url);
  if (!o.length) return;
  const i = e.querySelector("[data-infinite-canvas-h]"),
    r = 110,
    a = 2,
    s = 1,
    l = 3.2,
    c = 140,
    d = 260,
    u = 0.01,
    p = 0.18,
    m = 0.16,
    g = 0.9,
    f = 50,
    h = 5,
    v = 0.00225,
    y = 220,
    w = 0.06,
    b = 0.035,
    E = 0.12,
    _ = 1.4,
    x = 45e-5,
    T = 900,
    S = 1100,
    k = 0.55,
    M = 1.06,
    A = 0.015,
    L = 3e3,
    C = 0.277,
    R = 0.0173,
    P = "currentColor",
    I = 0.6,
    q = 0.06,
    F = 1.5,
    O = 30,
    D = 6.66,
    $ = 0.7,
    z = 60,
    H = 2.2,
    U = 4,
    N = window.matchMedia("(pointer: coarse)").matches,
    B = (e, t, n) => Math.max(t, Math.min(n, e)),
    X = (e, t, n) => e + (t - e) * n,
    W = (e) =>
      e *
      (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16),
    Y = (e) => {
      const t = 1e4 * Math.sin(9999 * e);
      return t - Math.floor(t);
    },
    V = (e) => {
      let t = 0;
      for (let n = 0; n < e.length; n++)
        t = ((t << 5) - t + e.charCodeAt(n)) | 0;
      return Math.abs(t);
    },
    G = (e) => 1 - Math.pow(1 - e, 3),
    Q = (e) => {
      const t = 12 * (M - 1);
      return 1 + (t + 1) * Math.pow(e - 1, 3) + t * Math.pow(e - 1, 2);
    },
    j = a + s,
    Z = [];
  for (let e = -j; e <= j; e++)
    for (let t = -j; t <= j; t++)
      for (let n = -j; n <= j; n++)
        Math.max(Math.abs(e), Math.abs(t), Math.abs(n)) > j ||
          Z.push({ dx: e, dy: t, dz: n });
  const K = new THREE.WebGLRenderer({
    antialias: !1,
    alpha: !0,
    powerPreference: "high-performance",
  });
  (K.setClearColor(0, 0),
    K.setPixelRatio(Math.min(window.devicePixelRatio || 1, N ? 1.25 : 1.5)),
    K.setSize(n.clientWidth, n.clientHeight),
    (K.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none;"),
    n.appendChild(K.domElement));
  const J = document.createElement("div");
  ((J.style.cssText = `position:absolute;left:0;top:0;box-sizing:border-box;pointer-events:none;border:${R}rem solid ${P};opacity:0;transition:opacity 0.18s ease;will-change:transform,width,height;`),
    n.appendChild(J));
  const ee = new THREE.Scene(),
    te = new THREE.PerspectiveCamera(
      60,
      n.clientWidth / n.clientHeight,
      1,
      500,
    );
  te.position.set(0, 0, f);
  const ne = new THREE.PlaneGeometry(1, 1),
    oe = new THREE.Raycaster(),
    ie = new THREE.Vector2(),
    re = new THREE.Vector3(),
    ae = new THREE.Vector3(),
    se = [];
  let le = null,
    ce = !1,
    de = !1,
    ue = !1,
    pe = 0;
  const me = new THREE.TextureLoader(),
    ge = new Map(),
    fe = (e, t) => {
      const n = ge.get(e.url);
      if (n) return void (n.__loaded ? t(n) : n.__cbs.push(t));
      const o = me.load(e.url, (e) => {
        ((e.minFilter = THREE.LinearMipmapLinearFilter),
          (e.magFilter = THREE.LinearFilter),
          (e.generateMipmaps = !0),
          (e.anisotropy = 4),
          (e.colorSpace = THREE.SRGBColorSpace),
          (e.__loaded = !0),
          e.__cbs.forEach((t) => t(e)),
          (e.__cbs = []));
      });
      ((o.__loaded = !1), (o.__cbs = [t]), ge.set(e.url, o));
    },
    he = (e, t, n) => {
      const i = [],
        a = V(`${e},${t},${n}`);
      for (let s = 0; s < h; s++) {
        const l = a + 1e3 * s,
          c = (e) => Y(l + e),
          d = 12 + 8 * c(4);
        i.push({
          x: e * r + c(0) * r,
          y: t * r + c(1) * r,
          z: n * r + c(2) * r,
          size: d,
          mediaIndex: Math.floor(1e6 * c(5)) % o.length,
          introSeed: c(7),
        });
      }
      return i;
    },
    ve = new Map(),
    ye = (e, t, n) => {
      const i = `${e},${t},${n}`;
      if (ve.has(i)) return;
      const r = new THREE.Group(),
        a = [];
      (he(e, t, n).forEach((e) => {
        const t = o[e.mediaIndex],
          n = new THREE.MeshBasicMaterial({
            transparent: !0,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: !1,
          }),
          i = new THREE.Mesh(ne, n);
        (i.position.set(e.x, e.y, e.z),
          (i.__baseX = e.x),
          (i.__baseZ = e.z),
          (i.__baseY = e.y),
          (i.__nativeW = t.width || 0),
          (i.__nativeH = t.height || 0),
          (i.__breathPhase = Y(e.x + e.y + e.z) * Math.PI * 2),
          (i.__breathRate = 0.75 + 0.5 * Y(1.7 * e.x + e.z)),
          (i.visible = !1),
          (i.__opacity = 0),
          (i.__ready = !1),
          (i.__baseScaleX = 1),
          (i.__baseScaleY = 1),
          (i.__introDelay = ce ? 0 : e.introSeed * S),
          (i.__introT = ce ? 1 : 0),
          fe(t, (o) => {
            if (n.__disposed) return;
            ((n.map = o), (n.needsUpdate = !0));
            const r = o.image,
              a = t.width || (r && r.naturalWidth) || 0,
              s = t.height || (r && r.naturalHeight) || 0;
            ((i.__nativeW = a), (i.__nativeH = s));
            const l = a && s ? a / s : 1;
            ((i.__baseScaleX = e.size * l), (i.__baseScaleY = e.size));
            const c = i.__introT < 1 ? k : 1;
            (i.scale.set(i.__baseScaleX * c, i.__baseScaleY * c, 1),
              (i.__ready = !0));
          }),
          r.add(i),
          a.push(i));
      }),
        ee.add(r),
        ve.set(i, { group: r, meshes: a, cx: e, cy: t, cz: n }));
    },
    we = (e) => {
      const t = ve.get(e);
      t &&
        (t.meshes.forEach((e) => {
          (be.hoveredMesh === e && (be.hoveredMesh = null),
            (e.material.__disposed = !0),
            e.material.dispose());
        }),
        ee.remove(t.group),
        ve.delete(e));
    },
    be = {
      velocity: { x: 0, y: 0, z: 0 },
      targetVel: { x: 0, y: 0, z: 0 },
      basePos: { x: 0, y: 0, z: f },
      drift: { x: 0, y: 0 },
      mouse: { x: 0, y: 0 },
      lastMouse: { x: 0, y: 0 },
      scrollAccum: 0,
      bend: 0,
      bendEnv: 0,
      lastScrollInput: 0,
      isDragging: !1,
      lastTouches: [],
      lastTouchDist: 0,
      lastChunkKey: "",
      lastChunkUpdate: 0,
      pendingChunk: null,
      keys: {},
      clientX: 0,
      clientY: 0,
      pointerActive: !1,
      cursor: "grab",
      hoveredMesh: null,
      downX: 0,
      downY: 0,
      dragMoved: !1,
      focusMesh: null,
      focused: !1,
      exiting: !1,
      focusTarget: null,
      focusStartOpacity: 1,
    },
    Ee = { v: 0 };
  let _e = 0;
  const xe = (e) => {
      if (e.length < 2) return 0;
      const t = e[0].clientX - e[1].clientX,
        n = e[0].clientY - e[1].clientY;
      return Math.sqrt(t * t + n * n);
    },
    Te = (e, t, n) => {
      const o = new Set();
      (Z.forEach((i) => {
        const r = `${e + i.dx},${t + i.dy},${n + i.dz}`;
        (o.add(r), ye(e + i.dx, t + i.dy, n + i.dz));
      }),
        ve.forEach((e, t) => {
          o.has(t) || we(t);
        }));
    };
  Te(0, 0, 0);
  const Se = K.domElement,
    ke = (e) => {
      if (be.focusMesh || !e || !e.__ready) return;
      ((be.focusMesh = e),
        (be.focused = !0),
        (be.exiting = !1),
        (be.focusStartOpacity = e.material.opacity || 1),
        (be.velocity.x = be.velocity.y = be.velocity.z = 0),
        (be.targetVel.x = be.targetVel.y = be.targetVel.z = 0),
        (be.scrollAccum = 0),
        (be.drift.x = be.drift.y = 0),
        (be.mouse.x = be.mouse.y = 0),
        i && ue && ((ue = !1), animateTextReveal(i, "hide", 0)),
        (J.style.opacity = "0"),
        (be.hoveredMesh = null));
      const t = e.__baseX,
        n = e.__baseY,
        o = e.__baseZ;
      ve.forEach((e) =>
        e.meshes.forEach((e) => {
          const i = e.__baseX - t,
            r = e.__baseY - n,
            a = e.__baseZ - o,
            s = Math.sqrt(i * i + r * r + a * a);
          e.__focusDelay = B(s / z, 0, 1);
        }),
      );
      const r = Math.tan((te.fov * Math.PI) / 180 / 2),
        a = (2 * O * r) / Se.clientHeight,
        s = e.__nativeW,
        l = e.__nativeH;
      let c = s && l ? s * a : e.__baseScaleX,
        d = s && l ? l * a : e.__baseScaleY;
      const u = Math.max(1, window.innerHeight - W(D)) * a;
      if (d > u) {
        const e = u / d;
        ((d *= e), (c *= e));
      }
      ((be.focusTarget = {
        x: be.basePos.x,
        y: be.basePos.y,
        z: be.basePos.z - O,
        sx: c,
        sy: d,
      }),
        gsap.to(Ee, { v: 1, duration: durM, ease: "Out", overwrite: !0 }));
    },
    Me = () => {
      be.focusMesh &&
        !be.exiting &&
        ((be.exiting = !0),
        (be.focused = !1),
        gsap.to(Ee, {
          v: 0,
          duration: durM,
          ease: "InOut",
          overwrite: !0,
          onComplete: () => {
            ((be.focusMesh = null),
              (be.focused = !1),
              (be.exiting = !1),
              (be.focusTarget = null),
              (pe = performance.now()));
          },
        }));
    },
    Ae = (e) => {
      ((be.isDragging = !0),
        (be.dragMoved = !1),
        (be.downX = e.clientX),
        (be.downY = e.clientY),
        (be.lastMouse = { x: e.clientX, y: e.clientY }));
    },
    Le = () => {
      be.isDragging = !1;
    },
    Ce = () => {
      ((be.mouse = { x: 0, y: 0 }),
        (be.isDragging = !1),
        (be.pointerActive = !1),
        (be.hoveredMesh = null),
        (J.style.opacity = "0"));
    },
    Re = (e) => {
      ((be.clientX = e.clientX),
        (be.clientY = e.clientY),
        (be.pointerActive = !0),
        (be.mouse = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (-e.clientY / window.innerHeight) * 2 + 1,
        }),
        be.isDragging &&
          (Math.abs(e.clientX - be.downX) + Math.abs(e.clientY - be.downY) >
            U && (be.dragMoved = !0),
          (be.targetVel.x -= 0.025 * (e.clientX - be.lastMouse.x)),
          (be.targetVel.y += 0.025 * (e.clientY - be.lastMouse.y)),
          (be.lastMouse = { x: e.clientX, y: e.clientY })));
    },
    Pe = () => {
      if (N || be.exiting) return;
      const e = Se.getBoundingClientRect();
      if (
        ((ie.x = ((be.clientX - e.left) / e.width) * 2 - 1),
        (ie.y = (-(be.clientY - e.top) / e.height) * 2 + 1),
        oe.setFromCamera(ie, te),
        be.focused)
      ) {
        return void (
          (be.focusMesh && oe.intersectObject(be.focusMesh, !1).length > 0) ||
          Me()
        );
      }
      if (be.dragMoved) return;
      const t = oe.intersectObjects(se, !1);
      t.length && ke(t[0].object);
    },
    Ie = (e) => {
      (e.preventDefault(),
        be.focusMesh && !be.exiting && Me(),
        be.focused ||
          ((be.scrollAccum += 0.006 * e.deltaY),
          (be.lastScrollInput = performance.now())));
    },
    qe = (e) => {
      (e.preventDefault(),
        (be.lastTouches = Array.from(e.touches)),
        (be.lastTouchDist = xe(be.lastTouches)));
    },
    Fe = (e) => {
      e.preventDefault();
      const t = Array.from(e.touches);
      if (1 === t.length && be.lastTouches.length >= 1)
        ((be.targetVel.x -= 0.02 * (t[0].clientX - be.lastTouches[0].clientX)),
          (be.targetVel.y +=
            0.02 * (t[0].clientY - be.lastTouches[0].clientY)));
      else if (2 === t.length && be.lastTouchDist > 0) {
        const e = xe(t);
        ((be.scrollAccum += 0.006 * (be.lastTouchDist - e)),
          (be.lastScrollInput = performance.now()),
          (be.lastTouchDist = e));
      }
      be.lastTouches = t;
    },
    Oe = (e) => {
      ((be.lastTouches = Array.from(e.touches)),
        (be.lastTouchDist = xe(be.lastTouches)));
    },
    De = (e) => {
      "Escape" !== e.key || !be.focusMesh || be.exiting
        ? (be.keys[e.key.toLowerCase()] = !0)
        : Me();
    },
    $e = (e) => {
      be.keys[e.key.toLowerCase()] = !1;
    };
  (Se.addEventListener("mousedown", Ae),
    window.addEventListener("mouseup", Le),
    window.addEventListener("mousemove", Re),
    Se.addEventListener("mouseleave", Ce),
    Se.addEventListener("click", Pe),
    Se.addEventListener("wheel", Ie, { passive: !1 }),
    Se.addEventListener("touchstart", qe, { passive: !1 }),
    Se.addEventListener("touchmove", Fe, { passive: !1 }),
    Se.addEventListener("touchend", Oe, { passive: !1 }),
    window.addEventListener("keydown", De),
    window.addEventListener("keyup", $e));
  const ze = new ResizeObserver(() => {
    const e = n.clientWidth,
      t = n.clientHeight;
    e &&
      t &&
      ((te.aspect = e / t), te.updateProjectionMatrix(), K.setSize(e, t));
  });
  ze.observe(n);
  let He = null,
    Ue = !0,
    Ne = 0;
  const Be = new IntersectionObserver(([e]) => {
    ((Ue = e.isIntersecting),
      Ue && null === He && (He = requestAnimationFrame(t)));
  });
  (Be.observe(n),
    (He = requestAnimationFrame(t)),
    gsap.set(Se, { opacity: 0 }));
  let Xe = null;
  const We = () =>
      window.__preloaderState?.done &&
      !window.__preloaderRunning &&
      !window.__transitionRunning,
    Ye = () => {
      gsap.to(Se, {
        opacity: 1,
        duration: durS,
        delay: delayReveal,
        ease: "Out",
        onStart: () => {
          ((le = performance.now()),
            i &&
              (animateTextReveal(i, "reveal", 0),
              (ue = !0),
              (de = !0),
              (pe = performance.now())));
        },
      });
    };
  (We()
    ? Ye()
    : (Xe = setInterval(() => {
        We() && (clearInterval(Xe), (Xe = null), Ye());
      }, 50)),
    (n.__icDestroy = () => {
      (Xe && clearInterval(Xe),
        gsap.killTweensOf(Se),
        gsap.killTweensOf(Ee),
        (Ue = !1),
        null !== He && cancelAnimationFrame(He),
        Be.disconnect(),
        ze.disconnect(),
        Se.removeEventListener("mousedown", Ae),
        window.removeEventListener("mouseup", Le),
        window.removeEventListener("mousemove", Re),
        Se.removeEventListener("mouseleave", Ce),
        Se.removeEventListener("click", Pe),
        Se.removeEventListener("wheel", Ie),
        Se.removeEventListener("touchstart", qe),
        Se.removeEventListener("touchmove", Fe),
        Se.removeEventListener("touchend", Oe),
        window.removeEventListener("keydown", De),
        window.removeEventListener("keyup", $e),
        ve.forEach((e, t) => we(t)),
        ge.forEach((e) => e.dispose()),
        ge.clear(),
        ne.dispose(),
        K.dispose(),
        J.parentNode && J.parentNode.removeChild(J),
        Se.parentNode && Se.parentNode.removeChild(Se),
        (n.__icInit = !1),
        (n.__icDestroy = null));
    }));
}
function destroyInfiniteCanvas(e = document) {
  const t = e.querySelector("[data-infinite-canvas]");
  t && t.__icDestroy && t.__icDestroy();
}
function initTextRevealDemo(e = document) {
  const t = [...e.querySelectorAll("[data-demo-tab]")],
    n = [...e.querySelectorAll("[data-demo]")].filter((e) =>
      ["reveal", "hide"].includes(e.getAttribute("data-demo")),
    ),
    o = [...e.querySelectorAll("[data-demo-content]")];
  if (!t.length || !o.length) return;
  const i = new Map(o.map((e) => [e.getAttribute("data-demo-content"), e])),
    r = new Map([...i.keys()].map((e) => [e, !0])),
    a = (e, t, n = 0) => {
      const o = i.get(e);
      if (!o) return;
      const a = "reveal" === t;
      r.get(e) !== a && (r.set(e, a), animateTextReveal(o, t, n));
    };
  let s = (
    t.find((e) => e.classList.contains("is-active")) || t[0]
  ).getAttribute("data-demo-tab");
  const l = (e) => {
      if (!i.has(e) || e === s) return;
      const n = s;
      ((s = e),
        t.forEach((t) =>
          t.classList.toggle(
            "is-active",
            t.getAttribute("data-demo-tab") === e,
          ),
        ),
        a(n, "hide", 0),
        a(e, "reveal", 0));
    },
    c = (e) => l(e.currentTarget.getAttribute("data-demo-tab")),
    d = (e) => a(s, e.currentTarget.getAttribute("data-demo"), 0);
  (t.forEach((e) => {
    (e.classList.toggle("is-active", e.getAttribute("data-demo-tab") === s),
      e.addEventListener("click", c));
  }),
    n.forEach((e) => e.addEventListener("click", d)),
    i.forEach((e, t) => {
      t !== s && (r.set(t, !1), animateTextReveal(e, "hide", 0));
    }),
    regRoute(() => {
      (t.forEach((e) => e.removeEventListener("click", c)),
        n.forEach((e) => e.removeEventListener("click", d)),
        i.clear(),
        r.clear());
    }));
}
function initImageRevealDemo(e = document) {
  const t = [...e.querySelectorAll(".demo-content")],
    n = [...e.querySelectorAll("[data-demo]")].filter((e) =>
      ["reveal", "hide"].includes(e.getAttribute("data-demo")),
    );
  if (!t.length || !n.length) return;
  window.__demoImageDestroy && window.__demoImageDestroy();
  const o = 12,
    i = 32,
    r = "http://www.w3.org/2000/svg",
    a = "__demo-clips";
  let s = document.getElementById(a);
  s ||
    ((s = document.createElementNS(r, "svg")),
    (s.id = a),
    s.setAttribute(
      "style",
      "position:absolute;width:0;height:0;overflow:hidden",
    ),
    s.appendChild(document.createElementNS(r, "defs")),
    document.body.appendChild(s));
  const l = s.querySelector("defs");
  t.forEach((e, t) => {
    ["item", "img"].forEach((e) => {
      if (document.getElementById(`demo-cp-${e}-${t}`)) return;
      const n = document.createElementNS(r, "clipPath");
      ((n.id = `demo-clip-${e}-${t}`),
        n.setAttribute("clipPathUnits", "userSpaceOnUse"));
      const o = document.createElementNS(r, "path");
      ((o.id = `demo-cp-${e}-${t}`), n.appendChild(o), l.appendChild(n));
    });
  });
  const c = [];
  if (
    (t.forEach((e, t) => {
      const n = e.querySelector("img");
      if (!n) return;
      const r = document.getElementById(`demo-cp-item-${t}`),
        a = document.getElementById(`demo-cp-img-${t}`),
        s = { progress: 0 },
        l = { progress: 0 },
        d = Array.from({ length: o }, () => (2 * Math.random() - 1) * i),
        u = (t) => {
          const n = e.offsetWidth,
            i = e.offsetHeight,
            r = t * i,
            a = d.map((e) => r + e * Math.sin(t * Math.PI));
          let s = `M 0 ${a[0]} C`;
          for (let e = 0; e < o - 1; e++) {
            const t = ((e + 1) / (o - 1)) * n,
              i = ((e / (o - 1)) * n + t) / 2;
            s += ` ${i} ${a[e]} ${i} ${a[e + 1]} ${t} ${a[e + 1]}`;
          }
          return ((s += " V 0 H 0 Z"), s);
        };
      ((e.style.clipPath = `url(#demo-clip-item-${t})`),
        (n.style.clipPath = `url(#demo-clip-img-${t})`),
        gsap.set([e, n], { visibility: "visible" }),
        r.setAttribute("d", u(0)),
        a.setAttribute("d", u(0)),
        gsap.killTweensOf([s, l]));
      const p = gsap.timeline({
        paused: !0,
        defaults: { ease: "InOut", duration: durL },
      });
      (p.to(s, {
        progress: 1,
        onUpdate: () => r.setAttribute("d", u(s.progress)),
      }),
        p.to(
          l,
          { progress: 1, onUpdate: () => a.setAttribute("d", u(l.progress)) },
          0.1,
        ),
        p.progress(1).pause(),
        c.push(p));
    }),
    !c.length)
  )
    return;
  let d = !0;
  const u = (e) => {
    const t = "reveal" === e.currentTarget.getAttribute("data-demo");
    d !== t && ((d = t), c.forEach((e) => (t ? e.play() : e.reverse())));
  };
  (n.forEach((e) => e.addEventListener("click", u)),
    (window.__demoImageDestroy = () => {
      (n.forEach((e) => e.removeEventListener("click", u)),
        c.forEach((e) => e.kill()),
        t.forEach((e, t) => {
          e.style.clipPath = "";
          const n = e.querySelector("img");
          (n && (n.style.clipPath = ""),
            ["item", "img"].forEach((e) => {
              document.getElementById(`demo-clip-${e}-${t}`)?.remove();
            }));
        }),
        (window.__demoImageDestroy = null));
    }));
}
gsap.registerPlugin(
  ScrollTrigger,
  CustomEase,
  SplitText,
  MorphSVGPlugin,
  Draggable,
  InertiaPlugin,
);
let nextPage = document,
  onceFunctionsInitialized = !1;
const SOCKET_URL = "https://webflow-cursor-tracker-production.up.railway.app",
  hasLenis = void 0 !== window.Lenis,
  hasScrollTrigger = void 0 !== window.ScrollTrigger,
  rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
(rmMQ.addEventListener?.("change", (e) => (reducedMotion = e.matches)),
  rmMQ.addListener?.((e) => (reducedMotion = e.matches)));
let lenis = null,
  lenisTickerFn = null,
  breakPoint = 992,
  resizeTimeout = null;
const EXCLUDED_PAGES_NS = ["error-404", "demo"],
  EXCLUDED_PATHS = ["/404", "/demo"];
let _socket = null,
  stickyName = {
    inner: null,
    tl: null,
    scrollHandler: null,
    settledHandler: null,
    waitInterval: null,
    triggered: !1,
    checkBottom: null,
  };
window.addEventListener("resize", () => {
  (clearTimeout(resizeTimeout),
    (resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh(!0);
    }, 40)));
});
let durXS = 0.2,
  durS = 0.4,
  durM = 0.8,
  durL = 1.2,
  stagger = 0.1,
  delayReveal = 0.2,
  staggerDefault = 0.05,
  durationDefault = 0.6,
  splitWorksDur = 0.9,
  splitWorksStagger = 0.04,
  NEXT_ENTITY_COUNT = 2;
(CustomEase.create("InOut", "0.76,0,0.24,1"),
  CustomEase.create("Out", "0.25,1,0.5,1"),
  CustomEase.create("In", "0.5,0,0.75,0"),
  CustomEase.create("ease", "0.25,0.1,0.25,1"),
  CustomEase.create("Write", "0.333,0,0.667,1"),
  CustomEase.create("osmo", "0.625,0.05,0,1"),
  (history.scrollRestoration = "manual"),
  (window.__preloaderState = { done: !1, startPage: null, homeHandled: !1 }),
  (window.__revealsPending = !0),
  initLenis(),
  initFluidReveal(),
  initPreloader(),
  barba.hooks.beforeEnter((e) => {
    (window.closeMenu && window.closeMenu(),
      (window.__revealsPending = !0),
      updateNavIndicators(),
      stickyNameOnLeave(e.next.container),
      gsap.set(e.next.container, {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
      }),
      lenis && "function" == typeof lenis.stop && lenis.stop(),
      document.body.classList.add("is-transitioning"),
      initBeforeEnterFunctions(e.next.container));
  }),
  barba.hooks.afterEnter((e) => {
    try {
      (initResetWebflow(e),
        window.__cursorPageSync?.(),
        cleanupGooFilters(),
        initAfterEnterFunctions(e.next.container));
    } finally {
      document.body.classList.remove("is-transitioning");
    }
  }),
  barba.init({
    prevent: ({ href: e }) => {
      if (isExcludedPage()) return !0;
      if (e) {
        const t =
          new URL(e, location.origin).pathname.replace(/\/$/, "") || "/";
        return EXCLUDED_PATHS.some((e) => t === e || t.startsWith(e + "/"));
      }
      return !1;
    },
    debug: !1,
    timeout: 7e3,
    preventRunning: !0,
    transitions: [
      {
        name: "fade",
        sync: !0,
        once: async (e) => (
          initOnceFunctions(),
          runPageOnceAnimation(e.next.container)
        ),
        leave: async (e) =>
          runPageLeaveAnimation(e.current.container, e.next.container),
        async enter(e) {
          resetPage(e.next.container);
        },
      },
    ],
  }));
