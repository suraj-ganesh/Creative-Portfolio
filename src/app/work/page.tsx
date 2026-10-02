import type { Metadata } from "next";
import WorkGrid from "@/components/work/WorkGrid";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: "Work - bleibtgleich",
  description: "A selection of recent work, '24 – '26.",
};

export default function WorkPage() {
  return (
    <main
      data-barba-namespace="works"
      data-barba="container"
      className="transition-container"
    >
      <section className="preloader-wrap">
        <div className="w-layout-grid grid">
          <div
            id="w-node-_0ae272af-0aef-ebb8-8f0c-3856a5494c11-a5494c0f"
            className="progress"
          >
            <div data-preloader="progress" className="progress-wrap">
              <div data-preloader="text-1" className="p1">
                Designer
                <br />
                &amp; Developer
              </div>
            </div>
          </div>
          <div
            id="w-node-_0ae272af-0aef-ebb8-8f0c-3856a5494c17-a5494c0f"
            className="hero-heading-wrap"
          >
            <div className="hero-meta">
              <div data-preloader="text-2" className="p1">
                Based in Kyiv
                <br />
              </div>
              <div className="hero-meta-inner">
                <div data-preloader="text-2" className="p1">
                  Working w/<br />
                </div>
                <a
                  data-preloader="text-2"
                  data-link-trigger=""
                  href="https://thefirstthelast.agency/?utm_source=bleibtgleich&utm_medium=article&utm_campaign=promo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inner events-auto pointer w-inline-block"
                >
                  <div data-link="label" className="p1">
                    TFTL
                  </div>
                  <div data-link="shadow" className="p1 is-2">
                    TFTL
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap">
        <WorkGrid />
        <Footer />
        <ThemeChangeOverlay />
      </div>
    </main>
  );
}
