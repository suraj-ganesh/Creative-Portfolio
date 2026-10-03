export default function StickyName() {
  return (
    <section className="sticky-name">
      <div data-preloader="count" className="count">0%</div>
      <div className="sticky-name-inner">
        <div data-sticky-name="" className="name-part-wrap is-left">
          <div className="h1">suraj</div>
        </div>
        <div data-sticky-name="" className="name-part-wrap is-right">
          <div className="h1">ganesh</div>
        </div>
      </div>
      <div className="sticky-name-meta">
        <div data-prevent-flicker="" data-sticky-meta="text" className="p1">
          ‘26 © All Right Reserved
        </div>
        <div data-prevent-flicker="" data-sticky-meta="text" className="p1">
          Jhapa, Nepal
        </div>
      </div>
    </section>
  );
}
