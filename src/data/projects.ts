export interface Project {
  slug: string;
  title: string;
  type: "Case" | "Shot";
  category?: string;
  year: string;
  coverImage: string;
  description: string;
  services?: string[];
  client?: string;
  liveUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "velor-app",
    title: "Velor Dating App",
    type: "Case",
    category: "Product Design & UX",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a6ba34a52217319fe1fbd57_img-cover-velor-app.avif",
    description:
      "Velor Dating is a dual-mode dating app that adapts to everything from traditional dating to niche relationship preferences through Angel and Demon experiences.",
    services: ["UX/UI Design", "Mobile App", "Interaction Design"],
    featured: true,
  },
  {
    slug: "bleibtgleich25",
    title: "bleibtgleich'25",
    type: "Case",
    category: "Creative Development",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660df2554cadd26cc0e5f4_img-cover-bleibtgleich-25.avif",
    description:
      "Refined by obsession, driven by precision. bleibtgleich.'25 portfolio site featuring WebGL, GSAP, and brutalist typography.",
    services: ["Art Direction", "Creative Development", "WebGL"],
    featured: true,
  },
  {
    slug: "jds",
    title: "JDS",
    type: "Case",
    category: "Web Design",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660dd9f64b053327a540d1_img-cover-jds.avif",
    description:
      "Digital presence and website architecture for JDS architecture and interior design studio.",
    services: ["Web Design", "UI/UX", "Webflow Dev"],
    featured: true,
  },
  {
    slug: "nabil-issa",
    title: "Nabil Issa",
    type: "Case",
    category: "Portfolio & Editorial",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660dcf6a5afe2ac40d6100_img-cover-nabil-issa-concept.avif",
    description:
      "Concept portfolio and editorial experience showcasing automotive photography and storytelling.",
    services: ["Editorial Design", "Interaction Design", "Concept"],
    featured: true,
  },
  {
    slug: "grabl-app",
    title: "Grabl App",
    type: "Case",
    category: "Product Design",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660dfa6a5afe2ac40d6bc7_img-cover-grabl-app.avif",
    description:
      "Social media utility app designed for fast content curation, saving, and seamless sharing across platforms.",
    services: ["Mobile App", "UI Design", "Branding"],
    featured: true,
  },
  {
    slug: "mkaan",
    title: "Mkaan",
    type: "Case",
    category: "Real Estate & Web",
    year: "'25",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a763729d43e0aa8e4d7f402_mkaan-cover_converted.avif",
    description:
      "Modern real estate ecosystem platform connecting property buyers, developers, and brokers across the Middle East.",
    services: ["Platform Design", "Design System", "Development"],
    featured: true,
  },
  {
    slug: "durak-concept",
    title: "Durak Miniapp",
    type: "Shot",
    category: "Game Concept",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e042e5ac3690957fa67_img-cover-fool-miniapp.avif",
    description:
      "Minimalist card game UI concept with crisp haptics, physics animations, and dark tactile materials.",
    services: ["UI Concept", "Game Design"],
    featured: true,
  },
  {
    slug: "metrics-over-aesthetics",
    title: "Metrics over aesthetics",
    type: "Shot",
    category: "Typography & Poster",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e0b36062aa76138a9d1_img-cover-metrics-over-aesthetics.avif",
    description:
      "Experimental visual exploration criticizing conversion-obsessed metrics and celebrating brutal craft.",
    services: ["Poster Design", "Typography"],
    featured: true,
  },
  {
    slug: "do-lorem-ipsum",
    title: "Do Lorem Ipsum",
    type: "Shot",
    category: "Typography",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e1b36062aa76138ac6b_img-cover-do-lorem-ipsum.avif",
    description:
      "Type specimen experiment exploring classic typesetting rules against modern generative design tools.",
    services: ["Graphic Design", "Typography"],
    featured: true,
  },
  {
    slug: "cybernation-merch",
    title: "Cybernation Merch",
    type: "Case",
    category: "E-Commerce",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e2312af271ff52c6ab5_img-cover-cybernation.avif",
    description:
      "Concept store for an independent Ukrainian game studio, blending bold cyberpunk aesthetics with an intuitive checkout flow.",
    services: ["E-Commerce", "UI Design", "3D Renders"],
    featured: true,
  },
  {
    slug: "grabl-app-logo",
    title: "Grabl App Logo",
    type: "Shot",
    category: "Branding & Identity",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e29f6f7472625bc9e17_img-cover-grabl-app-logo.avif",
    description:
      "Identity and dynamic logo animation created for Grabl mobile curation utility.",
    services: ["Logo Design", "Motion"],
    featured: true,
  },
  {
    slug: "xpm",
    title: "XPM Logo",
    type: "Shot",
    category: "Identity",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a660e3368a1aa809715cbdd_img-cover-xpm-platform.avif",
    description:
      "Monogram identity and emblem design for extreme performance engineering group.",
    services: ["Brand Identity", "Vector Craft"],
    featured: true,
  },
  {
    slug: "insta-gallery",
    title: "insta.gallery",
    type: "Case",
    category: "Creative Web",
    year: "'24",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbeb47d8da1d658ca6bd5_instagallery-award_certificate_awwwards-typography_honor.avif",
    description:
      "Curated visual showcase and typography experience awarded Awwwards Typography Honor 2024.",
    services: ["Webflow", "Typography", "Art Direction"],
    featured: false,
  },
  {
    slug: "bleibtgleich23",
    title: "bleibtgleich'23",
    type: "Case",
    category: "Portfolio",
    year: "'23",
    coverImage:
      "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a6ba34a52217319fe1fbd57_img-cover-velor-app.avif",
    description:
      "First generation portfolio project recognized on Behance with Best of Behance and UI badges.",
    services: ["Portfolio", "Visual Design"],
    featured: false,
  },
];
