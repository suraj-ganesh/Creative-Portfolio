import type { Metadata } from "next";
import { profile } from "@/data/profile";
import HomeHero from "@/components/home/HomeHero";
import FeaturedWork from "@/components/home/FeaturedWork";
import AwardsSection from "@/components/home/AwardsSection";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

export const metadata: Metadata = {
  title: "Suraj Ganesh",
  description: profile.heroBio,
};

export default function Home() {
  return (
    <main
      data-page="home"
      className="transition-container"
    >
      <HomeHero />
      <FeaturedWork />
      <AwardsSection />
      <Footer />
      <ThemeChangeOverlay />
    </main>
  );
}
