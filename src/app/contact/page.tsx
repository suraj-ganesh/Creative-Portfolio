import type { Metadata } from "next";
import ContactGravity from "@/components/contact/ContactGravity";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: "Suraj Ganesh",
  description:
    "Write directly. Email surajganesh404@gmail.com for commissions and collaborations.",
};

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
