import { prefersReduced, qa, type Cleanup } from "@/lib/fx/core";

/**
 * Port of legacy `initFluidReveal` / `destroyFluidReveal` from
 * public/js/slater-bundle.js — raw WebGL2 (no three) ping-pong
 * fluid/smoke reveal driven by pointer. Shader strings + uniform names
 * ported verbatim from the bundle (template literals escaped as needed).
 *
 * Simplifications vs legacy:
 * - Mobile (<992px) no-op (as legacy).
 * - Preloader/transition paint gate dropped (no barba globals in Next);
 *   painting is always allowed once visible.
 * - Canvas backing store uses devicePixelRatio (≤2) instead of legacy
 *   fixed 1x.
 * - prefersReduced → hide canvas, keep content visible.
 */

interface FluidHost extends HTMLElement {
  _fluidActive?: boolean;
  _fluidPainted?: boolean;
  _destroyFluidReveal?: () => void;
}

const tracked = new Set<FluidHost>();

// --- Verbatim shader sources from the bundle ---
const VERT_SRC = `#version 300 es
      precision highp float;
      in vec2 aPos;
      out vec2 vUv;
      void main () {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }`;

const SPLAT_FRAG_SRC = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uField;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point;
        p.x *= aspectRatio;
        float g = exp(-dot(p, p) / radius);
        vec4 f = texture(uField, vUv);
        float w = clamp(g * color.x, 0.0, 1.0);
        fragColor = vec4(
          f.r + g * color.x,
          mix(f.g, color.y, w),
          mix(f.b, color.z, w),
          1.0
        );
      }`;

const SIM_FRAG_SRC = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uField;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float friction;
      uniform float spread;
      uniform float decay;
      uniform float wobble;
      uniform float grain;
      uniform float time;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1, 0)), f.x),
          mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;
      }

      void main () {
        vec2 vel = texture(uField, vUv).gb;
        vec2 coord = vUv - vel * dt;
        vec4 s = texture(uField, coord);

        float t = time * 0.3;
        vec2 warp = (vec2(
          fbm(vUv * 11.0 + t),
          fbm(vUv * 11.0 + 37.2 - t)
        ) - 0.5) * 2.0 * wobble * texelSize;

        vec4 nL = texture(uField, coord + vec2(-texelSize.x, 0.0) + warp);
        vec4 nR = texture(uField, coord + vec2( texelSize.x, 0.0) + warp);
        vec4 nT = texture(uField, coord + vec2(0.0,  texelSize.y) + warp);
        vec4 nB = texture(uField, coord + vec2(0.0, -texelSize.y) + warp);
        float avgD = (nL.r + nR.r + nT.r + nB.r) * 0.25;
        vec2 avgV = (nL.gb + nR.gb + nT.gb + nB.gb) * 0.25;

        float d = mix(s.r, avgD, spread);
        vec2 v = mix(s.gb, avgV, spread * 0.5);

        float g = fbm(vUv * 15.0 + 5.1 + t * 0.6);
        d *= 1.0 / (1.0 + (decay + grain * decay * (g - 0.5) * 2.0) * dt);
        v *= 1.0 / (1.0 + friction * dt);

        fragColor = vec4(max(d, 0.0), v, 1.0);
      }`;

