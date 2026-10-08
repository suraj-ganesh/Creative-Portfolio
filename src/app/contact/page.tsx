import ContactGravity from "@/components/contact/ContactGravity";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

// NOTE: no per-page `metadata` — see src/app/page.tsx. Head stays static
// across SPA navigations so React never deletes/re-inserts hoistables.

export default function ContactPage() {
  return (
    <main
      data-page="contact"
      className="transition-container"
    >
      <div className="page-wrap">
        <ContactGravity />
        <ThemeChangeOverlay />
      </div>
    </main>
  );
}
