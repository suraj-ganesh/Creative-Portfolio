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
    slug: "social-media-campaign",
    title: "Social Media Campaign Series",
    type: "Case",
    category: "Short-form Promo & Social",
    year: "'25",
    coverImage:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80&auto=format&fit=crop",
    description:
      "Produced and edited a series of short-form promotional videos designed to increase audience engagement across digital platforms.",
    services: ["DaVinci Resolve", "Premiere Pro", "Short-form Edit"],
    client: "KHARAAYO INC.",
    featured: true,
  },
  {
    slug: "product-promo-video",
    title: "Product Promo Video",
    type: "Case",
    category: "Commercial & Promo",
    year: "'25",
    coverImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
    description:
      "Produced a short promotional video showing a product's features and benefits, with sound design and call-to-action graphics.",
    services: ["Video Editing", "Sound Design", "Motion Graphics"],
    client: "KHARAAYO INC.",
    featured: true,
  },
  {
    slug: "color-grading-showcase",
    title: "Color Grading Showcase",
    type: "Case",
    category: "Color Correction & Grading",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200&q=80&auto=format&fit=crop",
    description:
      "Graded footage in DaVinci Resolve to set a cinematic mood, match shots and deliver a consistent final look.",
    services: ["DaVinci Resolve", "Color Correction", "Color Grading"],
    featured: true,
  },
  {
    slug: "motion-graphics-package",
    title: "Motion Graphics Package",
    type: "Shot",
    category: "Motion Design",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?w=1200&q=80&auto=format&fit=crop",
    description:
      "Animated titles, lower-thirds and call-to-action graphics in After Effects for digital channels and brand campaigns.",
    services: ["After Effects", "Motion Graphics", "Visual Storytelling"],
    featured: true,
  },
  {
    slug: "audio-mix-sound-design",
    title: "Audio Mix & Sound Design",
    type: "Shot",
    category: "Audio Editing & Mixing",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80&auto=format&fit=crop",
    description:
      "Dialogue cleanup, music-bed mixing and sound design to deliver broadcast-quality final outputs on deadline.",
    services: ["Audio Editing", "Audio Mixing"],
    featured: true,
  },
  {
    slug: "brand-story-edit",
    title: "Brand Story Edit",
    type: "Case",
    category: "Brand & Storytelling",
    year: "'25",
    coverImage:
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&q=80&auto=format&fit=crop",
    description:
      "Collaborated with creative teams to align visual storytelling with brand guidelines and audience expectations for Kharaayo Inc.",
    services: ["Video Editing", "Visual Storytelling", "CapCut"],
    client: "KHARAAYO INC.",
    featured: true,
  },
  {
    slug: "short-film-cut",
    title: "Short Film Cut",
    type: "Case",
    category: "Narrative & Pacing",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80&auto=format&fit=crop",
    description:
      "Edited a short narrative piece — pacing, continuity and dialogue rhythm cut in Premiere Pro with temp sound design.",
    services: ["Premiere Pro", "Visual Storytelling", "Audio Editing"],
    featured: true,
  },
  {
    slug: "travel-vlog-edit",
    title: "Travel Vlog Edit",
    type: "Shot",
    category: "Vlog & Social",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format&fit=crop",
    description:
      "Fast-paced travel vlog edit with beat-synced cuts, speed ramps and a warm cinematic grade.",
    services: ["Premiere Pro", "Color Grading", "CapCut"],
    featured: true,
  },
  {
    slug: "tutorial-course-edit",
    title: "Tutorial & Course Edit",
    type: "Shot",
    category: "Educational",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&q=80&auto=format&fit=crop",
    description:
      "Clean tutorial edit — filler removal, zoom callouts and chapter pacing for an online course module.",
    services: ["Video Editing", "Motion Graphics"],
    featured: true,
  },
  {
    slug: "bts-edit",
    title: "Behind-the-Scenes Edit",
    type: "Shot",
    category: "Documentary & Social",
    year: "'25",
    coverImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80&auto=format&fit=crop",
    description:
      "Candid behind-the-scenes cut assembled from multi-cam coverage for social release.",
    services: ["DaVinci Resolve", "Audio Mixing"],
    client: "KHARAAYO INC.",
    featured: true,
  },
  {
    slug: "trailer-recut",
    title: "Trailer Recut",
    type: "Shot",
    category: "Promo & Practice",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80&auto=format&fit=crop",
    description:
      "Practice trailer recut — restructuring existing footage into a 45-second tension arc with new sound design.",
    services: ["Video Editing", "Sound Design"],
    featured: true,
  },
  {
    slug: "marketing-promo-edit",
    title: "Marketing Promo Edit",
    type: "Shot",
    category: "Commercial & Promo",
    year: "'24",
    coverImage:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80&auto=format&fit=crop",
    description:
      "Promo cut for a marketing campaign — offer pacing, kinetic text callouts and a hard-CTA ending.",
    services: ["Premiere Pro", "Motion Graphics", "CapCut"],
    featured: true,
  },
];
