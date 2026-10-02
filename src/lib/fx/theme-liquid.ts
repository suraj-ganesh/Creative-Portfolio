import * as THREE from "three";
import { gsap, DUR } from "@/lib/fx/core";

/**
 * Port of the THREE goo/liquid transition from legacy `initThemeMode`
 * (`window.__themeLiquid`) in public/js/slater-bundle.js: fullscreen
 * fixed WebGLRenderer (alpha), OrthographicCamera, ShaderMaterial with
 * uProgress / uCenter / uColor / uAspect / uTime fbm noise. Shaders are
 * verbatim from the bundle.
 *
 * Behavior: `runThemeLiquid` reuses a module-singleton overlay canvas,
 * animates uProgress 0→cover so the screen fills with `color` expanding
 * from the (x, y) point (fractions of viewport, y down). The caller swaps
 * the theme mid-way; this function only runs the liquid cover + reveal
 * and resolves when done, then hides the canvas. Full GL disposal only
 * via `disposeThemeLiquid()`.
 *
 * Simplification vs legacy: legacy used click-event coords + fixed 1.5s
 * "Out" tween targeting max-corner-distance + 0.75. Here the tween runs
 * 0→coverDist over DUR.L with the same ease, and the caller supplies
 * normalized coords instead of a MouseEvent.
 */

const LIQUID_VERT = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

const LIQUID_FRAG = `
        varying vec2 vUv;
        uniform float uProgress;
        uniform vec2 uCenter;
        uniform vec3 uColor;
        uniform float uAspect;
        uniform float uTime;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }
        float fbm(vec2 p) {
          float v = 0.0; float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.1;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv;
          vec2 c = uCenter;
          uv.x *= uAspect;
          c.x *= uAspect;

          float d = distance(uv, c);
          float t = uTime * 0.3;

          float ramp = smoothstep(0.0, 0.5, uProgress);

          vec2 q = vec2(
            fbm(uv * 3.0 + t),
            fbm(uv * 3.0 + 37.2 - t)
          );
          float n = fbm(uv * 4.0 + q * 1.8) * 0.55 * ramp;

          float g = (fbm(uv * 15.0 + 5.1 + t * 0.6) - 0.5) * 0.12 * ramp;

          float edge = uProgress - n + g;
          float mask = smoothstep(edge - 0.012, edge, d);

          gl_FragColor = vec4(uColor, mask);
        }
      `;

interface LiquidState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  uniforms: {
    uProgress: { value: number };
    uCenter: { value: THREE.Vector2 };
    uColor: { value: THREE.Color };
    uAspect: { value: number };
    uTime: { value: number };
  };
  material: THREE.ShaderMaterial;
  geometry: THREE.PlaneGeometry;
  tween: gsap.core.Tween | null;
  raf: number | null;
  onResize: () => void;
}

let state: LiquidState | null = null;

function ensure(): LiquidState {
  if (state) return state;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const el = renderer.domElement;
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "0",
    pointerEvents: "none",
    display: "none",
  } as CSSStyleDeclaration);
  document.body.appendChild(el);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms: LiquidState["uniforms"] = {
    uProgress: { value: 0 },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uColor: { value: new THREE.Color("#000000") },
    uAspect: { value: window.innerWidth / window.innerHeight },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms,
    vertexShader: LIQUID_VERT,
    fragmentShader: LIQUID_FRAG,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  const onResize = () => {
    if (!state) return;
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  state = {
    renderer,
    scene,
    camera,
    uniforms,
    material,
    geometry,
    tween: null,
    raf: null,
    onResize,
  };
  return state;
}

function stopLoop(s: LiquidState) {
  if (s.raf !== null) {
    cancelAnimationFrame(s.raf);
    s.raf = null;
  }
}

export function runThemeLiquid(
  color: string,
  x = 0.5,
  y = 0.5,
): Promise<void> {
  const s = ensure();
  if (s.tween) s.tween.kill();
  stopLoop(s);

  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const cx = Math.min(1, Math.max(0, x));
  const cy = Math.min(1, Math.max(0, 1 - y)); // GL space (y up)
  s.uniforms.uCenter.value.set(cx, cy);
  s.uniforms.uColor.value.set(color);
  s.uniforms.uProgress.value = 0;
  s.uniforms.uAspect.value = aspect;

  // Cover distance = farthest corner + margin (legacy: +0.75).
  const cover =
    [
      [0, 0],
      [aspect, 0],
      [0, 1],
      [aspect, 1],
    ].reduce(
      (m, [px, py]) => Math.max(m, Math.hypot(px - cx * aspect, py - cy)),
      0,
    ) + 0.75;

  const el = s.renderer.domElement;
  el.style.display = "block";
  const loop = () => {
    s.uniforms.uTime.value += 0.016;
    s.renderer.render(s.scene, s.camera);
    s.raf = requestAnimationFrame(loop);
  };
  loop();

  return new Promise<void>((resolve) => {
    s.tween = gsap.to(s.uniforms.uProgress, {
      value: cover,
      duration: DUR.L,
      ease: "power2.out",
      onComplete: () => {
        el.style.display = "none";
        stopLoop(s);
        s.tween = null;
        resolve();
      },
    });
  });
}

export function disposeThemeLiquid(): void {
  if (!state) return;
  const s = state;
  state = null;
  if (s.tween) s.tween.kill();
  stopLoop(s);
  window.removeEventListener("resize", s.onResize);
  s.scene.clear();
  s.geometry.dispose();
  s.material.dispose();
  s.renderer.dispose();
  if (s.renderer.domElement.parentNode) {
    s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
  }
}
