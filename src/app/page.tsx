import type { Metadata } from "next";
import { profile } from "@/data/profile";
import Hero from "@/components/home/Hero";
import FeaturedWork from "@/components/home/FeaturedWork";
import AwardsSection from "@/components/home/AwardsSection";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: `${profile.lastName.toLowerCase()} - ${profile.role}`,
  description: profile.heroBio,
};

export default function Home() {
  return (
    <main
      data-page="home"
      className="transition-container"
    >
      <Hero />
      <FeaturedWork />
      <AwardsSection />
      <Footer />
      <ThemeChangeOverlay />
    </main>
  );
}
