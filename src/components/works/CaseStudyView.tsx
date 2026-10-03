import { Project, projects } from "@/data/projects";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";
import worksDataRaw from "@/data/works.json";

interface WorksDataEntry {
  slug: string;
  title: string;
  description: string;
  ogImage: string;
  namespace: string;
  html: string;
}

const worksData = worksDataRaw as Record<string, WorksDataEntry>;

export default function CaseStudyView({ project }: { project: Project }) {
  // If raw Webflow CMS html exists for this specific work, render it
  const existingWork = worksData[project.slug];
  if (existingWork && existingWork.html) {
    return (
      <main
        data-page={project.slug}
        className="transition-container"
        dangerouslySetInnerHTML={{ __html: existingWork.html }}
      />
    );
  }

  // Otherwise, render a clean, modular React case study template for newly added projects!
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const nextProject =
    projects[(currentIndex + 1) % projects.length] || projects[0];

  return (
    <main
      data-page={project.slug}
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
                Case Study
                <br />
              </div>
              <div className="hero-meta-inner">
                <div data-preloader="text-2" className="p1">
                  {project.year || "'26"}
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap">
        <section className="works-item-intro">
          <div className="w-layout-grid grid">
            <div className="heading-group-wrap">
              <h1 data-reveal="text" className="h1">
                {project.title}
              </h1>
            </div>

            <div className="spacer mt-8"></div>

            <div className="p1 events-auto mb-104">
              <div className="works-meta-inner">
                <p className="p1">{project.description}</p>
              </div>
            </div>

            {project.services && project.services.length > 0 && (
              <div className="works-meta-block">
                <div className="p1 opacity-0-5">Services</div>
                <div className="works-services-list">
                  {project.services.map((s, i) => (
                    <div key={i} className="p1">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Project Cover Image */}
        {project.coverImage && (
          <section className="works-visual-wrap">
            <div className="works-image-full">
              <img
                src={project.coverImage}
                alt={project.title}
                loading="eager"
                className="img"
              />
            </div>
          </section>
        )}

        {/* Discover What's Next / Navigation */}
        <section className="works-next">
          <div className="w-layout-grid grid">
            <div className="heading-group-wrap">
              <h2 className="h1" data-reveal="text">
                Discover
              </h2>
              <h2 className="h1 _1-cell-offset" data-reveal="text">
                what’s next
              </h2>
            </div>

            <div className="works-next-card">
              <a
                href={`/works/${nextProject.slug}`}
                className="button w-inline-block"
              >
                <div className="link-inner">
                  <div data-link="label" className="h2">
                    {nextProject.title}
                  </div>
                  <div data-link="shadow" className="h2 is-2">
                    {nextProject.title}
                  </div>
                </div>
              </a>
            </div>

            <div className="works-all-link">
              <a
                data-haptic="medium"
                data-underline="wrap"
                href="/work"
                className="link w-inline-block"
              >
                <div data-underline="text" className="h1">
                  All Works
                </div>
              </a>
            </div>
          </div>
        </section>

        <Footer />
        <ThemeChangeOverlay />
      </div>
    </main>
  );
}
