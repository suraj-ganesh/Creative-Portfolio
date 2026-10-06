import { cv } from "@/data/cv";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

/**
 * On-screen CV document shown in the CV popup's view mode. The Download
 * button in the popup toolbar saves this same content as a PDF file.
 */
export default function CvDocument() {
  return (
    <article className="cv-doc" aria-label={`${cv.name} — CV`}>
      <header className="cv-doc__header">
        <div>
          <h1 className="cv-doc__name">{cv.name}</h1>
          <p className="cv-doc__role">{cv.role}</p>
        </div>
        <ul className="cv-doc__contact">
          <li>
            <span className="cv-doc__icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            {cv.phone}
          </li>
          <li>
            <span className="cv-doc__icon" aria-hidden="true">
              <MailIcon />
            </span>
            {cv.email}
          </li>
          <li>
            <span className="cv-doc__icon" aria-hidden="true">
              <GlobeIcon />
            </span>
            {cv.website}
          </li>
        </ul>
      </header>

      <div className="cv-doc__rule" aria-hidden="true" />

      <section>
        <h2 className="cv-doc__section">Professional Summary</h2>
        <p className="cv-doc__body">{cv.summary}</p>
      </section>

      <div className="cv-doc__rule" aria-hidden="true" />

      <div className="cv-doc__cols">
        <div>
          <section>
            <h2 className="cv-doc__section">Skills</h2>
            <ul className="cv-doc__list">
              {cv.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="cv-doc__section">Tools</h2>
            <ul className="cv-doc__list">
              {cv.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        </div>
        <div>
          <section>
            <h2 className="cv-doc__section">Work Experience</h2>
            {cv.experience.map((job) => (
              <div key={`${job.org}-${job.period}`} className="cv-doc__job">
                <p className="cv-doc__job-title">{job.title}</p>
                <p className="cv-doc__job-org">
                  {job.org} | {job.period}
                </p>
                <ul className="cv-doc__bullets">
                  {job.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="cv-doc__rule" aria-hidden="true" />

      <div className="cv-doc__cols">
        <div>
          <section>
            <h2 className="cv-doc__section">Education</h2>
            {cv.education.map((e) => (
              <div key={e.degree} className="cv-doc__edu">
                <p className="cv-doc__edu-degree">{e.degree}</p>
                <p className="cv-doc__body">{e.school}</p>
                <p className="cv-doc__body">{e.period}</p>
              </div>
            ))}
          </section>
        </div>
        <div>
          <section>
            <h2 className="cv-doc__section">Projects</h2>
            {cv.projects.map((p) => (
              <div key={p.title} className="cv-doc__job">
                <p className="cv-doc__job-title">{p.title}</p>
                <p className="cv-doc__body">{p.description}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </article>
  );
}
