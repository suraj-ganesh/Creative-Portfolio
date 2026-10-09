"use client";

import { useEffect, useState } from "react";
import { projects } from "@/data/projects";
import { mediaUrl, rawMediaUrl, MOBILE_VIDEO_TRANSFORM } from "@/lib/media";

export default function FeaturedWork() {
  // Work-only projects (hideFromHome) never appear on the home page.
  const globeProjects = projects.filter((p) => p.coverImage && !p.hideFromHome);
  // The globe's <video> nodes render unconditionally (preload="none" so
  // they never fetch until the globe engine explicitly load()s them).
  // They MUST be present on first paint: the globe scans its database once
  // at init, and items without a playable video are skipped permanently —
  // gating these nodes behind a post-mount desktop check used to race the
  // globe init on SPA navigations back home, leaving an empty sphere.
  // Cost on phones is ~zero: the globe engine never runs there, the loader
  // ignores preload="none" videos, and the database wrap is display:none.
  // isDesktop below only tunes the (non-critical) img loading attribute.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      {/* Desktop Featured 3D Globe Section */}
      <section className="featured">
        <div className="featured-inner">
          <div data-featured="heading" className="featured-heading-wrap">
            <div data-featured="text" data-reveal="text" className="h1">
              Work
            </div>
            <div data-featured="text" data-reveal="text" className="h1">
              24-26
            </div>
            <div data-featured="link" className="featured-link-wrap">
              <a
                data-haptic="medium"
                data-underline="wrap"
                href="/work"
                className="link w-inline-block"
              >
                <div data-underline="text" className="h1">
                  All Works
                </div>
              </a>
            </div>
          </div>

          <div
            data-globe="wrap"
            data-featured="globe"
            className="featured-globe"
          >
            <div className="globe-database-wrap w-dyn-list">
              <div
                data-globe="database"
                role="list"
                className="globe-database w-dyn-items"
              >
                {globeProjects.map((p, idx) => (
                  <div
                    key={p.slug || idx}
                    data-globe="img"
                    role="listitem"
                    className="globe-database-item w-dyn-item"
                  >
                    {p.videoSrc && (
                      <video
                        src={mediaUrl(p.videoSrc, {
                          transform: MOBILE_VIDEO_TRANSFORM,
                        })}
                        data-raw={rawMediaUrl(p.videoSrc)}
                        poster={p.coverImage}
                        muted
                        loop
                        playsInline
                        preload="none"
                        crossOrigin="anonymous"
                      />
                    )}
                    <img
                      src={p.coverImage}
                      loading={isDesktop ? "eager" : "lazy"}
                      decoding="async"
                      alt={p.title}
                      className="img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Featured Carousel */}
      <section m-data-featured="wrap" className="m-featured is-mobile">
        <div className="m-featured-inner">
          <div m-data-featured="heading" className="m-featured-heading-wrap">
            <div m-data-featured="text" data-reveal="text" className="h1">
              Work
            </div>
            <div m-data-featured="text" data-reveal="text" className="h1">
              24-26
            </div>
            <div m-data-featured="link" className="m-featured-link-wrap">
              <a
                data-haptic="medium"
                data-underline="wrap"
                href="/work"
                className="link w-inline-block"
              >
                <div data-underline="text" className="h1">
                  All Works
                </div>
              </a>
            </div>
          </div>

          <div className="div-block-9">
            <div
              m-data-featured="list"
              className="collection-list-wrapper-2 w-dyn-list"
            >
              <div role="list" className="collection-list-2 w-dyn-items">
                {globeProjects.map((p, idx) => (
                  <div
                    key={p.slug || idx}
                    role="listitem"
                    className="collection-item-2 w-dyn-item"
                  >
                    <img
                      src={p.coverImage}
                      loading={idx < 2 ? "eager" : "lazy"}
                      fetchPriority={idx < 2 ? "high" : "auto"}
                      decoding="async"
                      sizes="(max-width: 991px) 78vw, 25vw"
                      draggable={false}
                      alt={p.title}
                      className="img width-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
