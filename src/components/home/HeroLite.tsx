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
          {/* Mobile masthead lockup (reference): logo top-left, hairline
              rule middle, name bottom-right, role bottom-left. HeroLite is
              the phone hero — the desktop full Hero never reads this. */}
          <div className="progress-wrap hero-lite__toprow">
            <div className="hero-lite__left">
              <div className="icon-wrap is-logo hero-lite__mark">
                <img
                  src="/images/hero-mark.png"
                  alt="Suraj Ganesh — motion mark"
                  width={491}
                  height={457}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <div className="p1 events-auto">
                {profile.role.split("&")[0]}
                <br />&amp; {profile.role.split("&")[1] || "Developer"}
              </div>
            </div>
            <div className="hero-lite__divider" aria-hidden="true" />
            <div className="heading-group-wrap hero-lite__name">
              <h1 className="h1">{profile.firstName}</h1>
              <h1 className="h1">{profile.lastName}</h1>
            </div>
          </div>

          <div className="heading-group-wrap mt-8">
            <h1 className="h1">{profile.heroHeadings.line1}</h1>
            <h1 className="h1">{profile.heroHeadings.line2}</h1>
            <h1 className="h1">{profile.heroHeadings.line3}</h1>
          </div>

          {/* Body lockup (reference): one continuous hairline beside the
              "Color & Motion graphics." stack AND the bio paragraph. The
              empty first cell keeps the line on the same x as the masthead
              rule above. */}
          <div className="hero-lite__bodywrap mt-8 events-auto">
            <span aria-hidden="true" />
            <div className="hero-lite__bodyline" aria-hidden="true" />
            <div className="hero-lite__bodytext">
              <div className="hero-lite__subtext">
                <h1 className="h1">{profile.heroHeadings.line4}</h1>
                <h1 className="h1">
                  {profile.heroHeadings.line5.split(" ")[0]}
                </h1>
                <h1 className="h1">
                  {profile.heroHeadings.line5.split(" ")[1] || "dev."}
                </h1>
                <h1 className="h1 hero-lite__sublast">
                  {profile.heroHeadings.line5.split(" ")[2] || ""}
                </h1>
              </div>
              <div className="p1 hero-lite__bio">{profile.heroBio}</div>
            </div>
          </div>

          {/* Motto lockup (reference): "every" left, "cut" right of the
              line's path, then centered "tells a / story". */}
          <div className="hero-lite__motto events-auto">
            <h1 className="h1 hero-lite__motto-every">
              {profile.heroMotto.line1}
            </h1>
            <span aria-hidden="true" />
            <h1 className="h1 hero-lite__motto-cut">
              {profile.heroMotto.line2}
            </h1>
            <h1 className="h1 hero-lite__motto-center">
              {profile.heroMotto.line3}
            </h1>
            <h1 className="h1 hero-lite__motto-center">
              {profile.heroMotto.line4}
            </h1>
          </div>

          <div className="p1 mt-240 events-auto hero-lite__copy">
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
                loading="lazy"
                fetchPriority="auto"
                decoding="async"
                sizes="(max-width: 991px) 50vw, 25vw"
                draggable={false}
                alt={card.title}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
