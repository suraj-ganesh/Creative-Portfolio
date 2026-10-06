"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { lenisStart, lenisStop } from "@/lib/fx/lenis";
import { downloadCvPdf } from "@/lib/cvPdf";
import { cv } from "@/data/cv";
import CvDocument from "@/components/cv/CvDocument";

/**
 * CV popup (view mode): fullscreen overlay with the CV sheet, the CV
 * title on the left and a Download button pinned to the top right that
 * saves the CV as a PDF file directly (plus Close). Closes on backdrop
 * click / Escape, locks page scroll while open.
 */
export default function CvModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lenisStop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenisStart();
    };
  }, [onClose]);

  const download = useCallback(() => {
    try {
      downloadCvPdf();
    } catch (err) {
      console.error("[cv] download failed:", err);
    }
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${cv.name} — CV`}
      className="cv-modal"
      onClick={onClose}
    >
      <div className="cv-modal__backdrop" aria-hidden="true" />
      <div className="cv-modal__scroll" onClick={(e) => e.stopPropagation()}>
        <div className="cv-modal__toolbar">
          <span className="cv-modal__title p1">{cv.name} — CV</span>
          <div className="cv-modal__actions">
            <button
              type="button"
              onClick={download}
              className="cv-modal__btn p1"
            >
              <svg
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16" />
              </svg>
              Download
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close CV"
              className="cv-modal__btn is-ghost p1"
            >
              Close
            </button>
          </div>
        </div>
        <div className="cv-modal__sheet">
          <CvDocument />
        </div>
      </div>
    </div>,
    document.body,
  );
}
