import { projects } from "@/data/projects";

export default function WorkGrid() {
  return (
    <section className="works">
      <div className="works-overlay">
        <div className="w-layout-grid grid">
          <div
            data-works-intro="left-text"
            id="w-node-_2a6e3a7d-342a-8d2a-0e57-4d7a32689e44-3f92bac2"
            className="works-overlay-left"
          >
            <div data-reveal="text" className="h1">
              24
            </div>
          </div>
          <div
            data-works-intro="right-text"
            id="w-node-_34b20363-0eda-8a41-aac3-028c52b704bd-3f92bac2"
            className="works-overlay-right"
          >
            <div data-reveal="text" className="h1">
              25
            </div>
          </div>
        </div>
      </div>

      <div className="works-inner">
        <div className="works-heading">
          <div data-works-intro="trigger" className="w-layout-grid grid">
            <h1
              data-reveal="text"
              id="w-node-_33ed6a2b-8baa-d944-4323-76aa60eabf0e-3f92bac2"
              className="h1"
            >
              Work
            </h1>
            <div
              data-reveal="w"
              id="w-node-_018fa649-3599-6827-e480-d4f6b10cfd8d-3f92bac2"
              className="works-view"
            >
              <a
                data-filter-tab="cards"
                href="#work"
                className="filter-tab w-inline-block"
              >
                <div data-reveal="div" className="link-inner">
                  <div data-link="label" className="p1">
                    Cards
                  </div>
                  <div
                    data-link="shadow"
                    data-filter-tab="cards"
                    className="p1 is-2"
                  >
                    Cards
                  </div>
                </div>
              </a>
              <div data-reveal="div" className="p1 is-secondary">
                /
              </div>
              <a
                data-filter-tab="globe"
                href="#work"
                className="filter-tab w-inline-block"
              >
                <div data-reveal="div" className="link-inner">
                  <div data-link="label" className="p1">
                    Sphere
                  </div>
                  <div
                    data-link="shadow"
                    data-filter-tab="globe"
                    className="p1 is-2"
                  >
                    Sphere
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div id="work" className="works-wrap">
          <div
            data-filter-content="cards"
            className="works-list-wrap w-dyn-list"
          >
            <div
              data-tab-content-reval="list"
              role="list"
              className="works-list w-dyn-items"
            >
              {projects.map((project) => (
                <div
                  key={project.slug}
                  data-haptic="medium"
                  data-works-item="wrap"
                  data-tab-content-reval="item"
                  data-tilt="wrap"
                  id="w-node-_019a10b8-2b38-475b-0c97-40a12d4b0193-3f92bac2"
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

          <div data-filter-content="globe" className="works-globe-wrap">
            <div className="works-globe-inner">
              <div className="works-globe-info">
                <div className="works-globe-info-inner">
                  <div className="works-globe-info-list-wrap w-dyn-list">
                    <div
                      role="list"
                      className="works-globe-info-list w-dyn-items"
                    >
                      {projects.map((project) => (
                        <div
                          key={project.slug}
                          data-works-info={project.slug}
                          role="listitem"
                          className="works-globe-info-ltem w-dyn-item"
                        >
                          <div className="w-layout-grid grid">
                            <div
                              id="w-node-_90f66e8c-5a21-39e6-c6c6-8fa4f24a1122-3f92bac2"
                              className="works-type is-on-bg"
                            >
                              <div className="p1">{project.type}</div>
                            </div>
                            <div
                              id="w-node-_72e5e985-1a86-dcb2-f1cc-0b1790b33bf1-3f92bac2"
                              className="p1"
                            >
                              {project.title}
                            </div>
                            <div
                              data-works=""
                              id="w-node-_1efd63bf-0ff7-8abe-8ecd-b416fa7ca86c-3f92bac2"
                              className="work-services"
                            >
                              <div className="work-services-list-wrap w-dyn-list">
                                <div
                                  data-cut="list"
                                  role="list"
                                  className="works-services-list w-dyn-items"
                                >
                                  {(project.services ?? []).map((s) => (
                                    <div
                                      key={s}
                                      data-cut="item"
                                      role="listitem"
                                      className="works-services-item w-dyn-item"
                                    >
                                      <div className="p1">{s}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div
                                data-cut="counter"
                                className="p1 is-cut-counter"
                              >
                                +0
                              </div>
                            </div>
                            <a
                              id="w-node-f5f57a69-a8fc-d06f-3695-40fd9926651d-3f92bac2"
                              href={`/works/${project.slug}`}
                              className="button is-on-bg w-inline-block"
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
              </div>

              <div
                data-tab-content-reval="globe"
                data-featured="globe"
                data-globe="wrap"
                className="works-globe"
              >
                <div className="globe-database-wrap w-dyn-list">
                  <div
                    data-globe="database"
                    role="list"
                    className="globe-database w-dyn-items"
                  >
                    {projects.map((p) => (
                      <div
                        key={p.slug}
                        data-works-database={p.slug}
                        data-globe="img"
                        role="listitem"
                        className="globe-database-item w-dyn-item"
                      >
                        <img
                          src={p.coverImage}
                          loading="lazy"
                          alt={p.title}
                          height={1024}
                          className="img"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-works-intro="out" className="works-outro">
          <div data-reveal="text" className="p1">
            Cut with patience, graded with obsession, and mixed until it feels
            inevitable.
          </div>
        </div>
      </div>
    </section>
  );
}
