import * as THREE from "three";
import { gsap, DUR, prefersReduced, qa, type Cleanup } from "@/lib/fx/core";

/**
 * Port of legacy `initGlobe` / `_initGlobeReal` / `animateGlobe` /
 * `_globeDestroy` from public/js/slater-bundle.js.
 *
 * NOTE on naming: the task brief says "textured/point globe", but the
 * actual bundle code builds no textured sphere — it builds a rotating
 * group of textured image *cards* (PlaneGeometry + MeshBasicMaterial
 * with per-image textures from [data-globe="img"] img srcset) arranged
 * on a fibonacci sphere, with drag-to-spin, hover raycasting and a
 * pinned/overlay focus state. This ports that real behavior verbatim.
 *
 * Simplifications vs legacy:
 * - `window.THREE` global → `three` npm import.
 * - Lenis scroll hooks dropped (window wheel/touchmove only).
 * - `animateDivReveal` for [data-works-info] replaced with local
 *   gsap opacity/display fades (no cross-module dependency).
 * - Mobile (<992px) is a no-op like legacy.
 * - prefersReduced → single static frame, no rAF loop.
 */

interface GlobeCard {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  mat: THREE.MeshBasicMaterial;
  slug: string;
  /** Backing video element for video cards (null for image cards).
   *  Used to unmute the focused card so it plays WITH sound. */
  vid: HTMLVideoElement | null;
  origPos: THREE.Vector3;
  origDir: THREE.Vector3;
  origQuat: THREE.Quaternion;
  _t: number;
  liftT: number;
  pinned: boolean;
  inOverlay: boolean;
  snapPos: THREE.Vector3;
  snapQuat: THREE.Quaternion;
  hoverable: boolean;
  cooldown: number;
  revealT: number;
}

interface GlobeHost extends HTMLElement {
  _globeEnsureInit?: (() => void) | null;
  _globeDestroy?: () => void;
  _globeAnimate?: (
    mode: "initial" | "reveal" | "hide",
    delay?: number,
    done?: () => void,
  ) => void;
  _globeGetDuration?: (mode: string, delay?: number) => number;
}

const tracked = new Set<GlobeHost>();

function fibSphere(count: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return pts;
}

const bobPhase = (t: number) => 0.5 * (Math.sin(t * Math.PI * 2) + 1);

function fadeInfoShow(el: HTMLElement) {
  el.style.display = "block";
  gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 1, duration: DUR.M, ease: "power2.out", overwrite: true },
  );
}

function fadeInfoHide(el: HTMLElement, after: () => void) {
  gsap.to(el, {
    opacity: 0,
    duration: DUR.S,
    ease: "power2.in",
    overwrite: true,
    onComplete: after,
  });
}

