/**
 * Video URL resolution, in priority order:
 *
 * 1. CLOUD_URLS — exact local-path -> Cloudinary delivery URL map
 *    (cloud public_ids normalize spaces/parens/BOM, so a lookup table
 *    is the only exact approach). Active immediately, no env needed.
 * 2. Local /Videos path as-is (dev / prod-server) — same origin, no tracking
 *    prevention issues, works offline. Used as fallback when Cloudinary
 *    fails or was previously blocked.
 * 3. NEXT_PUBLIC_MEDIA_BASE prefix — for future uploads that follow the
 *    clean pattern, e.g.
 *      NEXT_PUBLIC_MEDIA_BASE=https://res.cloudinary.com/<cloud>/video/upload/<folder>
 *
 * Posters stay in the repo (tiny) and bypass this helper.
 */
import { CLOUD_URLS } from "@/data/cloudUrls";

const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");

/** Mark Cloudinary as blocked for this session so subsequent videos use local */
export function markCloudinaryBlocked(): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("cloudinary-blocked", "true");
    } catch {
      /* ignore */
    }
  }
}

/**
 * Mobile connection / device detection (client-only).
 * True for small viewports, touch-coarse pointers, Save-Data, or 2g/3g.
 */
export function isMobileConnection(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  try {
    if (window.matchMedia("(max-width: 991px)").matches) return true;
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection;
    if (conn?.saveData) return true;
    if (conn?.effectiveType && /2g|3g|slow/.test(conn.effectiveType))
      return true;
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Inject Cloudinary delivery transformations into a
 * `.../video/upload/<public_id>` URL.
 * e.g. f_auto,q_auto,w_480,vc_h264,br_700k + streaming profile.
 * Non-Cloudinary URLs pass through untouched.
 */
function injectCloudinaryTransform(url: string, transform: string): string {
  const marker = "/video/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  // Detect only an anchored transform segment; public IDs can contain w_.
  const after = url.slice(i + marker.length);
  const token = "[a-z]+_[a-z0-9:.-]+";
  const alreadyTransformed = new RegExp(
    `^(?:${token})(?:,${token})*/`,
    "i",
  ).test(after);
  if (alreadyTransformed) return url;
  return `${url.slice(0, i + marker.length)}${transform}/${after}`;
}

/** Compressed mobile rendition: 480p cap, auto format/quality, capped bitrate. */
export const MOBILE_VIDEO_TRANSFORM = "f_auto,q_auto,w_480,vc_h264,br_700k";
/** Desktop rendition: still compressed vs raw upload, 720p cap. */
export const DESKTOP_VIDEO_TRANSFORM = "f_auto,q_auto,w_720,vc_h264,br_1500k";

const POSTER_SIZES: Record<string, { width: number; height: number }> = {
  "BuddhaJayantiClassmate.webp": { width: 1080, height: 1350 },
  "BuddhaJayantiPaperflies.webp": { width: 1080, height: 1350 },
  "CardDesign.webp": { width: 895, height: 1234 },
  "ChhathFinal.webp": { width: 1080, height: 1350 },
  "Dashain1.webp": { width: 1080, height: 1350 },
  "Dashain2.webp": { width: 1080, height: 1350 },
  "Final_Tihar.webp": { width: 1080, height: 1350 },
  "Fulpati.webp": { width: 1080, height: 1350 },
  "LeapBoard1.webp": { width: 1153, height: 1440 },
  "LeapBoard2.webp": { width: 1153, height: 1440 },
  "LeapBoard3.webp": { width: 1153, height: 1440 },
  "LeapBoard4.webp": { width: 1153, height: 1440 },
  "LeapBoard5.webp": { width: 1153, height: 1440 },
  "NewYearClassmate.webp": { width: 1080, height: 1350 },
  "NewYearPaperflies.webp": { width: 1080, height: 1350 },
  "TiharChattGreetingCard.webp": { width: 2480, height: 1653 },
};

export function coverSize(
  src: string,
  aspect: string = "3:4",
): { width: number; height: number } {
  const name = src.split("/").pop() ?? "";
  const exact = POSTER_SIZES[name];
  if (exact) return exact;
  if (/16\s*\/\s*9|16:9/.test(aspect)) return { width: 1920, height: 1080 };
  if (/9\s*\/\s*16|9:16/.test(aspect)) return { width: 1080, height: 1920 };
  return { width: 1080, height: 1440 };
}

export interface MediaUrlOptions {
  /** Force mobile rendition. Defaults to auto-detect via isMobileConnection(). */
  mobile?: boolean;
  /** Override transform string entirely. */
  transform?: string;
}

/** Mapped Cloudinary URL with no transformations (fallback when a
 *  transformed rendition fails), or the local path as-is. */
export function rawMediaUrl(
  path: string | undefined,
): string | undefined {
  if (!path) return path;
  const mapped = CLOUD_URLS[path];
  if (mapped) return mapped;
  if (!BASE) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function mediaUrl(
  path: string | undefined,
  opts?: MediaUrlOptions,
): string | undefined {
  if (!path) return path;
  const mapped = CLOUD_URLS[path];
  if (mapped) {
    // Cloudinary delivery URL — compress via fetch-time transformation.
    // Mobile gets a 480p capped rendition (~70-80% smaller than raw).
    const wantMobile = opts?.mobile ?? isMobileConnection();
    const t =
      opts?.transform ?? (wantMobile ? MOBILE_VIDEO_TRANSFORM : DESKTOP_VIDEO_TRANSFORM);
    // .mov sources can't play inline on many Android browsers — ask
    // Cloudinary for an mp4 rendition via f_auto instead of raw .mov.
    return injectCloudinaryTransform(mapped, t);
  }
  if (!BASE) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    // Already-absolute Cloudinary URL (not via lookup table) — same treatment.
    if (path.includes("res.cloudinary.com") && path.includes("/video/upload/")) {
      const wantMobile = opts?.mobile ?? isMobileConnection();
      const t =
        opts?.transform ??
        (wantMobile ? MOBILE_VIDEO_TRANSFORM : DESKTOP_VIDEO_TRANSFORM);
      return injectCloudinaryTransform(path, t);
    }
    return path;
  }
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
