"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import CvModal from "@/components/cv/CvModal";

/** Archive-box-with-CV-folders glyph for the fixed CV button, recreating
 *  the supplied reference artwork: white box front with handle slot, gray
 *  side face, and tabbed folders (white "CV" sheet front, manila + yellow
 *  behind) rising from the box. */
function ArchiveBoxIcon() {
  return (
    <svg
      viewBox="0 0 96 96"
      width="46"
      height="46"
      aria-hidden="true"
      className="cv-button__icon"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="84" rx="30" ry="4.5" fill="#000" opacity="0.4" />
      {/* back folders */}
      <g>
        <rect x="34" y="14" width="15" height="9" rx="3" fill="#f6e58d" stroke="#1c1c1e" strokeWidth="2" />
        <rect x="32" y="20" width="36" height="30" rx="2" fill="#f6e58d" stroke="#1c1c1e" strokeWidth="2" />
      </g>
      <g>
        <rect x="40" y="22" width="14" height="8" rx="3" fill="#b9bcc2" stroke="#1c1c1e" strokeWidth="2" />
        <rect x="38" y="27" width="32" height="27" rx="2" fill="#b9bcc2" stroke="#1c1c1e" strokeWidth="2" />
      </g>
      <g>
        <rect x="28" y="30" width="14" height="8" rx="3" fill="#fbf6e7" stroke="#1c1c1e" strokeWidth="2" />
        <rect x="26" y="35" width="34" height="23" rx="2" fill="#fbf6e7" stroke="#1c1c1e" strokeWidth="2" />
      </g>
      {/* front CV sheet */}
      <g>
        <rect x="24" y="28" width="15" height="8" rx="3" fill="#ffffff" stroke="#1c1c1e" strokeWidth="2.2" />
        <rect x="22" y="33" width="38" height="25" rx="2" fill="#ffffff" stroke="#1c1c1e" strokeWidth="2.5" />
        <text
          x="29"
          y="51"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="#1c1c1e"
        >
          CV
        </text>
      </g>
      {/* box: side face + front face */}
      <polygon points="60,54 74,47 74,77 60,84" fill="#a9adb3" stroke="#1c1c1e" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="18" y="54" width="42" height="30" fill="#ffffff" stroke="#1c1c1e" strokeWidth="2.5" />
      <line x1="18" y1="54" x2="60" y2="54" stroke="#1c1c1e" strokeWidth="2.5" />
      {/* handle slot */}
      <rect x="30" y="64" width="18" height="7" rx="3.5" fill="#1c1c1e" />
    </svg>
  );
}

/** Fixed archive-box button sitting right below the theme lever. Pressing
 *  it opens the CV in view mode (popup with a top-right Download button
 *  that saves the PDF directly). Joins the hero entrance cascade last
 *  (intro step 7) on home. */
export default function CvButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // Home page only — work, contact and 404 have no CV entry.
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="View CV"
        title="View CV"
        data-haptic="medium"
        data-reveal="div"
        data-intro-step="7"
        data-reveal-delay="0.2"
        className="cv-button"
      >
        <ArchiveBoxIcon />
      </button>
      {open && <CvModal onClose={close} />}
    </>
  );
}
