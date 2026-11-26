"use client";

import { useEffect } from "react";
import type { Project } from "@/data/projects";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";

interface ImageLightboxProps {
  project: Project;
  onClose: () => void;
  services?: string[];
}

export default function ImageLightbox({
  project,
  onClose,
  services,
}: ImageLightboxProps) {
  useEffect(() => {
    lenisStop();
    document.body.style.overflow = "hidden";
    document.body.classList.add("is-lightbox-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("is-lightbox-open");
      lenisStart();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — image viewer`}
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
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
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
            aria-label="Close viewer"
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
        <img
          src={project.coverImage}
          alt={project.title}
          style={{
            maxWidth: "100%",
            maxHeight: "76vh",
            background: "#000",
            display: "block",
            objectFit: "contain",
          }}
        />
        {services && services.length > 0 && (
          <div
            style={{
              marginTop: 12,
            }}
          >
            <div className="p1" style={{ color: "rgba(255,255,255,0.65)" }}>
              {services.join(" · ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}