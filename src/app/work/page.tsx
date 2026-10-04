import type { Metadata } from "next";
import WorkGrid from "@/components/work/WorkGrid";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: "Suraj Ganesh",
  description: "Selected video editing work, '24 – '26. Social campaigns, promos and color grading.",
};

export default function WorkPage() {
  return (
    <main
      data-page="works"
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
                Video Editor
                <br />
                &amp; Colorist
              </div>
            </div>
          </div>
          <div
            id="w-node-_0ae272af-0aef-ebb8-8f0c-3856a5494c17-a5494c0f"
            className="hero-heading-wrap"
          >
            <div className="hero-meta">
              <div data-preloader="text-2" className="p1">
                Based in Jhapa
                <br />
              </div>
              <div className="hero-meta-inner">
                <div data-preloader="text-2" className="p1">
                  Working w/<br />
                </div>
                <a
                  data-preloader="text-2"
                  data-link-trigger=""
                  href="https://surajganesh.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inner events-auto pointer w-inline-block"
                >
                  <div data-link="label" className="p1">
                    KHARAAYO INC.
                  </div>
                  <div data-link="shadow" className="p1 is-2">
                    KHARAAYO INC.
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
