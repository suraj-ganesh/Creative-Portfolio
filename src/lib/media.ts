/**
 * Video URL resolution, in priority order:
 *
 * 1. CLOUD_URLS — exact local-path -> Cloudinary delivery URL map
 *    (cloud public_ids normalize spaces/parens/BOM, so a lookup table
 *    is the only exact approach). Active immediately, no env needed.
 * 2. NEXT_PUBLIC_MEDIA_BASE prefix — for future uploads that follow the
 *    clean pattern, e.g.
 *      NEXT_PUBLIC_MEDIA_BASE=https://res.cloudinary.com/<cloud>/video/upload/<folder>
 * 3. Local /Videos path as-is (dev / prod-server).
 *
 * Posters stay in the repo (tiny) and bypass this helper.
 */
import { CLOUD_URLS } from "@/data/cloudUrls";

const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");

export function mediaUrl(path: string | undefined): string | undefined {
  if (!path) return path;
  const mapped = CLOUD_URLS[path];
  if (mapped) return mapped;
  if (!BASE) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
