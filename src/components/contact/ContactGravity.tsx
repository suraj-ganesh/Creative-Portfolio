"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

interface PillLink {
  label: string;
  href: string;
}

const OUTLOOK_COMPOSE = `https://outlook.live.com/owa/?path=/mail/action/compose&to=${encodeURIComponent(
  profile.email,
)}&subject=${encodeURIComponent("[Project Inquiry] Hello")}`;

export default function ContactGravity() {
  const links: PillLink[] = [
    { label: "Email", href: OUTLOOK_COMPOSE },
    { label: "Instagram", href: profile.socials.instagram || OUTLOOK_COMPOSE },
    { label: "Facebook", href: profile.socials.facebook || OUTLOOK_COMPOSE },
    { label: "X", href: profile.socials.x || OUTLOOK_COMPOSE },
    { label: "GitHub", href: profile.socials.github || OUTLOOK_COMPOSE },
    { label: "Behance", href: profile.socials.behance || OUTLOOK_COMPOSE },
    { label: "LinkedIn", href: profile.socials.linkedin || OUTLOOK_COMPOSE },
  ];

  const [phoneOpen, setPhoneOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!phoneOpen) return;
    setCopied(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhoneOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phoneOpen]);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(profile.phone);
    } catch {
      // Clipboard API unavailable (non-secure context) — legacy fallback.
      try {
        const ta = document.createElement("textarea");
        ta.value = profile.phone;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* user can copy manually */
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="contact-gravity">
      <div className="cg-field" data-contact-pills="">
        {links.map((link) => (
          <a
            key={link.label}
            data-haptic="medium"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} — get in touch`}
            className="cg-pill p1"
          >
            <span className="cg-pill-inner">{link.label}</span>
          </a>
        ))}
        <button
          key="Phone"
          type="button"
          data-haptic="medium"
          aria-label="Phone — show number"
          aria-haspopup="dialog"
          onClick={() => setPhoneOpen(true)}
          className="cg-pill p1"
        >
          <span className="cg-pill-inner">Phone</span>
        </button>
      </div>

      <h1
        data-reveal="text"
        data-reveal-delay="0.5"
        className="cg-name is-cut"
        aria-label={`${profile.firstName} ${profile.lastName}`}
      >
        {`${profile.firstName}${profile.lastName}`.toUpperCase()}
      </h1>

      {phoneOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Phone number"
          onClick={() => setPhoneOpen(false)}
          className="cg-phone-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cg-phone-card"
          >
            <div className="p1 cg-phone-label">Phone</div>
            <div className="cg-phone-number">{profile.phone}</div>
            <div className="cg-phone-actions">
              <button
                type="button"
                onClick={copyPhone}
                className="cg-phone-btn p1"
              >
                {copied ? "Copied ✓" : "Copy number"}
              </button>
              <button
                type="button"
                onClick={() => setPhoneOpen(false)}
                aria-label="Close"
                className="cg-phone-btn p1 is-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
