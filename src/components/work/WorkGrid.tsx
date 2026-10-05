"use client";

import { useCallback, useEffect, useState } from "react";
import { projects, type Project } from "@/data/projects";
import VideoLightbox from "@/components/work/VideoLightbox";
import { mediaUrl } from "@/lib/media";

function playPreview(wrap: HTMLElement | null) {
  const video = wrap?.querySelector<HTMLVideoElement>("video");
  if (!video || !video.paused) return;
  video.muted = true;
  const attempt = video.play();
  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {});
  }
}

function pausePreview(wrap: HTMLElement | null) {
  const video = wrap?.querySelector<HTMLVideoElement>("video");
  if (video && !video.paused) {
    try {
      video.pause();
    } catch {
      /* noop */
    }
  }
}

export default function WorkGrid() {
  const [active, setActive] = useState<Project | null>(null);
  const closeLightbox = useCallback(() => setActive(null), []);

  // Pause card previews hidden by the Cards/Sphere filter so background
  // tabs never decode video needlessly.
  useEffect(() => {
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-filter-content]"),
    );
    if (!containers.length) return;
    const pauseHidden = () => {
      containers.forEach((c) => {
        if (c.style.display === "none") {
          c.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
            try {
              v.pause();
            } catch {
              /* noop */
            }
          });
        }
      });
    };
    const observer = new MutationObserver(pauseHidden);
    containers.forEach((c) =>
      observer.observe(c, { attributes: true, attributeFilter: ["style"] }),
    );
    return () => observer.disconnect();
  }, []);

  const openPlayer = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    if (!project.videoSrc) return;
    setActive(project);
  };

  return (
    <section className="works">
      <div className="works-overlay">
        <div className="w-layout-grid grid">
          <div
            data-works-intro="left-text"
            id="w-node-_2a6e3a7d-342a-8d2a-0e57-4d7a32689e44-3f92bac2"
            className="works-overlay-left"
          >
            <div data-reveal="text" className="h1">
              24
            </div>
          </div>
          <div
            data-works-intro="right-text"
            id="w-node-_34b20363-0eda-8a41-aac3-028c52b704bd-3f92bac2"
            className="works-overlay-right"
          >
            <div data-reveal="text" className="h1">
              26
            </div>
          </div>
        </div>
      </div>

      <div className="works-inner">
        <div className="works-heading">
          <div data-works-intro="trigger" className="w-layout-grid grid">
            <h1
              data-reveal="text"
              id="w-node-_33ed6a2b-8baa-d944-4323-76aa60eabf0e-3f92bac2"
              className="h1"
            >
              Work
            </h1>
            <div
              data-reveal="w"
              id="w-node-_018fa649-3599-6827-e480-d4f6b10cfd8d-3f92bac2"
              className="works-view"
            >
              <a
                data-filter-tab="cards"
                href="#work"
                className="filter-tab w-inline-block"
              >
                <div data-reveal="div" className="link-inner">
                  <div data-link="label" className="p1">
                    Cards
                  </div>
                  <div
                    data-link="shadow"
                    data-filter-tab="cards"
                    className="p1 is-2"
                  >
                    Cards
                  </div>
                </div>
              </a>
              <div data-reveal="div" className="p1 is-secondary">
                /
              </div>
              <a
                data-filter-tab="globe"
                href="#work"
                className="filter-tab w-inline-block"
              >
                <div data-reveal="div" className="link-inner">
                  <div data-link="label" className="p1">
                    Sphere
                  </div>
                  <div
                    data-link="shadow"
                    data-filter-tab="globe"
                    className="p1 is-2"
                  >
                    Sphere
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div id="work" className="works-wrap">
          <div
            data-filter-content="cards"
            className="works-list-wrap w-dyn-list"
          >
            <div
              data-tab-content-reval="list"
              role="list"
              className="works-list w-dyn-items"
            >
              {projects.map((project) => (
                <div
                  key={project.slug}
                  data-haptic="medium"
                  data-works-item="wrap"
                  data-tab-content-reval="item"
                  data-tilt="wrap"
                  id="w-node-_019a10b8-2b38-475b-0c97-40a12d4b0193-3f92bac2"
                  role="listitem"
                  className="works-item w-dyn-item"
                  onMouseEnter={(e) => playPreview(e.currentTarget)}
                  onMouseLeave={(e) => pausePreview(e.currentTarget)}
                >
                  <a
                    className="works-item-link-overlay w-inline-block"
                    href="#work"
                    aria-label={`${project.title} — play video`}
                    onClick={(e) => openPlayer(e, project)}
                  ></a>
                  <div className="works-item-image-wrap" data-tilt="card">
                    <div className="works-item-image-inner">
                      {project.videoSrc ? (
                        <video
                          src={mediaUrl(project.videoSrc)}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label={project.title}
                          className="img is-cover-works"
                          style={{
                            objectFit: "contain",
                            height: "100%",
                            width: "100%",
                            background: "#000",
                          }}
                        />
                      ) : (
                        <img
                          alt={project.title}
                          loading="lazy"
                          src={project.coverImage}
                          className="img is-cover-works"
                        />
                      )}
                    </div>
                  </div>
                  <div className="works-item-meta">
                    <div className="p1">{project.title}</div>
                  </div>
                  <div className="works-item-button" data-works-item="button">
                    <button
                      type="button"
                      className="button w-inline-block"
                      aria-label={`${project.title} — play video`}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => openPlayer(e, project)}
                    >
                      <div className="link-inner">
                        <div data-link="label" className="p1">
                          Play
                        </div>
                        <div data-link="shadow" className="p1 is-2">
                          Play
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-filter-content="globe" className="works-globe-wrap">
            <div className="works-globe-inner">
              <div className="works-globe-info">
                <div className="works-globe-info-inner">
                  <div className="works-globe-info-list-wrap w-dyn-list">
                    <div
                      role="list"
                      className="works-globe-info-list w-dyn-items"
                    >
                      {projects.map((project) => (
                        <div
                          key={project.slug}
                          data-works-info={project.slug}
                          role="listitem"
                          className="works-globe-info-ltem w-dyn-item"
                        >
                          <div className="w-layout-grid grid">
                            <div
                              id="w-node-_72e5e985-1a86-dcb2-f1cc-0b1790b33bf1-3f92bac2"
                              className="p1"
                            >
                              {project.title}
                            </div>
                            <div
                              data-works=""
                              id="w-node-_1efd63bf-0ff7-8abe-8ecd-b416fa7ca86c-3f92bac2"
                              className="work-services"
                            >
                              <div className="work-services-list-wrap w-dyn-list">
                                <div
                                  data-cut="list"
                                  role="list"
                                  className="works-services-list w-dyn-items"
                                >
                                  {(project.services ?? []).map((s) => (
                                    <div
                                      key={s}
                                      data-cut="item"
                                      role="listitem"
                                      className="works-services-item w-dyn-item"
                                    >
                                      <div className="p1">{s}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div
                                data-cut="counter"
                                className="p1 is-cut-counter"
                              >
                                +0
                              </div>
                            </div>
                            {project.videoSrc && (
                              <button
                                type="button"
                                onClick={() => setActive(project)}
                                aria-label={`${project.title} — play video with sound`}
                                className="button is-on-bg w-inline-block"
                                style={{ cursor: "pointer", marginTop: 8 }}
                              >
                                <div className="link-inner">
                                  <div data-link="label" className="p1">
                                    Play with sound
                                  </div>
                                  <div data-link="shadow" className="p1 is-2">
                                    Play with sound
                                  </div>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                data-tab-content-reval="globe"
                data-featured="globe"
                data-globe="wrap"
                className="works-globe"
              >
                <div className="globe-database-wrap w-dyn-list">
                  <div
                    data-globe="database"
                    role="list"
                    className="globe-database w-dyn-items"
                  >
                    {projects.map((p) => (
                      <div
                        key={p.slug}
                        data-works-database={p.slug}
                        data-globe="img"
                        role="listitem"
                        className="globe-database-item w-dyn-item"
                      >
                        {p.videoSrc && (
                          <video
                            src={mediaUrl(p.videoSrc)}
                            poster={p.coverImage}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            crossOrigin="anonymous"
                          />
                        )}
                        <img
                          src={p.coverImage}
                          loading="lazy"
                          alt={p.title}
                          height={1024}
                          className="img"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-works-intro="out" className="works-outro">
          <div data-reveal="text" className="p1">
            Cut with patience, graded with obsession, and mixed until it feels
            inevitable.
          </div>
        </div>
      </div>

      {active && active.videoSrc && (
        <VideoLightbox project={active} onClose={closeLightbox} />
      )}
    </section>
  );
}
