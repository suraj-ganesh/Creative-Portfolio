"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { projectDescription } from "@/data/videoDescriptions";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";
import { mediaUrl, rawMediaUrl } from "@/lib/media";

/**
 * Fullscreen video lightbox for the Work section. Opens on card press,
 * locks page scroll while open, and closes on backdrop click / Escape /
 * button. Source chain: compressed rendition -> raw delivery URL -> local
 * file, advancing on error/stall so a single broken URL form can never
 * leave the player dark. Starts with sound (the press counts as the user
 * gesture); if the browser still blocks it, falls back to muted playback
 * so the video runs either way — unmute via the visible controls.
 */
export default function VideoLightbox({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState(0);
  const [dead, setDead] = useState(false);
  const sources = [
    mediaUrl(project.videoSrc),
    rawMediaUrl(project.videoSrc),
    project.videoSrc,
  ].filter((s): s is string => Boolean(s));

  // Reset the chain when a different project is opened in place.
  useEffect(() => {
    setStage(0);
    setDead(false);
  }, [project.videoSrc]);

  useEffect(() => {
    lenisStop();
    document.body.style.overflow = "hidden";
    // Fade the fixed chrome (Menu, lever, CV, scrollbar) behind the
    // 88%-opaque backdrop — otherwise it ghosts through the player.
    document.body.classList.add("is-lightbox-open");
    // Free decoders: pause the bento tiles behind the player.
    const tiles = Array.from(
      document.querySelectorAll<HTMLVideoElement>(".works-list video"),
    );
    tiles.forEach((t) => {
      try {
        t.pause();
      } catch {
        /* noop */
      }
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("is-lightbox-open");
      lenisStart();
      // Resume tiles visible behind the player on close.
      document
        .querySelectorAll<HTMLVideoElement>(".works-list video")
        .forEach((t) => {
          try {
            const r = t.getBoundingClientRect();
            if (r.bottom > 0 && r.top < window.innerHeight) {
              t.muted = true;
              const attempt = t.play();
              if (attempt && typeof attempt.catch === "function") {
                attempt.catch(() => {});
              }
            }
          } catch {
            /* tiles resume on next scroll either way */
          }
        });
    };
  }, [onClose]);

  // Drive playback per source stage: (re)load, try with sound first for
  // the gesture, fall back to muted so it always runs. Errors and stalls
  // advance to the next source.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || dead) return;
    const src = sources[stage];
    if (!src) {
      setDead(true);
      return;
    }
    let disposed = false;
    const playWithSound = () => {
      try {
        video.muted = false;
        video.volume = 1;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {
            // Blocked with sound — run muted instead; user unmutes via controls.
            if (disposed) return;
            try {
              video.muted = true;
              const retry = video.play();
              if (retry && typeof retry.catch === "function") {
                retry.catch(() => {});
              }
            } catch {
              /* controls remain as fallback */
            }
          });
        }
      } catch {
        /* controls remain as fallback */
      }
    };
    const onCanPlay = () => {
      window.clearTimeout(timer);
      playWithSound();
    };
    const onError = () => {
      window.clearTimeout(timer);
      if (!disposed) {
        if (stage + 1 < sources.length) setStage(stage + 1);
        else setDead(true);
      }
    };
    const timer = window.setTimeout(() => {
      // Stalled with no data — treat like an error.
      if (video.readyState < 2) onError();
    }, 25000);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    try {
      video.load();
    } catch {
      /* events settle the stage */
    }
    playWithSound();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [project.videoSrc, stage]);

  if (!project.videoSrc) return null;
  const description = projectDescription(project.slug);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — video player`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        padding: "4vmin",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(1100px, 92vw)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div className="p1" style={{ color: "#fff" }}>
            {project.title}
          </div>
          <button
            onClick={onClose}
            aria-label="Close player"
            className="p1"
            style={{
              color: "#fff",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 999,
              padding: "12px 24px",
              cursor: "pointer",
              minHeight: "44px",
              minWidth: "44px",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Close
          </button>
        </div>
        {dead ? (
          <div
            style={{
              width: "100%",
              minHeight: "40vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
            }}
          >
            <div className="p1" style={{ color: "#fff" }}>
              This video failed to load — check your connection and try again.
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            key={project.videoSrc}
            src={sources[stage]}
            controls
            playsInline
            preload="auto"
            style={{
              width: "100%",
              maxHeight: "76vh",
              background: "#000",
              display: "block",
              objectFit: "contain",
              touchAction: "manipulation",
            }}
          />
        )}
        <div
          style={{
            marginTop: 12,
          }}
        >
          <div className="p1" style={{ color: "rgba(255,255,255,0.65)" }}>
            Video Editing · Sound Design · Color Correction
          </div>
          {description && (
            <div
              className="p1"
              style={{ color: "#fff", marginTop: 6, maxWidth: "60ch" }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
