import HomeHero from "@/components/home/HomeHero";
import FeaturedWork from "@/components/home/FeaturedWork";
import AwardsSection from "@/components/home/AwardsSection";
import Footer from "@/components/Footer";
import ThemeChangeOverlay from "@/components/ThemeChangeOverlay";

// NOTE: no per-page `metadata` here on purpose. Page-level head elements
// are deleted/re-inserted by React on every SPA navigation, and a dropped
// insertion leaves a detached hoistable fiber behind — the next navigation's
// commit then crashes in removeChild and bricks routing. All head content
// lives once in the root layout so route commits never touch <head>.

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
