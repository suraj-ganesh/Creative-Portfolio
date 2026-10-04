"use client";

import { profile } from "@/data/profile";

interface PillLink {
  label: string;
  href: string;
}

export default function ContactGravity() {
  const mailto = `mailto:${profile.email}?subject=%5BProject%20Inquiry%5D%20Hello`;
  const tel = `tel:${profile.phone.replace(/\s+/g, "")}`;
  const links: PillLink[] = [
    { label: "Email", href: mailto },
    { label: "Instagram", href: profile.socials.instagram || mailto },
    { label: "Facebook", href: profile.socials.facebook || mailto },
    { label: "X", href: profile.socials.x || mailto },
    { label: "GitHub", href: profile.socials.github || mailto },
    { label: "Behance", href: profile.socials.behance || mailto },
    { label: "LinkedIn", href: profile.socials.linkedin || mailto },
    { label: "Phone", href: tel },
  ];

  return (
    <section className="contact-gravity">
      <div className="cg-field" data-contact-pills="">
        {links.map((link) => {
          const isWeb = /^https?:/.test(link.href);
          return (
            <a
              key={link.label}
              data-haptic="medium"
              href={link.href}
              {...(isWeb
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              aria-label={`${link.label} — get in touch`}
              className="cg-pill p1"
            >
              <span className="cg-pill-inner">{link.label}</span>
            </a>
          );
        })}
      </div>

      <h1
        data-reveal="text"
        data-reveal-delay="0.5"
        className="cg-name is-cut"
        aria-label={`${profile.firstName} ${profile.lastName}`}
      >
        {`${profile.firstName}${profile.lastName}`.toUpperCase()}
      </h1>
    </section>
  );
}
