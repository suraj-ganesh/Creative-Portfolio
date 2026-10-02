import { projects } from "@/data/projects";

export default function WorkGrid() {
  return (
    <section className="works">
      <div className="works-inner">
        <div className="works-heading-wrap">
          <div data-reveal="text" className="h1">
            Work
          </div>
          <div data-reveal="text" className="h1">
            24-26
          </div>
        </div>

        <div className="works-collection-wrap w-dyn-list">
          <div role="list" className="works-collection w-dyn-items">
            {projects.map((project) => (
              <div
                key={project.slug}
                data-haptic="medium"
                data-tab-content-reval="item"
                data-tilt="wrap"
                data-works-item="wrap"
                role="listitem"
                className="works-item w-dyn-item"
              >
                <a
                  className="works-item-link-overlay w-inline-block"
                  href={`/works/${project.slug}`}
                ></a>
                <div className="works-item-image-wrap" data-tilt="card">
                  <div className="works-item-image-inner">
                    <img
                      alt={project.title}
                      loading="lazy"
                      src={project.coverImage}
                      className="img is-cover-works"
                    />
                  </div>
                </div>
                <div className="works-item-meta">
                  <div className="works-type">
                    <div className="p1">{project.type}</div>
                  </div>
                  <div className="p1">{project.title}</div>
                </div>
                <div className="works-item-button" data-works-item="button">
                  <a
                    className="button w-inline-block"
                    href={`/works/${project.slug}`}
                  >
                    <div className="link-inner">
                      <div data-link="label" className="p1">
                        Explore
                      </div>
                      <div data-link="shadow" className="p1 is-2">
                        Explore
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
