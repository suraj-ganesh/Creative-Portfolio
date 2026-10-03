import type { Metadata } from "next";
import { profile } from "@/data/profile";
import ContactDial from "@/components/contact/ContactDial";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: "Contact - bleibtgleich",
  description:
    "Write directly. Email for commissions and collaborations, social links for everything else.",
};

export default function ContactPage() {
  return (
    <main
      data-page="contact"
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
                {profile.location}
                <br />
              </div>
              <div className="hero-meta-inner">
                <div data-preloader="text-2" className="p1">
                  Working w/<br />
                </div>
                <a
                  data-preloader="text-2"
                  data-link-trigger=""
                  href={profile.company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inner events-auto pointer w-inline-block"
                >
                  <div data-link="label" className="p1">
                    {profile.company.name}
                  </div>
                  <div data-link="shadow" className="p1 is-2">
                    {profile.company.name}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap">
        <ContactDial />
        <Footer />
        <ThemeChangeOverlay />
      </div>
    </main>
  );
}
