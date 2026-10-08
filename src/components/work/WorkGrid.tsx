"use client";

import { useCallback, useState } from "react";
import { projects, projectAspect, type Project } from "@/data/projects";
import VideoLightbox from "@/components/work/VideoLightbox";

export default function WorkGrid() {
  const [active, setActive] = useState<Project | null>(null);
  const closeLightbox = useCallback(() => setActive(null), []);

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
              {projects.map((project) => {
                // Bento tile: the frame takes the source's native shape —
                // 9:16 clips render tall, 16:9 clips render wide.
                const landscape = projectAspect(project) === "16:9";
                return (
                <div
                  key={project.slug}
                  data-haptic="medium"
                  data-works-item="wrap"
                  data-tab-content-reval="item"
                  role="listitem"
                  className={`works-item works-bento-item${landscape ? " is-landscape" : " is-portrait"}`}
                  data-aspect={landscape ? "16:9" : "9:16"}
                >
                  <a
                    className="works-item-link-overlay w-inline-block"
                    href="#work"
                    aria-label={`${project.title} — play video`}
                    onClick={(e) => openPlayer(e, project)}
                  ></a>
                  <div className="works-item-image-wrap">
                    <div
                      className="works-item-image-inner"
                      style={{
                        aspectRatio: landscape ? "16 / 9" : "9 / 16",
                      }}
                    >
                      {/* Still frame only — the video runs in the lightbox
                          once opened (tap anywhere on the tile). */}
                      <img
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        src={project.coverImage}
                        className="img is-cover-works"
                      />
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
                );
              })}
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