function initGlobeReal(wrapEl: HTMLElement, scope: ParentNode) {
  const el = wrapEl as GlobeHost;
  const clientW = () => wrapEl.clientWidth;
  const clientH = () => wrapEl.clientHeight;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(Math.max(clientW(), 1), Math.max(clientH(), 1));
  wrapEl.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
  } as CSSStyleDeclaration);
  wrapEl.style.cursor = "grab";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    48,
    Math.max(clientW(), 1) / Math.max(clientH(), 1),
    0.1,
    1000,
  );

  // Legacy tuning constants (verbatim).
  const CARD_W = 0.4;
  const RADIUS = 1.85;
  const FOCUS_Z = 1.8;
  const FOCUS_SCALE = 3.2;
  const MAX_VEL = 0.11;
  const DRAG_K = 0.013;
  const DAMP_GRAB = 0.9;
  const DAMP_FREE = 0.94;
  const BASE_SPEED = 0.003;
  const IDLE_MS = 1000;
  const COOLDOWN = 0.4;
  const BOB_AMP = 0.1;
  const TIME_RATE = 0.1;
  const BOB_FREQ = 1.5;
  const ORDER_PINNED = 999;
  const ORDER_LIFT = 500;
  const MAX_CONCURRENT = 6;
  // A sphere card exists ONLY once its video can play — no still frames,
  // ever. Failed loads retry, then the item is skipped outright.
  const VIDEO_LOAD_TIMEOUT_MS = 15000;
  const VIDEO_LOAD_RETRIES = 3;
  const VIDEO_RETRY_DELAY_MS = 2500;
  const REVEAL_DUR = 1.4;
  const REVEAL_STAG = 0.015;
  const HIDE_DUR = 0.6;
  const HIDE_STAG = 0.008;

  const tmpV = new THREE.Vector3();
  const tmpLerp = new THREE.Vector3();
  const tmpN = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpQ2 = new THREE.Quaternion();
  const spinQ = new THREE.Quaternion();
  const invSpinQ = new THREE.Quaternion();
  const spinE = new THREE.Euler(0, 0, 0, "YXZ");
  const faceN = new THREE.Vector3();
  const faceRef = new THREE.Vector3(0, 0, 1);
  const focusPos = new THREE.Vector3(0, 0, FOCUS_Z);
  const focusQuat = new THREE.Quaternion();

  const rotor = new THREE.Group();
  const overlay = new THREE.Group();
  scene.add(rotor, overlay);

  const cards: GlobeCard[] = [];
  let cardMeshes: THREE.Object3D[] = [];

  // Works-info panel wiring (simplified fades instead of animateDivReveal).
  const infos = Array.from(
    scope.querySelectorAll<HTMLElement>("[data-works-info]"),
  );
  const findInfo = (slug: string) =>
    infos.find((n) => (n.getAttribute("data-works-info") || "").trim() === slug);
  infos.forEach((n) => {
    n.style.opacity = "0";
    n.style.display = "none";
  });
  let activeInfo: HTMLElement | null = null;
  const hideInfo = () => {
    if (!activeInfo) return;
    const node = activeInfo;
    activeInfo = null;
    fadeInfoHide(node, () => {
      if (activeInfo !== node) node.style.display = "none";
    });
  };
  const showInfo = (slug: string) => {
    const node = findInfo(slug);
    if (!node) return hideInfo();
    if (activeInfo === node) return;
    const prev = activeInfo;
    activeInfo = node;
    if (prev) {
      fadeInfoHide(prev, () => {
        if (activeInfo !== prev) prev.style.display = "none";
      });
    }
    node.style.display = "block";
    requestAnimationFrame(() => {
      if (activeInfo === node) fadeInfoShow(node);
    });
  };

  const fitCamera = () => {
    const dist = RADIUS + 0.6 * CARD_W;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    camera.position.z =
      1.08 * Math.max(dist / Math.tan(vFov / 2), dist / Math.tan(hFov / 2));
  };

  const unpin = () => {
    if (pinned) {
      pinned.pinned = false;
      // Stop that card's audio when it leaves focus.
      if (pinned.vid) {
        try {
          pinned.vid.muted = true;
        } catch {
          /* noop */
        }
      }
    }
    pinned = null;
  };
  const resetView = () => {
    unpin();
    hideInfo();
    idleVel = 0;
    dragVel = 0;
  };

  // Texture queue (video loads gate card creation — see loadVideoCard).
  const queue: Array<(done: () => void) => void> = [];
  let inFlight = 0;
  const pump = () => {
    while (inFlight < MAX_CONCURRENT && queue.length) {
      const job = queue.shift()!;
      inFlight++;
      job(() => {
        inFlight--;
        requestAnimationFrame(pump);
      });
    }
  };

  let tornDown = false;

  /**
   * Load one sphere video and create its card once playback is possible.
   * Stills are never used: on failure the compressed rendition falls back
   * to the raw URL, then the whole load retries a few times, then the item
   * is skipped (no card) rather than left behind as a frozen frame.
   */
  const loadVideoCard = (
    vid: HTMLVideoElement,
    dir: THREE.Vector3,
    slug: string,
    done: () => void,
    rawTried: boolean,
    attempt: number,
  ): void => {
    if (tornDown) {
      done();
      return;
    }
    const tex = new THREE.VideoTexture(vid);
    tex.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
    tex.colorSpace = THREE.SRGBColorSpace;
    let settled = false;
    let timer = 0;
    let triedRaw = rawTried;
    const disposeTex = () => {
      try {
        tex.dispose();
      } catch {
        /* noop */
      }
    };
    const arm = () => {
      vid.addEventListener("canplay", onReady, { once: true });
      vid.addEventListener("error", onFail, { once: true });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (vid.readyState >= 2 && vid.videoWidth > 0) onReady();
        else onFail();
      }, VIDEO_LOAD_TIMEOUT_MS);
    };
    const onReady = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (tornDown) {
        disposeTex();
        done();
        return;
      }
      addCard(tex, dir, slug, done, vid);
      cardVideos.add(vid);
      // Cards arriving after the reveal start at once; earlier ones are
      // started together by playCardVideos() on reveal. The watchdog below
      // keeps every sphere video running from then on.
      if (globeState === "shown") {
        try {
          const attemptPlay = vid.play();
          if (attemptPlay && typeof attemptPlay.catch === "function") {
            attemptPlay.catch(() => {});
          }
        } catch {
          /* watchdog retries */
        }
      }
    };
    const onFail = () => {
      if (settled) return;
      const raw = vid.getAttribute("data-raw");
      if (!triedRaw && raw && vid.src !== raw) {
        triedRaw = true;
        // Detach this round's listeners before re-arming — otherwise the
        // stale set would double-handle the retry (double requeue / cards).
        vid.removeEventListener("canplay", onReady);
        vid.removeEventListener("error", onFail);
        try {
          vid.preload = "auto";
          vid.muted = true;
          vid.src = raw;
          vid.load();
        } catch {
          /* arm() events settle the retry */
        }
        arm();
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      disposeTex();
      if (attempt < VIDEO_LOAD_RETRIES && !tornDown) {
        // Free this queue slot now; the retry rejoins the back of the line.
        queue.push((retryDone) =>
          loadVideoCard(vid, dir, slug, retryDone, true, attempt + 1),
        );
        window.setTimeout(() => {
          pump();
        }, VIDEO_RETRY_DELAY_MS);
        done();
        return;
      }
      cardVideos.delete(vid);
      done();
    };
    try {
      // Database <video> nodes use preload="none" so nothing buffers until
      // this explicit load.
      vid.preload = "auto";
      vid.muted = true;
      if (vid.readyState >= 2 && vid.videoWidth > 0) {
        onReady();
      } else {
        try {
          vid.load();
        } catch {
          /* arm() events settle the job */
        }
        arm();
      }
    } catch {
      onFail();
    }
  };

  const addCard = (
    tex: THREE.Texture,
    dir: THREE.Vector3,
    slug: string,
    done: () => void,
    vid: HTMLVideoElement | null = null,
  ) => {
    // Cards render small on the sphere — 2x anisotropy is visually
    // identical to 4x here at a fraction of the upload cost.
    tex.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    // Color textures are authored in sRGB. Without this flag three
    // samples them as linear and re-encodes on output, which renders
    // every card brighter/washed-out ("overexposed"). Marking both
    // image and video textures as sRGB keeps original colors.
    tex.colorSpace = THREE.SRGBColorSpace;
    const img = tex.image as
      | (HTMLImageElement | HTMLVideoElement)
      | { width?: number; height?: number }
      | undefined;
    // Preserve the source's native aspect so vertical 9:16 clips stay
    // tall and narrow. Video elements expose videoWidth/videoHeight
    // (`.width` is just the layout attribute), images expose
    // naturalWidth/naturalHeight — fall back to width/height last.
    const iw =
      (img as HTMLVideoElement)?.videoWidth ||
      (img as HTMLImageElement)?.naturalWidth ||
      img?.width ||
      1600;
    const ih =
      (img as HTMLVideoElement)?.videoHeight ||
      (img as HTMLImageElement)?.naturalHeight ||
      img?.height ||
      900;
    const h = CARD_W / (iw / ih);
    const pos = dir.clone().multiplyScalar(RADIUS);
    const geo = new THREE.PlaneGeometry(CARD_W, h);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    mat.onBeforeCompile = (sh) => {
      // three >= r152 uses per-map UV varyings (vMapUv), not the legacy vUv.
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <map_fragment>",
        `\n        vec2 mapUv = vMapUv;\n        if (!gl_FrontFacing) { mapUv.x = 1.0 - mapUv.x; }\n        vec4 sampledDiffuseColor = texture2D(map, mapUv);\n        diffuseColor *= sampledDiffuseColor;\n        `,
      );
    };
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.lookAt(0, 0, 0);
    mesh.rotateY(Math.PI);
    mesh.frustumCulled = false;
    mesh.scale.setScalar(0);
    mesh.visible = false;
    rotor.add(mesh);
    try {
      renderer.initTexture(tex);
    } catch {
      /* noop */
    }
    // NOTE: no renderer.compile() per card — the first render compiles the
    // shared MeshBasicMaterial program once; compiling per card rescanned
    // the whole scene on every texture arrival.
    const card: GlobeCard = {
      mesh,
      mat,
      slug,
      vid,
      origPos: pos.clone(),
      origDir: pos.clone().normalize(),
      origQuat: mesh.quaternion.clone(),
      _t: 0,
      liftT: 0,
      pinned: false,
      inOverlay: false,
      snapPos: new THREE.Vector3(),
      snapQuat: new THREE.Quaternion(),
      hoverable: false,
      cooldown: 0,
      revealT: 0,
    };
    if (globeState === "shown") {
      card.revealT = 1;
      card.mesh.visible = true;
    } else if (globeState === "revealing") {
      card.mesh.visible = true;
      gsap.to(card, { revealT: 1, duration: REVEAL_DUR, ease: "power2.out" });
    }
    const baseRaycast = THREE.Mesh.prototype.raycast;
    mesh.raycast = function (raycaster, intersects) {
      if (card.hoverable) baseRaycast.call(this, raycaster, intersects);
    };
    cards.push(card);
    cardMeshes = cards.map((c) => c.mesh);
    done();
  };

  const moveToOverlay = (card: GlobeCard) => {
    if (card.inOverlay) return;
    card.mesh.getWorldPosition(card.snapPos);
    card.mesh.getWorldQuaternion(card.snapQuat);
    rotor.remove(card.mesh);
    card.mesh.position.copy(card.snapPos);
    card.mesh.quaternion.copy(card.snapQuat);
    card.mesh.scale.setScalar(1);
    overlay.add(card.mesh);
    card.inOverlay = true;
  };

  const moveToRotor = (card: GlobeCard) => {
    if (!card.inOverlay) return;
    overlay.remove(card.mesh);
    card.mesh.position.copy(card.origPos);
    card.mesh.quaternion.copy(card.origQuat);
    card.mesh.scale.setScalar(1);
    card.mesh.renderOrder = 0;
    card.mat.depthTest = true;
    card._t = 0;
    card.cooldown = COOLDOWN;
    rotor.add(card.mesh);
    card.inOverlay = false;
  };

  // Manual rAF delta (THREE.Clock is deprecated in favor of THREE.Timer).
  let last = -1;
  let elapsed = 0;
  let raf: number | null = null;
  let cursor = "grab";
  let visible = true;
  let globeState: "initial" | "revealing" | "shown" | "hiding" | "hidden" =
    "initial";
  let revealTween: { kill(): void } | null = null;
  let pinned: GlobeCard | null = null;
  let hovering = false;
  const pointerNDC = new THREE.Vector2(-9, -9);
  const raycaster = new THREE.Raycaster();
  let idleVel: number = BASE_SPEED;
  let targetVel: number = BASE_SPEED;
  let idleTime = 0;
  let dragging = false;
  let dragMoved = false;
  let lastX = 0;
  let dragVel = 0;
  let spin = 0;
  const reduced = prefersReduced();
  let lastWatchdog = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = last < 0 ? 0.016 : Math.min((now - last) / 1000, 0.05);
    last = now;
    // Watchdog: sphere videos must keep running while shown — resume any
    // that stalled (decoder pressure, backgrounded tab, blocked autoplay).
    // Throttled to once per 3s so it costs nothing per frame.
    if (now - lastWatchdog > 3000) {
      lastWatchdog = now;
      if (
        globeState === "shown" &&
        visible &&
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        cardVideos.forEach((v) => {
          if (v.paused) {
            try {
              const attempt = v.play();
              if (attempt && typeof attempt.catch === "function") {
                attempt.catch(() => {});
              }
            } catch {
              /* retry on the next pass */
            }
          }
        });
      }
    }
    const step = Math.min(1, 60 * dt);
    elapsed += dt * TIME_RATE;
    if (hovering || dragging || pinned) {
      idleTime = 0;
      targetVel = 0;
    } else {
      idleTime += dt;
      if (idleTime > IDLE_MS / 1000) targetVel = BASE_SPEED;
    }
    idleVel += (targetVel - idleVel) * (dragging ? 0.18 : 0.03) * step;
    dragVel *= Math.pow(dragging ? DAMP_GRAB : DAMP_FREE, step);
    spin += (dragVel + idleVel) * step;
    rotor.rotation.y = spin;
    spinE.y = spin;
    spinQ.setFromEuler(spinE);
    invSpinQ.copy(spinQ).invert();

    let hovered: GlobeCard | null = null;
    if (!hovering || dragging || globeState !== "shown" || !cardMeshes.length) {
      // skip raycast
    } else {
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(cardMeshes, false);
      if (hits.length)
        hovered = cards.find((c) => c.mesh === hits[0].object) ?? null;
    }
    const nextCursor = dragging ? "grabbing" : hovered ? "pointer" : "grab";
    if (nextCursor !== cursor) {
      wrapEl.style.cursor = nextCursor;
      cursor = nextCursor;
    }

    for (const card of cards) {
      if (card.cooldown > 0)
        card.cooldown = Math.max(0, card.cooldown - dt);
      const revealing = card.revealT < 1;
      const doLift = card === hovered && !card.pinned && card.cooldown === 0 && !revealing;
      const isPinned = card.pinned;
      if (isPinned && !card.inOverlay) moveToOverlay(card);
      if (!isPinned && card.inOverlay && card.liftT === 0) moveToRotor(card);
      const liftTarget = isPinned ? 1 : 0;
      card.liftT += 0.12 * (liftTarget - card.liftT) * step;
      if (liftTarget === 0 && card.liftT < 0.005) card.liftT = 0;
      if (liftTarget === 1 && card.liftT > 0.995) card.liftT = 1;

      if (card.inOverlay) {
        const bob = bobPhase(elapsed + card.origPos.y * BOB_FREQ) * BOB_AMP;
        tmpV
          .copy(card.origPos)
          .addScaledVector(card.origDir, bob)
          .applyQuaternion(spinQ);
        tmpQ.copy(card.origQuat).premultiply(spinQ);
        const fromP = isPinned ? card.snapPos : tmpV;
        const fromQ = isPinned ? card.snapQuat : tmpQ;
        tmpLerp.lerpVectors(fromP, focusPos, card.liftT);
        card.mesh.position.copy(tmpLerp);
        tmpQ2.slerpQuaternions(fromQ, focusQuat, card.liftT);
        card.mesh.quaternion.copy(tmpQ2);
        card.mesh.scale.setScalar(1 + (FOCUS_SCALE - 1) * card.liftT);
        card.mesh.renderOrder = isPinned ? ORDER_PINNED : ORDER_LIFT;
        card.mat.depthTest = false;
        card.hoverable = false;
        if (isPinned) {
          card.mat.opacity = 1;
        } else {
          faceN.copy(faceRef).applyQuaternion(card.origQuat).applyQuaternion(spinQ);
          tmpN.copy(camera.position).normalize();
          const facing = faceN.dot(tmpN);
          const target =
            facing > 0.25 ? 1 : facing > 0 ? 0.1 + (facing / 0.25) * 0.9 : 0.1;
          const o = card.liftT + target * (1 - card.liftT);
          card.mat.opacity += 0.12 * (o - card.mat.opacity) * step;
        }
      } else {
        card._t += 0.1 * ((doLift ? 1 : 0) - card._t) * step;
        if (card._t > 0.001) {
          tmpQ.copy(camera.quaternion).premultiply(invSpinQ);
          card.mesh.quaternion.slerpQuaternions(card.origQuat, tmpQ, card._t);
        } else {
          card.mesh.quaternion.copy(card.origQuat);
        }
        const bob = bobPhase(elapsed + card.origPos.y * BOB_FREQ) * BOB_AMP;
        tmpV
          .copy(card.origPos)
          .addScaledVector(card.origDir, bob)
          .multiplyScalar(card.revealT);
        card.mesh.position.copy(tmpV);
        card.mesh.scale.setScalar(card.revealT);
        card.mesh.renderOrder = 0;
        card.mat.depthTest = true;
        faceN
          .copy(faceRef)
          .applyQuaternion(card.mesh.quaternion)
          .applyQuaternion(spinQ);
        tmpN.copy(camera.position).normalize();
        const facing = faceN.dot(tmpN);
        const target =
          (facing > 0.25 ? 1 : facing > 0 ? 0.1 + (facing / 0.25) * 0.9 : 0.1) *
          card.revealT;
        if (revealing) {
          card.mat.opacity = target;
          card.hoverable = false;
        } else {
          card.hoverable =
            facing > 0.05 && card.cooldown === 0 && globeState === "shown";
          card.mat.opacity += 0.1 * (target - card.mat.opacity) * step;
        }
      }
    }
    renderer.render(scene, camera);
  };

  const start = () => {
    if (raf === null) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
  const killReveal = () => {
    if (revealTween) {
      revealTween.kill();
      revealTween = null;
    }
  };

  // ---- data ----
  const db = scope.querySelector<HTMLElement>('[data-globe="database"]');
  const items = db
    ? Array.from(db.querySelectorAll<HTMLElement>('[data-globe="img"]'))
    : [];
  // Videos backing VideoTextures (muted inline playback, started on reveal).
  const cardVideos = new Set<HTMLVideoElement>();
  const playCardVideos = () => {
    cardVideos.forEach((v) => {
      try {
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {
        /* autoplay blocked — poster frame stays */
      }
    });
  };
  const pauseCardVideos = () => {
    cardVideos.forEach((v) => {
      try {
        v.muted = true;
        v.pause();
      } catch {
        /* noop */
      }
    });
  };
  if (db) {
    Object.assign(db.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      width: "0",
      height: "0",
      overflow: "hidden",
    } as CSSStyleDeclaration);
  }
  if (items.length) {
    const dirs = fibSphere(Math.ceil(2.5 * items.length))
      .filter((v) => Math.abs(v.y) < 0.55)
      .slice(0, items.length);
    items.forEach((item, idx) => {
      const dir = dirs[idx];
      if (!dir) return;
      const img = item.querySelector("img");
      const vid = item.querySelector("video");
      const slug = (
        item.getAttribute("data-works-database") ||
        img?.getAttribute("data-works-database") ||
        vid?.getAttribute("data-works-database") ||
        ""
      ).trim();
      if (vid && vid.getAttribute("src")) {
        // Videos only: the card is created once this video can play (see
        // loadVideoCard). Items without a playable video are skipped — the
        // sphere never shows still frames.
        queue.push((done) => loadVideoCard(vid, dir, slug, done, false, 0));
        return;
      }
      // No video backing this item — skip it (stills don't belong here).
    });
    pump();
  }

  // ---- observers / events ----
  const ro = new ResizeObserver(() => {
    const w = clientW();
    const h = clientH();
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  });
  ro.observe(wrapEl);
  fitCamera();

  const updatePointer = (cx: number, cy: number) => {
    const r = wrapEl.getBoundingClientRect();
    pointerNDC.x = ((cx - r.left) / r.width) * 2 - 1;
    pointerNDC.y = (-(cy - r.top) / r.height) * 2 + 1;
    hovering =
      cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  };
  const onMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
  const onLeave = () => {
    hovering = false;
    pointerNDC.set(-9, -9);
  };
  const onDown = (e: PointerEvent) => {
    dragging = true;
    dragMoved = false;
    lastX = e.clientX;
    dragVel = 0;
  };
  const onUp = () => {
    dragging = false;
  };
  const onDrag = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    if (dx !== 0 && pinned) resetView();
    if (Math.abs(dx) > 3) dragMoved = true;
    dragVel += dx * DRAG_K;
    dragVel = Math.max(-MAX_VEL, Math.min(MAX_VEL, dragVel));
    lastX = e.clientX;
  };
  const onClick = () => {
    if (dragMoved) return;
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(cardMeshes, false);
    const hit = hits.length
      ? (cards.find((c) => c.mesh === hits[0].object) ?? null)
      : null;
    if (hit && !hit.pinned) {
      unpin();
      hit.pinned = true;
      hit.cooldown = 0;
      pinned = hit;
      // The click is a user gesture, so the focused card may play WITH
      // sound. All sphere videos stay muted until pinned.
      if (hit.vid) {
        try {
          hit.vid.muted = false;
          hit.vid.volume = 1;
          const attempt = hit.vid.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(() => {
              try {
                hit.vid!.muted = true;
              } catch {
                /* stay muted */
              }
            });
          }
        } catch {
          /* stay muted */
        }
      }
      showInfo(hit.slug);
    } else if (pinned) {
      resetView();
    }
  };
  const onScrollAway = () => {
    if (pinned) resetView();
  };
  wrapEl.addEventListener("pointermove", onMove);
  wrapEl.addEventListener("pointerleave", onLeave);
  wrapEl.addEventListener("pointerdown", onDown);
  wrapEl.addEventListener("click", onClick);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointermove", onDrag);
  window.addEventListener("wheel", onScrollAway, { passive: true });
  window.addEventListener("touchmove", onScrollAway, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (reduced) continue;
        if (visible) start();
        else if (globeState === "shown" || globeState === "hidden" || globeState === "initial") stop();
      }
    },
    { threshold: 0 },
  );
  io.observe(wrapEl);

  el._globeAnimate = (mode, delay, done) => {
    if (mode === "initial") {
      killReveal();
      resetView();
      cards.forEach((c) => {
        c.revealT = 0;
        c.mesh.visible = false;
        c.mesh.scale.setScalar(0);
        c.mat.opacity = 0;
        c.hoverable = false;
      });
      globeState = "initial";
      try {
        renderer.render(scene, camera);
      } catch {
        /* noop */
      }
      done?.();
    } else if (mode === "reveal") {
      killReveal();
      globeState = "revealing";
      playCardVideos();
      const w = clientW();
      const h = clientH();
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        fitCamera();
      }
      if (!reduced) start();
      const order = cards
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .map((i) => cards[i]);
      order.forEach((c) => {
        c.mesh.visible = true;
        c.revealT = 0;
      });
      if (reduced) {
        order.forEach((c) => {
          c.revealT = 1;
        });
        try {
          renderer.render(scene, camera);
        } catch {
          /* noop */
        }
        globeState = "shown";
        done?.();
        return;
      }
      revealTween =
        order.length === 0
          ? gsap.delayedCall(REVEAL_DUR + (delay ?? 0), () => {
              globeState = "shown";
              revealTween = null;
              done?.();
            })
          : gsap.to(order, {
              revealT: 1,
              duration: REVEAL_DUR,
              delay: delay ?? 0,
              ease: "power2.out",
              stagger: REVEAL_STAG,
              overwrite: true,
              onComplete: () => {
                globeState = "shown";
                revealTween = null;
                done?.();
              },
            });
    } else {
      killReveal();
      resetView();
      pauseCardVideos();
      globeState = "hiding";
      if (!reduced) start();
      const order = cards
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .map((i) => cards[i]);
      if (order.length === 0) {
        globeState = "hidden";
        done?.();
        return;
      }
      revealTween = gsap.to(order, {
        revealT: 0,
        duration: HIDE_DUR,
        delay: delay ?? 0,
        ease: "power2.in",
        stagger: HIDE_STAG,
        overwrite: true,
        onComplete: () => {
          globeState = "hidden";
          order.forEach((c) => {
            c.mesh.visible = false;
          });
          revealTween = null;
          try {
            renderer.render(scene, camera);
          } catch {
            /* noop */
          }
          if (!visible) stop();
          done?.();
        },
      });
    }
  };

  el._globeGetDuration = (mode, delay) => {
    const d = delay ?? 0;
    const n = Math.max(0, items.length - 1);
    if (mode === "reveal") return d + REVEAL_DUR + REVEAL_STAG * n;
    if (mode === "hide") return d + HIDE_DUR + HIDE_STAG * n;
    return 0;
  };

  globeState = "initial";
  if (reduced) {
    // One static frame; textures resolve async and repaint once loaded.
    try {
      renderer.render(scene, camera);
    } catch {
      /* noop */
    }
    const repaint = setInterval(() => {
      if (cards.length && cards.every((c) => c.revealT === 1)) {
        clearInterval(repaint);
        return;
      }
      cards.forEach((c) => {
        c.revealT = 1;
        c.mesh.visible = true;
      });
      try {
        renderer.render(scene, camera);
      } catch {
        /* noop */
      }
      if (cards.length) {
        globeState = "shown";
        clearInterval(repaint);
      }
    }, 500);
    el._globeDestroy = () => {
      clearInterval(repaint);
      teardown();
    };
  } else {
    start();
    el._globeDestroy = teardown;
  }

  function teardown() {
    tornDown = true;
    killReveal();
    stop();
    pauseCardVideos();
    cardVideos.clear();
    io.disconnect();
    ro.disconnect();
    queue.length = 0;
    hideInfo();
    wrapEl.style.cursor = "";
    wrapEl.removeEventListener("pointermove", onMove);
    wrapEl.removeEventListener("pointerleave", onLeave);
    wrapEl.removeEventListener("pointerdown", onDown);
    wrapEl.removeEventListener("click", onClick);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointermove", onDrag);
    window.removeEventListener("wheel", onScrollAway);
    window.removeEventListener("touchmove", onScrollAway);
    for (const card of cards) {
      card.mesh.geometry.dispose();
      card.mat.map?.dispose();
      card.mat.dispose();
    }
    cards.length = 0;
    renderer.dispose();
    if (renderer.domElement.parentNode === wrapEl) {
      wrapEl.removeChild(renderer.domElement);
    }
    el._globeAnimate = undefined;
    el._globeGetDuration = undefined;
    el._globeDestroy = undefined;
    el._globeEnsureInit = null;
    tracked.delete(el);
  }
}

