import { profile } from "@/data/profile";
import { defaultOrbitCards } from "@/data/orbitTiles";

/**
 * Static hero for phones / low-power devices. Same content and visual
 * language as the animated Hero, but zero GSAP, zero video, zero WebGL:
 * plain poster stills with a transform-only CSS entrance. Crucially it
 * carries NO fx hooks (no data-reveal / data-intro-step / data-preloader),
 * so nothing is ever staged hidden and the preloader resolves instantly —
 * the page is readable on first paint even if every animation fails.
 */
export default function HeroLite() {
  return (
    <section className="intro hero-lite">
      <div className="intro-inner">
        <div className="w-layout-grid grid">
          <div className="progress-wrap">
            <div className="icon-wrap is-logo hero-lite__mark">
              <img
                src="/images/hero-mark.png"
                alt="Suraj Ganesh — motion mark"
                width={491}
                height={457}
                loading="eager"
                decoding="async"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <div className="p1 events-auto">
              {profile.role.split("&")[0]}
              <br />&amp; {profile.role.split("&")[1] || "Developer"}
            </div>
          </div>

          <div className="hero-heading-wrap">
            <div className="hero-meta" aria-hidden="true" />
            <div className="heading-group-wrap">
              <h1 className="h1">{profile.firstName}</h1>
              <h1 className="h1">{profile.lastName}</h1>
            </div>
          </div>

          <div className="heading-group-wrap mt-8">
            <h1 className="h1">{profile.heroHeadings.line1}</h1>
            <h1 className="h1">{profile.heroHeadings.line2}</h1>
            <h1 className="h1">{profile.heroHeadings.line3}</h1>
          </div>

          <div className="heading-group-wrap mt-8 events-auto">
            <h1 className="h1">{profile.heroHeadings.line4}</h1>
            <h1 className="h1">{profile.heroHeadings.line5.split(" ")[0]}</h1>
            <h1 className="h1">
              {profile.heroHeadings.line5.split(" ")[1] || "dev."}
            </h1>
            <h1 className="h1 left-offset-120 mb-104">
              {profile.heroHeadings.line5.split(" ")[2] || ""}
            </h1>
          </div>

          <div className="p1 mb-104 events-auto">{profile.heroBio}</div>

          <h1 className="h1 events-auto">{profile.heroMotto.line1}</h1>
          <h1 className="h1 events-auto">{profile.heroMotto.line2}</h1>
          <div className="heading-group-wrap offset-16 events-auto">
            <h1 className="h1">{profile.heroMotto.line3}</h1>
            <h1 className="h1">{profile.heroMotto.line4}</h1>
          </div>

          <div className="p1 mt-240 events-auto">
            © {profile.copyrightYear.replace("‘", "'")}
          </div>
        </div>
      </div>

      {/* Static showreel collage — same posters as the orbit, no motion
          beyond a GPU-cheap CSS drift (transform-only, no blur/filter). */}
      <div className="reveal-block-wrap">
        <div className="hero-lite__collage" aria-label="Selected work stills">
          {defaultOrbitCards.map((card, idx) => (
            <div
              key={card.title + idx}
              className="hero-lite__tile"
              style={{
                aspectRatio: card.aspect === "16:9" ? "16 / 9" : "9 / 16",
              }}
            >
              <img
                src={card.image}
                loading={idx < 2 ? "eager" : "lazy"}
                decoding="async"
                alt={card.title}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
