import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer
      id="w-node-a204f672-ea1b-c502-70d3-3fa0032bc8db-032bc8db"
      data-wf--footer--variant="base"
      className="footer"
    >
      <div className="footer-inner">
        <div className="w-layout-grid grid is-footer">
          {/* Quote left side */}
          <div
            id="w-node-_2e3db1fa-aa68-b925-5a97-e4970eb60ce1-032bc8db"
            className="heading-group-wrap"
          >
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line1}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line2}
            </h1>
          </div>
          <div
            id="w-node-_7dac5ba3-75b3-d297-693a-71a77bf5e06c-032bc8db"
            className="heading-group-wrap mt-8"
          >
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line3}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line4}
            </h1>
          </div>

          {/* Quote right side */}
          <div
            id="w-node-_6861e4a1-aa8e-1804-6ccf-f84cf2e77729-032bc8db"
            className="heading-group-wrap is-right"
          >
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line5}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line6}
            </h1>
          </div>
          <div
            id="w-node-_1a97522f-532e-4187-0fb4-cf59944e37c8-032bc8db"
            className="heading-group-wrap is-right mt-8"
          >
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line7}
            </h1>
            <h1 data-reveal="text" className="h1">
              {profile.footerQuote.line8}
            </h1>
          </div>

          {/* Social Links */}
          <div
            id="w-node-a204f672-ea1b-c502-70d3-3fa0032bc8de-032bc8db"
            className="footer-socials"
          >
            <div className="socials-list-wrap w-dyn-list">
              <div
                data-reveal="w"
                role="list"
                className="social-list w-dyn-items"
              >
                {profile.socials.linkedin && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="LinkedIn"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 15 15"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M4.33792 3.12557C4.33769 3.63451 4.02892 4.0925 3.55721 4.28357C3.0855 4.47464 2.54504 4.36064 2.19068 3.99533C1.83633 3.63001 1.73884 3.08633 1.94418 2.62065C2.14953 2.15498 2.61671 1.8603 3.12542 1.87557C3.80109 1.89585 4.33823 2.44959 4.33792 3.12557ZM4.37542 5.30057H1.87542V13.1255H4.37542V5.30057ZM8.32543 5.30057H5.83792V13.1255H8.30043V9.0193C8.30043 6.7318 11.2817 6.5193 11.2817 9.0193V13.1255H13.7504V8.1693C13.7504 4.31307 9.33793 4.45682 8.30043 6.35055L8.32543 5.30057Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
                {profile.socials.behance && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="Behance"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 15 15"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M4.64968 3.34375C5.04928 3.34375 5.41813 3.37467 5.75624 3.46743C6.09436 3.52926 6.37098 3.65294 6.61692 3.80753C6.8628 3.96213 7.04723 4.17855 7.17017 4.45682C7.29311 4.73509 7.35461 5.07519 7.35461 5.44622C7.35461 5.87908 7.26242 6.25014 7.04723 6.52839C6.8628 6.80664 6.55542 7.05401 6.18657 7.23951C6.70911 7.39408 7.10867 7.67239 7.35461 8.04339C7.60048 8.41439 7.75417 8.8782 7.75417 9.40382C7.75417 9.8367 7.66198 10.2077 7.5083 10.5169C7.35461 10.8261 7.10867 11.1043 6.83205 11.2899C6.55542 11.4754 6.21731 11.63 5.84846 11.7227C5.4796 11.8155 5.11075 11.8773 4.7419 11.8773H0.623047V3.34375H4.64968ZM4.40378 6.80664C4.7419 6.80664 5.01854 6.71389 5.2337 6.55932C5.44887 6.4047 5.54108 6.12643 5.54108 5.78632C5.54108 5.60081 5.51034 5.4153 5.44887 5.29163C5.38739 5.16795 5.29518 5.07519 5.17223 4.98244C5.04928 4.9206 4.92633 4.85876 4.77263 4.82784C4.61895 4.79693 4.46526 4.79692 4.28083 4.79692H2.49805V6.80664H4.40378ZM4.496 10.4551C4.68042 10.4551 4.86485 10.4241 5.01854 10.3932C5.17223 10.3623 5.32592 10.3005 5.44887 10.2077C5.57182 10.115 5.66403 10.0222 5.75624 9.86757C5.81772 9.71301 5.8792 9.52751 5.8792 9.31107C5.8792 8.8782 5.75625 8.56901 5.51034 8.35258C5.26444 8.16708 4.92633 8.07432 4.52673 8.07432H2.49805V10.4551H4.496ZM10.4284 10.4241C10.6743 10.6715 11.0431 10.7951 11.5349 10.7951C11.873 10.7951 12.1804 10.7024 12.4263 10.5478C12.6722 10.3623 12.8259 10.1768 12.8874 9.99126H14.3935C14.1476 10.7333 13.7788 11.259 13.287 11.5991C12.7952 11.9083 12.2112 12.0938 11.5042 12.0938C11.0124 12.0938 10.582 12.001 10.1825 11.8464C9.78286 11.6918 9.47548 11.4754 9.19886 11.1662C8.92223 10.8879 8.70705 10.5478 8.58411 10.1459C8.43042 9.74395 8.36892 9.31107 8.36892 8.81639C8.36892 8.35257 8.43042 7.9197 8.58411 7.51776C8.7378 7.11583 8.95298 6.7757 9.22961 6.46651C9.50623 6.18827 9.84436 5.94092 10.2132 5.78632C10.6128 5.63173 11.0124 5.53898 11.5042 5.53898C12.0267 5.53898 12.4878 5.63173 12.8874 5.84816C13.287 6.06459 13.5944 6.31195 13.8402 6.68295C14.0862 7.02308 14.2706 7.42501 14.3935 7.85789C14.455 8.29076 14.4857 8.72358 14.455 9.21833H9.99805C9.99805 9.71301 10.1825 10.1768 10.4284 10.4241ZM12.3649 7.1777C12.1497 6.96126 11.8115 6.83757 11.412 6.83757C11.1354 6.83757 10.9202 6.89939 10.7357 6.99214C10.5513 7.08489 10.4284 7.20857 10.3054 7.33226C10.1825 7.45595 10.121 7.61051 10.0902 7.76514C10.0595 7.9197 10.0288 8.04339 10.0288 8.16707H12.7952C12.7337 7.70326 12.58 7.39407 12.3649 7.1777ZM9.65992 3.9312H13.1025V4.76601H9.65992V3.9312Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
                {profile.socials.instagram && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="Instagram"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 15 15"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M8.1439 1.25C8.84728 1.25116 9.20372 1.25489 9.51172 1.26406L9.63303 1.26802C9.77315 1.273 9.9114 1.27925 10.0781 1.28706C10.7432 1.31779 11.1968 1.423 11.5953 1.57769C12.0072 1.73654 12.3552 1.95112 12.7025 2.29852C13.0494 2.64592 13.264 2.99487 13.4234 3.40581C13.5775 3.80373 13.6828 4.2579 13.714 4.923C13.7215 5.08967 13.7275 5.22792 13.7324 5.36807L13.7363 5.48937C13.7455 5.79734 13.7497 6.15383 13.751 6.85723L13.7515 7.32323C13.7515 7.38017 13.7515 7.43892 13.7515 7.49954L13.7515 7.67586L13.7511 8.14192C13.7499 8.84529 13.7462 9.20179 13.737 9.50973L13.733 9.63104C13.7281 9.77123 13.7218 9.90948 13.714 10.0761C13.6833 10.7412 13.5775 11.1949 13.4234 11.5933C13.2645 12.0053 13.0494 12.3532 12.7025 12.7006C12.3552 13.0475 12.0057 13.262 11.5953 13.4214C11.1968 13.5756 10.7432 13.6808 10.0781 13.712C9.9114 13.7195 9.77315 13.7255 9.63303 13.7304L9.51172 13.7344C9.20372 13.7435 8.84728 13.7477 8.1439 13.749L7.67784 13.7495C7.6209 13.7495 7.56215 13.7495 7.50153 13.7495H7.32522L6.85915 13.7491C6.15578 13.748 5.79929 13.7442 5.49132 13.735L5.37002 13.7311C5.22987 13.7261 5.09162 13.7199 4.92495 13.712C4.25985 13.6814 3.80672 13.5756 3.40777 13.4214C2.9963 13.2626 2.64787 13.0475 2.30047 12.7006C1.95308 12.3532 1.73902 12.0037 1.57964 11.5933C1.42495 11.1949 1.32027 10.7412 1.28902 10.0761C1.28159 9.90948 1.27553 9.77123 1.27063 9.63104L1.2667 9.50973C1.25755 9.20179 1.25338 8.84529 1.25203 8.14192L1.25195 6.85723C1.25312 6.15383 1.25683 5.79734 1.266 5.48937L1.26997 5.36807C1.27495 5.22792 1.2812 5.08967 1.28902 4.923C1.31974 4.25737 1.42495 3.80425 1.57964 3.40581C1.73849 2.99436 1.95308 2.64592 2.30047 2.29852C2.64787 1.95112 2.99683 1.73706 3.40777 1.57769C3.8062 1.423 4.25933 1.31831 4.92495 1.28706C5.09162 1.27964 5.22987 1.27359 5.37002 1.26868L5.49132 1.26475C5.79929 1.2556 6.15578 1.25143 6.85915 1.25008L8.1439 1.25ZM7.50153 4.37456C5.7747 4.37456 4.37652 5.77427 4.37652 7.49954C4.37652 9.22636 5.77622 10.6245 7.50153 10.6245C9.22834 10.6245 10.6265 9.22486 10.6265 7.49954C10.6265 5.77275 9.22678 4.37456 7.50153 4.37456ZM7.50153 5.62456C8.53709 5.62456 9.37653 6.46373 9.37653 7.49954C9.37653 8.53511 8.53734 9.37454 7.50153 9.37454C6.46597 9.37454 5.62652 8.53542 5.62652 7.49954C5.62652 6.46398 6.46565 5.62456 7.50153 5.62456ZM10.7828 3.43706C10.352 3.43706 10.0015 3.78701 10.0015 4.21778C10.0015 4.64856 10.3515 4.99904 10.7828 4.99904C11.2135 4.99904 11.564 4.64911 11.564 4.21778C11.564 3.78701 11.213 3.43652 10.7828 3.43706Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
                {profile.socials.github && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="GitHub"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 16 16"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
                {profile.socials.x && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="X"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 24 24"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
                {profile.socials.facebook && (
                  <div
                    data-reveal="div"
                    role="listitem"
                    className="social-item w-dyn-item"
                  >
                    <a
                      data-haptic="medium"
                      href={profile.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-item-inner w-inline-block"
                      aria-label="Facebook"
                    >
                      <div className="icon-wrap is-15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          viewBox="0 0 24 24"
                          fill="none"
                          preserveAspectRatio="none"
                          height="100%"
                          className="svg"
                        >
                          <path
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"
                            fill="currentColor"
                            className="path"
                          ></path>
                        </svg>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email button */}
          <div
            id="w-node-a204f672-ea1b-c502-70d3-3fa0032bc8ea-032bc8db"
            className="foooter-mail"
          >
            <div data-reveal="text" className="p1">
              Available for
              <br />
              video projects
            </div>
            <div className="footer-mail-inner">
              <div className="opacity-0-5">
                <div data-reveal="div" className="p1">
                  Write directly to:
                </div>
              </div>
              <a
                data-haptic="medium"
                data-reveal="div"
                data-link-trigger=""
                href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=${profile.email}&subject=%5BProject%20Inquiry%5D%20Hello`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button left-offset w-inline-block"
              >
                <div className="link-inner">
                  <div data-link="shadow" className="p1 is-2">
                    {profile.email}
                  </div>
                  <div data-link="label" className="p1">
                    {profile.email}
                  </div>
                </div>
              </a>
              <div data-reveal="div" className="p1" style={{ marginTop: 8 }}>
                {profile.phone} · {profile.website}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer meta */}
      <div className="m-footer-inner is-mobile">
        <div className="m-footer-inner-wrap">
          <div className="m-footer-name">
            <div data-reveal="text" className="h1 is-display">
              {profile.lastName.toLowerCase()}
            </div>
          </div>
          <div className="m-footer-meta">
            <div data-reveal="text" className="p1">
              {profile.copyrightYear} © All Right Reserved
            </div>
            <div data-reveal="text" className="p1">
              Jhapa, Nepal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