export function initGlobe(scope: ParentNode = document): Cleanup {
  if (typeof window === "undefined") return () => {};
  // Legacy parity: no globe on mobile (the mobile featured carousel
  // replaces it); initGlobeReal is desktop-only.
  if (window.matchMedia("(max-width: 991px)").matches) return () => {};
  // Pages with filter tabs (work) drive the globe via tab switches:
  // the globe content starts hidden, so reveal on first intersection
  // (fires when the Sphere tab shows it in the viewport). Elsewhere the
  // globe reveals when it nears the viewport.
  const hasTabs =
    typeof scope.querySelector === "function" &&
    !!scope.querySelector("[data-filter-tab]");
  const cleanups: Cleanup[] = [];
  qa<GlobeHost>('[data-globe="wrap"]', scope).forEach((host) => {
    if (tracked.has(host)) return;
    tracked.add(host);
    try {
      initGlobeReal(host, scope);
    } catch {
      tracked.delete(host);
      return;
    }
    if (hasTabs) {
      // Tab-driven globe: hidden until its filter tab is selected.
      // IntersectionObserver re-evaluates on display changes, so this
      // reveals exactly when the tab shows it inside the viewport.
      let tabFired = false;
      const tabIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !tabFired) {
              tabFired = true;
              tabIo.disconnect();
              requestAnimationFrame(() => {
                try {
                  host._globeAnimate?.("reveal", 0);
                } catch {
                  /* noop */
                }
              });
            }
          }
        },
        { threshold: 0 },
      );
      tabIo.observe(host);
      cleanups.push(() => {
        try {
          tabIo.disconnect();
        } catch {
          /* noop */
        }
      });
      return;
    }
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired) {
            fired = true;
            io.disconnect();
            requestAnimationFrame(() => {
              try {
                host._globeAnimate?.("reveal", 0);
              } catch {
                /* noop */
              }
            });
          }
        }
      },
      { rootMargin: "50% 0% 50% 0%" },
    );
    io.observe(host);
    cleanups.push(() => {
      try {
        io.disconnect();
      } catch {
        /* noop */
      }
    });
  });
  return () => {
    for (const fn of cleanups) {
      try {
        fn();
      } catch {
        /* noop */
      }
    }
    destroyGlobe(scope);
  };
}

export function destroyGlobe(scope: ParentNode = document): void {
  qa<GlobeHost>('[data-globe="wrap"]', scope).forEach((host) => {
    host._globeDestroy?.();
  });
}