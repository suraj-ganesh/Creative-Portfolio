import WorkGrid from "@/components/work/WorkGrid";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

// NOTE: no per-page `metadata` — see src/app/page.tsx. Head stays static
// across SPA navigations so React never deletes/re-inserts hoistables.

export default function WorkPage() {
  return (
    <main
      data-page="works"
      className="transition-container"
    >
      <div className="page-wrap">
        <WorkGrid />
        <Footer />
        <ThemeChangeOverlay />
      </div>
    </main>
  );
}
