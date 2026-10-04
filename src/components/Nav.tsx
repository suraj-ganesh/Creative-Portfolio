export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div data-prevent-flicker="" data-nav="grid" className="nav-grid"></div>
        <div data-haptic="medium" data-nav="button" data-prevent-flicker="" className="nav-button">
          <div className="link-inner">
            <div data-link="label" data-nav="label" className="p1">Menu</div>
            <div data-link="shadow" data-nav="label" className="p1 is-2">Menu</div>
          </div>
        </div>
        <div data-nav="link-group" className="nav-menu">
          <a
            data-haptic="medium"
            data-nav="link"
            data-link-trigger=""
            data-wf--menu-link--type="home"
            href="/"
            className="menu-link w-inline-block"
          >
            <div data-nav="indicator" className="menu-indicator">
              <div className="p1">1</div>
            </div>
            <div className="menu-link-inner">
              <div className="link-inner">
                <div data-link="label" className="h2">Home</div>
                <div data-link="shadow" className="h2 is-2">Home</div>
              </div>
            </div>
          </a>
          <a
            data-haptic="medium"
            data-nav="link"
            data-link-trigger=""
            data-wf--menu-link--type="works"
            href="/work"
            className="menu-link w-inline-block"
          >
            <div data-nav="indicator" className="menu-indicator">
              <div className="p1">2</div>
            </div>
            <div className="menu-link-inner">
              <div className="link-inner">
                <div data-link="label" className="h2">Work</div>
                <div data-link="shadow" className="h2 is-2">Work</div>
              </div>
            </div>
          </a>
          <a
            data-haptic="medium"
            data-nav="link"
            data-link-trigger=""
            data-wf--menu-link--type="contact"
            href="/contact"
            className="menu-link w-inline-block"
          >
            <div data-nav="indicator" className="menu-indicator">
              <div className="p1">3</div>
            </div>
            <div className="menu-link-inner">
              <div className="link-inner">
                <div data-link="label" className="h2">Contact</div>
                <div data-link="shadow" className="h2 is-2">Contact</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </nav>
  );
}
