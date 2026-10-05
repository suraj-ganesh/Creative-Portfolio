/**
 * Media host base. Local dev / prod-server serves /Videos from public/,
 * so the default (empty base) keeps current behavior byte-for-byte.
 *
 * For hosted deploys (Vercel), videos can't live in git or the deploy
 * bundle (size limits) — point NEXT_PUBLIC_MEDIA_BASE at a CDN and every
 * video URL follows automatically, e.g. Cloudinary:
 *
 *   NEXT_PUBLIC_MEDIA_BASE=https://res.cloudinary.com/<cloud-name>/video/upload/<folder>
 *
 * Filenames (incl. %20-encoding) are preserved, so upload with original
 * names. Posters stay in the repo (tiny) and bypass this helper.
 */
const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");

export function mediaUrl(path: string | undefined): string | undefined {
  if (!path || !BASE) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
