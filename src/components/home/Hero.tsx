import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export default function Hero() {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="intro">
      <div className="intro-inner">
        <div className="w-layout-grid grid">
          {/* Preloader / Logo Cell */}
          <div
            data-preloader="progress"
            id="w-node-abaa122c-64c0-5bbc-efd8-fe75eb629930-ef9a5cf3"
            className="progress-wrap"
          >
            <div className="icon-wrap is-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 95 160"
                fill="none"
                preserveAspectRatio="none"
                className="svg"
              >
                <path
                  d="M20.064 1.6663C22.0173 1.32437 25.2528 1.28553 30.4712 2.37724C41.3446 4.65309 52.9548 14.991 55.1089 17.2669C57.2584 19.5425 63.8639 29.5439 67.2037 33.5735C70.5434 37.6031 73.399 52.1129 75.1255 54.0159C76.8525 55.9201 82.8245 67.6086 81.2681 74.9612C79.7116 82.3143 80.8632 86.9047 85.8335 89.3294C90.8038 91.7585 92.957 87.4274 92.399 91.2727C91.8059 97.3185 89.0206 97.1305 86.4615 102.431C84.4341 106.631 84.4074 110.035 84.4859 111.267C84.5076 111.613 84.4639 111.955 84.3462 112.283C83.8666 113.638 82.629 117.195 82.5679 117.918C82.4933 118.814 77.911 131.91 74.9595 133.703C72.2259 135.361 67.2036 139.946 66.4751 140.617C66.4141 140.67 66.3614 140.723 66.3091 140.784C65.4622 141.737 57.7371 150.331 51.4332 155.684C44.7539 161.357 41.6365 159.415 40.3765 158.893C39.1214 158.373 35.7294 155.039 35.7027 155.013L29.2457 147.997C29.2457 147.997 18.4854 135.273 15.7037 119.339C13.3276 105.738 5.7855 85.3936 3.6314 79.7278C3.31748 78.8947 3.45261 77.9601 3.99761 77.263C7.09727 73.3034 6.71385 64.2535 6.64409 62.8636C6.56085 61.35 1.55113 49.0909 3.60893 47.5257C5.66305 45.962 6.49793 37.5167 6.50444 37.4505C6.50444 37.4505 8.64944 19.9949 11.6578 14.9261C11.9193 14.4788 12.3115 14.1102 12.7955 13.9173C15.3983 12.8869 16.5975 7.66517 17.0728 4.74052C17.3257 3.17956 18.5162 1.93377 20.064 1.6663ZM47.7915 73.969C44.286 73.9691 41.4263 76.7465 41.2681 80.2327L23.4078 80.888C23.0007 77.654 20.2574 75.1528 16.9312 75.1526C13.3241 75.1526 10.4 78.0934 10.4 81.721C10.4002 85.3484 13.3243 88.2893 16.9312 88.2893C20.1605 88.2891 22.8407 85.9311 23.3667 82.8343L41.4634 82.1682C42.1848 85.0066 44.7445 87.1057 47.7915 87.1057C51.3983 87.1055 54.3225 84.1646 54.3228 80.5374C54.3228 76.9099 51.3985 73.9692 47.7915 73.969Z"
                  fill="currentColor"
                  data-morph-final=""
                  className="path"
                ></path>
              </svg>
            </div>
            <div data-preloader="text-1" className="p1 events-auto">
              {profile.role.split("&")[0]}
              <br />&amp; {profile.role.split("&")[1] || "Developer"}
            </div>
          </div>

          {/* Name & Agency Meta */}
          <div
            id="w-node-_1b6f1581-6773-0695-794b-998a67dcf734-ef9a5cf3"
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
            <div className="heading-group-wrap">
              <h1 data-reveal="text" className="h1">
                {profile.firstName}
              </h1>
              <h1 data-reveal="text" className="h1">
                {profile.lastName}
              </h1>
            </div>
          </div>

          {/* Main Hero Headings */}
          <div
            id="w-node-_5ab48863-5061-473e-95d0-d0f92d1f9d5f-ef9a5cf3"
            className="heading-group-wrap mt-8"
          >
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line1}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line2}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line3}
            </h1>
          </div>

          <div
            id="w-node-ce00d9c2-292e-44fb-6f7b-d9a01f73fd22-ef9a5cf3"
            className="heading-group-wrap mt-8 events-auto"
          >
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line4}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line5.split(" ")[0]}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.heroHeadings.line5.split(" ")[1] || "dev."}
            </h1>
            <h1 data-reveal="text" className="h1 left-offset-120 mb-104">
              {profile.heroHeadings.line5.split(" ")[2] || ""}
            </h1>
          </div>

          <div
            data-reveal="clip-down"
            id="w-node-_1f514f62-4633-54c7-6939-4da391c4f490-ef9a5cf3"
            className="spacer mt-8"
          ></div>

          {/* Theme Switcher Dots */}
          <div
            id="w-node-_3a198df4-4726-4d30-f0e5-4ae25dd6cf5b-ef9a5cf3"
            className="w-layout-grid theme-grid"
          >
            <div data-reveal="div" className="theme-switch">
              <div
                data-haptic="medium"
                data-theme-mode="1"
                className="theme-switch-inner"
              ></div>
            </div>
            <div
              data-reveal="div"
              id="w-node-a1273c98-2db5-88c9-b83b-01315dfbcebd-ef9a5cf3"
              className="theme-switch"
            >
              <div
                data-haptic="medium"
                data-theme-mode="3"
                className="theme-switch-inner"
              ></div>
            </div>
            <div
              data-reveal="div"
              id="w-node-_847aad02-b274-8a89-8b0a-88654d4d9fbd-ef9a5cf3"
              className="theme-switch"
            >
              <div
                data-haptic="medium"
                data-theme-mode="2"
                className="theme-switch-inner"
              ></div>
            </div>
            <div
              data-reveal="div"
              id="w-node-a911ecd5-32e5-f2e6-f7b9-c4631946e6d8-ef9a5cf3"
              className="theme-switch"
            >
              <div
                data-haptic="medium"
                data-theme-mode="base"
                className="theme-switch-inner"
              ></div>
            </div>
            <div
              data-reveal="div"
              id="w-node-_43f98cc2-626e-c2c0-48ed-0d32ed49a9da-ef9a5cf3"
              className="theme-switch"
            >
              <div
                data-haptic="medium"
                data-theme-mode="4"
                className="theme-switch-inner"
              ></div>
            </div>
          </div>

          {/* Bio statement */}
          <div
            data-reveal="text"
            id="w-node-b3ffe939-77a9-9ffd-556a-a54954be4b55-ef9a5cf3"
            className="p1 mb-104 events-auto"
          >
            {profile.heroBio}
          </div>

          {/* Motto / Bottom Headline */}
          <h1
            data-reveal="text"
            id="w-node-_795aae42-750b-b740-f810-4b4a40ef7352-ef9a5cf3"
            className="h1 events-auto"
          >
            {profile.heroMotto.line1}
          </h1>
          <h1
            data-reveal="text"
            id="w-node-_9eb95de1-11ff-94e8-fae3-7237a73fd2cf-ef9a5cf3"
            className="h1 events-auto"
          >
            {profile.heroMotto.line2}
          </h1>
          <div
            id="w-node-_795aae42-750b-b740-f810-4b4a40ef7351-ef9a5cf3"
            className="heading-group-wrap offset-16 events-auto"
          >
            <h1 data-reveal="text" className="h1">
              {profile.heroMotto.line3}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.heroMotto.line4}
            </h1>
          </div>

          <div
            data-reveal="clip-down"
            id="w-node-_63bb6d4f-5751-e85f-33f0-e0419eee53d2-ef9a5cf3"
            className="spacer mt-8"
          ></div>
          <div
            data-reveal="text"
            id="w-node-dcd49ee0-e90c-2ffe-cf7c-21f57ae4ce38-ef9a5cf3"
            className="p1 mt-240 events-auto"
          >
            © {profile.copyrightYear.replace("‘", "'")}
          </div>
        </div>
      </div>

      {/* Interactive Fluid Three.js Canvas & 3D Orbit Cards */}
      <div className="reveal-block-wrap">
        <div data-fluid-reveal="" className="reveal-block">
          <canvas data-fluid-canvas="" className="fluid-canvas"></canvas>
          <div data-orbit-tiles-init="" className="orbit-tiles">
            <div
              data-orbit-tiles-collection=""
              className="orbit-tiles__collection w-dyn-list"
            >
              <div
                data-orbit-tiles-list=""
                role="list"
                className="orbit-tiles__list w-dyn-items"
              >
                {featuredProjects.map((p, idx) => (
                  <div
                    key={p.slug || idx}
                    data-orbit-tiles-item=""
                    role="listitem"
                    className="orbit-tiles__item w-dyn-item"
                  >
                    <div className="demo-card">
                      <img
                        src={p.coverImage}
                        loading="lazy"
                        alt={p.title}
                        className="cover-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
