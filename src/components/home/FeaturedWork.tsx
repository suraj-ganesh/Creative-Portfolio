import { projects } from "@/data/projects";

export default function FeaturedWork() {
  const globeProjects = projects.filter((p) => p.coverImage);

  return (
    <>
      {/* Desktop Featured 3D Globe Section */}
      <section className="featured">
        <div className="featured-inner">
          <div data-featured="heading" className="featured-heading-wrap">
            <div data-featured="text" data-reveal="text" className="h1">
              Work
            </div>
            <div data-featured="text" data-reveal="text" className="h1">
              24-26
            </div>
            <div data-featured="link" className="featured-link-wrap">
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

          <div
            data-globe="wrap"
            data-featured="globe"
            className="featured-globe"
          >
            <div className="globe-database-wrap w-dyn-list">
              <div
                data-globe="database"
                role="list"
                className="globe-database w-dyn-items"
              >
                {globeProjects.map((p, idx) => (
                  <div
                    key={p.slug || idx}
                    data-globe="img"
                    role="listitem"
                    className="globe-database-item w-dyn-item"
                  >
                    <img
                      src={p.coverImage}
                      loading="eager"
                      alt={p.title}
                      className="img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Featured Carousel */}
      <section m-data-featured="wrap" className="m-featured is-mobile">
        <div className="m-featured-inner">
          <div m-data-featured="heading" className="m-featured-heading-wrap">
            <div m-data-featured="text" data-reveal="text" className="h1">
              Work
            </div>
            <div m-data-featured="text" data-reveal="text" className="h1">
              24-26
            </div>
            <div m-data-featured="link" className="m-featured-link-wrap">
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

          <div className="div-block-9">
            <div
              m-data-featured="list"
              className="collection-list-wrapper-2 w-dyn-list"
            >
              <div role="list" className="collection-list-2 w-dyn-items">
                {globeProjects.map((p, idx) => (
                  <div
                    key={p.slug || idx}
                    role="listitem"
                    className="collection-item-2 w-dyn-item"
                  >
                    <img
                      src={p.coverImage}
                      loading="lazy"
                      alt={p.title}
                      className="img width-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
