"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { projects, projectAspect, type Project } from "@/data/projects";
import { coverSize } from "@/lib/media";
import VideoLightbox from "@/components/work/VideoLightbox";
import ImageLightbox from "@/components/work/ImageLightbox";

const POSTER_ASPECT = "3:4";

function getMediaType(project: Project): "video" | "poster" {
  if (project.mediaType) return project.mediaType;
  return project.videoSrc ? "video" : "poster";
}

function getPosterServices(): string[] {
  return ["Graphic Poster", "Figma", "Photoshop"];
}

export default function WorkGrid() {
  const [active, setActive] = useState<Project | null>(null);
  const closeLightbox = useCallback(() => setActive(null), []);

  const openViewer = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    setActive(project);
  };

  const renderTile = (project: Project, index: number) => {
    const landscape = projectAspect(project) === "16:9";
    const isPoster = getMediaType(project) === "poster";
    const aspectRatio = isPoster ? POSTER_ASPECT : (landscape ? "16 / 9" : "9 / 16");
    const size = coverSize(project.coverImage, aspectRatio);
    return (
      <div
        key={project.slug}
        data-haptic="medium"
        data-works-item="wrap"
        data-tab-content-reval="item"
        role="listitem"
        className={`works-item works-bento-item${landscape ? " is-landscape" : " is-portrait"} ${isPoster ? " is-poster" : ""}`}
        data-aspect={isPoster ? POSTER_ASPECT : (landscape ? "16:9" : "9:16")}
      >
        <a
          className="works-item-link-overlay w-inline-block"
          href="#work"
          aria-label={`${project.title} — ${getMediaType(project)}`}
          onClick={(e) => openViewer(e, project)}
        ></a>
        <div className="works-item-image-wrap">
          <div
            className="works-item-image-inner"
            style={{
              aspectRatio: aspectRatio,
            }}
          >
            <div className={`works-item-type-badge ${getMediaType(project)}`}>
              {getMediaType(project)}
            </div>
            <Image
              alt={project.title}
              width={size.width}
              height={size.height}
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 991px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
            aria-label={`${project.title} — ${getMediaType(project)}`}
            style={{ cursor: "pointer" }}
            onClick={(e) => openViewer(e, project)}
          >
            <div className="link-inner">
              <div data-link="label" className="p1">
                {getMediaType(project) === "video" ? "Play" : "View"}
              </div>
              <div data-link="shadow" className="p1 is-2">
                {getMediaType(project) === "video" ? "Play" : "View"}
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="works">
      <div className="works-overlay">
        <div className="w-layout-grid grid">
          <div
            data-works-intro="left-text"
            id="w-node-_2a6f1581-6773-0695-794b-998a67dcf734-3f92bac2"
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
        <div data-works-cue="" className="works-scroll-cue">
          <div data-reveal="text" className="p1">
            Scroll down to view
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
              {projects.map((project, index) => renderTile(project, index))}
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
      {active && getMediaType(active) === "poster" && !active.videoSrc && (
        <ImageLightbox 
          project={active} 
          onClose={closeLightbox} 
          services={getPosterServices()}
        />
      )}
    </section>
  );
}