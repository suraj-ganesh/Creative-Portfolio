"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";
import { mediaUrl } from "@/lib/media";

/**
 * Fullscreen video lightbox for the Work section. Opens on card press,
 * autoplays with sound (the press counts as the user gesture), locks
 * page scroll while open, and closes on backdrop click / Escape / button.
 */
export default function VideoLightbox({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    lenisStop();
    document.body.style.overflow = "hidden";
    // The card press that opened the lightbox counts as the user gesture,
    // so the player starts WITH sound. Bare `autoPlay` is often blocked
    // once React re-renders off the gesture thread, so kick playback
    // explicitly and guarantee the element is unmuted. If the browser
    // still blocks it, the rejection is swallowed and the visible
    // controls let one tap start it with audio.
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = false;
        video.volume = 1;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {});
        }
      } catch {
        /* controls remain as fallback */
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenisStart();
    };
  }, [onClose]);

  if (!project.videoSrc) return null;

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
              padding: "6px 18px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
        <video
          ref={videoRef}
          key={project.videoSrc}
          src={mediaUrl(project.videoSrc)}
          controls
          autoPlay
          muted={false}
          playsInline
          preload="auto"
          style={{
            width: "100%",
            maxHeight: "76vh",
            background: "#000",
            display: "block",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            marginTop: 12,
          }}
        >
          <div className="p1" style={{ color: "rgba(255,255,255,0.65)" }}>
            Video Editing · Sound Design · Color Correction
          </div>
        </div>
      </div>
    </div>
  );
}
