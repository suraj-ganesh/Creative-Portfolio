"use client";

import { useState, useCallback } from "react";
import { projects, projectAspect } from "@/data/projects";
import VideoLightbox from "@/components/work/VideoLightbox";

export default function WorkLite() {
  const [active, setActive] = useState<typeof projects[0] | null>(null);
  const closeLightbox = useCallback(() => setActive(null), []);

  const openPlayer = (e: React.MouseEvent, project: typeof projects[0]) => {
    e.preventDefault();
    if (!project.videoSrc) return;
    setActive(project);
  };

  return (
    <section className="works work-lite">
      <div className="works-inner">
        <div className="works-heading">
          <div className="w-layout-grid grid">
            <h1 className="h1">Work</h1>
          </div>
        </div>

        <div id="work" className="works-wrap">
          <div className="works-list-wrap">
            <div role="list" className="work-lite-list">
              {projects.map((project) => {
                const landscape = projectAspect(project) === "16:9";
                return (
                  <div
                    key={project.slug}
                    role="listitem"
                    className={`work-lite-item${landscape ? " is-landscape" : " is-portrait"}`}
                    data-aspect={landscape ? "16:9" : "9:16"}
                  >
                    <a
                      className="work-lite-item-link"
                      href="#work"
                      aria-label={`${project.title} — play video`}
                      onClick={(e) => openPlayer(e, project)}
                    ></a>
                    <div className="work-lite-item-image-wrap">
                      <div
                        className="work-lite-item-image-inner"
                        style={{
                          aspectRatio: landscape ? "16 / 9" : "9 / 16",
                        }}
                      >
                        <img
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          src={project.coverImage}
                          className="img"
                        />
                      </div>
                    </div>
                    <div className="work-lite-item-meta">
                      <div className="p1">{project.title}</div>
                    </div>
                    <div className="work-lite-item-button">
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

        <div className="works-outro">
          <div className="p1">
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