const MASK_FRAG_SRC = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uField;
      uniform vec3 maskColor;
      uniform vec2 edge;
      uniform float bottomFade;
      uniform float time;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1, 0)), f.x),
          mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;
      }

      void main () {
        float d = texture(uField, vUv).r;

        float n = fbm(vec2(vUv.x * 9.0, time * 0.25));
        float localFade = bottomFade * (0.35 + n * 1.3);
        d *= smoothstep(0.0, localFade, vUv.y);

        float alpha = 1.0 - smoothstep(edge.x, edge.y, d);
        fragColor = vec4(maskColor, alpha);
      }`;

interface RT {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
  attach: (unit: number) => number;
}

export function initFluidReveal(scope: ParentNode = document): Cleanup {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(max-width: 991px)").matches) return () => {};
  // Drop instances whose hosts left the document (SPA navigations commit
  // the new page before teardown runs, so document-scoped destroys miss
  // the detached hosts and their rAF loops would leak one per visit).
  destroyDetachedFluid();
  const hosts = qa<FluidHost>("[data-fluid-reveal]", scope);
  if (!hosts.length) return () => {};
  const cleanups: Cleanup[] = [];

  if (prefersReduced()) {
    // Static fallback: hide canvases, keep content visible.
    for (const host of hosts) {
      const canvas = host.querySelector<HTMLCanvasElement>("[data-fluid-canvas]");
      if (canvas) canvas.style.display = "none";
      const cover = host.querySelector<HTMLElement>("[data-fluid-cover]");
      if (cover) cover.style.display = "";
    }
    return () => {};
  }

  for (const host of hosts) {
    if (host._fluidActive) continue;
    const cleanup = initOne(host);
    if (cleanup) {
      cleanups.push(cleanup);
      tracked.add(host);
    }
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}

function initOne(host: FluidHost): Cleanup | null {
  host._fluidActive = true;

  // Legacy tuning constants (verbatim).
  const SIM_MIN = 512;
  const SIM_MAX = 1440;
  const VEL_SCALE = 1.6;
  const FRICTION = 3;
  const SPREAD = 0.79;
  const DECAY = 1.5;
  const SPLAT_RADIUS = 0.004;
  const SPLAT_FORCE = 3.5;
  const WOBBLE = 2.6;
  const GRAIN = 0.7;
  const EDGE_X = 0.39;
  const EDGE_Y = 0.4;
  const MAX_VEL = 4;
  const BOTTOM_FADE = 0.18;
  const COLOR_VAR = "--_colors---background--bg";
  const RECOLOR_MS = 1200;
  const canPaint = () => true;

  const cover = host.querySelector<HTMLElement>("[data-fluid-cover]");
  let canvas = host.querySelector<HTMLCanvasElement>("[data-fluid-canvas]");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("data-fluid-canvas", "");
    canvas.style.cssText = "position:absolute; inset:0; width:100%; height:100%;";
    host.appendChild(canvas);
  }
  canvas.style.color = `var(${COLOR_VAR})`;
  const glCanvas = canvas;

  const maskRGB: [number, number, number] = [1, 1, 1];
  let recolorUntil = performance.now() + RECOLOR_MS;
  const readMaskColor = () => {
    const m = getComputedStyle(glCanvas).color.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      maskRGB[0] = Number(m[0]) / 255;
      maskRGB[1] = Number(m[1]) / 255;
      maskRGB[2] = Number(m[2]) / 255;
    }
  };
  readMaskColor();
  const classObs = new MutationObserver(() => {
    recolorUntil = performance.now() + RECOLOR_MS;
  });
  // Theme classes live on <html> (see lib/theme + layout bootstrap);
  // watching body alone misses every theme swap, leaving the hero
  // background stuck on the old theme until scroll re-triggers a read.
  classObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  classObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  let gl = glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false }) as WebGL2RenderingContext | null;
  if (!gl) {
    host._fluidActive = false;
    classObs.disconnect();
    return null;
  }
  const ctx = gl;
  ctx.getExtension("EXT_color_buffer_float");
  const filter = ctx.getExtension("OES_texture_float_linear")
    ? ctx.LINEAR
    : ctx.NEAREST;

  const compile = (type: number, src: string): WebGLShader => {
    const sh = ctx.createShader(type)!;
    ctx.shaderSource(sh, src);
    ctx.compileShader(sh);
    return sh;
  };
  const makeProg = (fragSrc: string) => {
    const prog = ctx.createProgram()!;
    ctx.attachShader(prog, vertShader);
    ctx.attachShader(prog, compile(ctx.FRAGMENT_SHADER, fragSrc));
    ctx.linkProgram(prog);
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const count = ctx.getProgramParameter(prog, ctx.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = ctx.getActiveUniform(prog, i);
      if (info) uniforms[info.name] = ctx.getUniformLocation(prog, info.name);
    }
    return { p: prog, uniforms };
  };
  const makeRT = (w: number, h: number): RT => {
    const tex = ctx.createTexture()!;
    ctx.activeTexture(ctx.TEXTURE0);
    ctx.bindTexture(ctx.TEXTURE_2D, tex);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, filter);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, filter);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA16F, w, h, 0, ctx.RGBA, ctx.HALF_FLOAT, null);
    const fbo = ctx.createFramebuffer()!;
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, tex, 0);
    ctx.viewport(0, 0, w, h);
    ctx.clearColor(0, 0, 0, 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    return {
      tex,
      fbo,
      w,
      h,
      attach(unit: number) {
        ctx.activeTexture(ctx.TEXTURE0 + unit);
        ctx.bindTexture(ctx.TEXTURE_2D, this.tex);
        return unit;
      },
    };
  };

  const vertShader = compile(ctx.VERTEX_SHADER, VERT_SRC);
  const splatProg = makeProg(SPLAT_FRAG_SRC);
  const simProg = makeProg(SIM_FRAG_SRC);
  const maskProg = makeProg(MASK_FRAG_SRC);
  const vao = ctx.createVertexArray();
  ctx.bindVertexArray(vao);
  const quad = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, quad);
  ctx.bufferData(
    ctx.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    ctx.STATIC_DRAW,
  );
  ctx.enableVertexAttribArray(0);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);

  let read: RT | null = null;
  let write: RT | null = null;
  const pair = {
    get read() {
      return read!;
    },
    get write() {
      return write!;
    },
    swap() {
      const t = read;
      read = write;
      write = t;
    },
    texelX: 1 / SIM_MIN,
    texelY: 1 / SIM_MIN,
  };

  const sizeSim = () => {
    const aspect = glCanvas.width / Math.max(glCanvas.height, 1);
    let w: number;
    let h: number;
    if (aspect >= 1) {
      h = SIM_MIN;
      w = Math.min(Math.round(SIM_MIN * aspect), SIM_MAX);
    } else {
      w = SIM_MIN;
      h = Math.min(Math.round(SIM_MIN / aspect), SIM_MAX);
    }
    if (read && read.w === w && read.h === h) return;
    if (read && write) {
      ctx.deleteTexture(read.tex);
      ctx.deleteFramebuffer(read.fbo);
      ctx.deleteTexture(write.tex);
      ctx.deleteFramebuffer(write.fbo);
    }
    read = makeRT(w, h);
    write = makeRT(w, h);
    pair.texelX = 1 / w;
    pair.texelY = 1 / h;
  };

  const blit = (target: RT | null) => {
    if (target) {
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, target.fbo);
      ctx.viewport(0, 0, target.w, target.h);
    } else {
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
      ctx.viewport(0, 0, glCanvas.width, glCanvas.height);
    }
    ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
  };

  const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, moved: false, init: false };
  let bounds = host.getBoundingClientRect();
  let lastPush = performance.now();

  const pushPointer = (cx: number, cy: number) => {
    const now = performance.now();
    const dt = Math.max((now - lastPush) / 1000, 0.004);
    lastPush = now;
    const nx = (cx - bounds.left) / bounds.width;
    const ny = 1 - (cy - bounds.top) / bounds.height;
    if (pointer.init) {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
    } else {
      pointer.px = nx;
      pointer.py = ny;
      pointer.init = true;
    }
    pointer.vx = (nx - pointer.px) / dt;
    pointer.vy = (ny - pointer.py) / dt;
    pointer.x = nx;
    pointer.y = ny;
    pointer.moved = true;
  };

  const splat = (x: number, y: number, fx: number, fy: number, force: number) => {
    ctx.useProgram(splatProg.p);
    ctx.uniform1i(splatProg.uniforms.uField, pair.read.attach(0));
    ctx.uniform1f(splatProg.uniforms.aspectRatio, glCanvas.width / glCanvas.height);
    ctx.uniform2f(splatProg.uniforms.point, x, y);
    ctx.uniform3f(splatProg.uniforms.color, force, fx, fy);
    ctx.uniform1f(splatProg.uniforms.radius, SPLAT_RADIUS);
    blit(pair.write);
    pair.swap();
  };

  const splatStroke = () => {
    const aspect = glCanvas.width / Math.max(glCanvas.height, 1);
    const fx = Math.max(-MAX_VEL, Math.min(MAX_VEL, pointer.vx)) * VEL_SCALE;
    const fy = Math.max(-MAX_VEL, Math.min(MAX_VEL, pointer.vy)) * VEL_SCALE;
    const dist = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);
    const steps = Math.max(1, Math.ceil(dist / (0.4 * Math.sqrt(SPLAT_RADIUS))));
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 1 : i / (steps - 1);
      splat(
        pointer.px + (pointer.x - pointer.px) * t,
        pointer.py + (pointer.y - pointer.py) * t,
        fx,
        fy,
        SPLAT_FORCE,
      );
    }
  };

  let raf: number | null = null;
  let lastFrame = performance.now();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - lastFrame) / 1000, 0.033);
    lastFrame = now;
    ctx.disable(ctx.BLEND);
    if (pointer.moved) {
      if (canPaint()) splatStroke();
      pointer.moved = false;
    }
    ctx.useProgram(simProg.p);
    ctx.uniform2f(simProg.uniforms.texelSize, pair.texelX, pair.texelY);
    ctx.uniform1f(simProg.uniforms.dt, dt);
    ctx.uniform1f(simProg.uniforms.friction, FRICTION);
    ctx.uniform1f(simProg.uniforms.spread, SPREAD);
    ctx.uniform1f(simProg.uniforms.decay, DECAY);
    ctx.uniform1f(simProg.uniforms.wobble, WOBBLE);
    ctx.uniform1f(simProg.uniforms.grain, GRAIN);
    ctx.uniform1f(simProg.uniforms.time, 0.001 * now);
    ctx.uniform1i(simProg.uniforms.uField, pair.read.attach(0));
    blit(pair.write);
    pair.swap();

    if (now < recolorUntil) readMaskColor();
    ctx.useProgram(maskProg.p);
    ctx.uniform1i(maskProg.uniforms.uField, pair.read.attach(0));
    ctx.uniform3f(maskProg.uniforms.maskColor, maskRGB[0], maskRGB[1], maskRGB[2]);
    ctx.uniform2f(maskProg.uniforms.edge, EDGE_X, EDGE_Y);
    ctx.uniform1f(maskProg.uniforms.bottomFade, BOTTOM_FADE);
    ctx.uniform1f(maskProg.uniforms.time, 0.001 * now);
    blit(null);

    if (cover && !host._fluidPainted) {
      host._fluidPainted = true;
      cover.style.display = "none";
    }
  };

  const resize = () => {
    const r = host.getBoundingClientRect();
    bounds = r;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    glCanvas.width = Math.max(1, Math.round(r.width * dpr));
    glCanvas.height = Math.max(1, Math.round(r.height * dpr));
    sizeSim();
  };

  const startLoop = () => {
    if (raf === null) {
      lastFrame = performance.now();
      readMaskColor();
      bounds = host.getBoundingClientRect();
      raf = requestAnimationFrame(frame);
    }
  };
  const stopLoop = () => {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
  const clearField = () => {
    if (!read || !write) return;
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, read.fbo);
    ctx.viewport(0, 0, read.w, read.h);
    ctx.clearColor(0, 0, 0, 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, write.fbo);
    ctx.viewport(0, 0, write.w, write.h);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.useProgram(maskProg.p);
    ctx.uniform1i(maskProg.uniforms.uField, pair.read.attach(0));
    ctx.uniform3f(maskProg.uniforms.maskColor, maskRGB[0], maskRGB[1], maskRGB[2]);
    ctx.uniform2f(maskProg.uniforms.edge, EDGE_X, EDGE_Y);
    ctx.uniform1f(maskProg.uniforms.bottomFade, BOTTOM_FADE);
    ctx.uniform1f(maskProg.uniforms.time, 0.001 * performance.now());
    blit(null);
  };

  const onMouse = (e: PointerEvent) => pushPointer(e.clientX, e.clientY);
  const onTouch = (e: TouchEvent) => {
    if (e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onLeave = () => {
    pointer.init = false;
  };
  const onScroll = () => {
    bounds = host.getBoundingClientRect();
  };
  const onLost = (e: Event) => {
    // Re-init guard: hold the loop; a fresh init can run after restore.
    e.preventDefault();
    stopLoop();
    lost = true;
  };
  const onRestored = () => {
    if (!lost) return;
    lost = false;
    resize();
    startLoop();
  };
  let lost = false;

  host.addEventListener("pointermove", onMouse as EventListener);
  host.addEventListener("touchmove", onTouch as EventListener, { passive: true });
  host.addEventListener("pointerleave", onLeave);
  window.addEventListener("scroll", onScroll, { passive: true });
  glCanvas.addEventListener("webglcontextlost", onLost);
  glCanvas.addEventListener("webglcontextrestored", onRestored);

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        pointer.init = false;
        if (!lost) startLoop();
      } else {
        stopLoop();
        clearField();
      }
    },
    { threshold: 0 },
  );
  io.observe(host);

  resize();
  startLoop();

  const destroy = () => {
    stopLoop();
    host.removeEventListener("pointermove", onMouse as EventListener);
    host.removeEventListener("touchmove", onTouch as EventListener);
    host.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("scroll", onScroll);
    glCanvas.removeEventListener("webglcontextlost", onLost);
    glCanvas.removeEventListener("webglcontextrestored", onRestored);
    ro.disconnect();
    io.disconnect();
    classObs.disconnect();
    if (read && write) {
      ctx.deleteTexture(read.tex);
      ctx.deleteFramebuffer(read.fbo);
      ctx.deleteTexture(write.tex);
      ctx.deleteFramebuffer(write.fbo);
    }
    ctx.deleteBuffer(quad);
    ctx.deleteVertexArray(vao);
    const lose = ctx.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    gl = null;
    host._fluidActive = false;
    tracked.delete(host);
  };
  host._destroyFluidReveal = destroy;
  return destroy;
}

export function destroyFluidReveal(scope: ParentNode = document): void {
  qa<FluidHost>("[data-fluid-reveal]", scope).forEach((host) => {
    host._destroyFluidReveal?.();
  });
}

/**
 * Destroy instances whose hosts left the document. SPA navigations commit
 * the new page before teardown runs, so document-scoped destroys can only
 * see the new page's hosts and always miss the detached ones. Safe to call
 * any time: connected hosts (owned by the current page) are untouched.
 */
export function destroyDetachedFluid(): void {
  for (const host of Array.from(tracked)) {
    if (!host.isConnected) {
      try {
        host._destroyFluidReveal?.();
      } catch {
        /* ignore */
      }
      tracked.delete(host);
    }
  }
}
