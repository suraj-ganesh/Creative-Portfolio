export interface OrbitCard {
  title: string;
  image: string;
  link?: string;
}

export const defaultOrbitCards: OrbitCard[] = [
  {
    title: "Social Media Campaign Series",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80&auto=format&fit=crop",
    link: "/works/social-media-campaign",
  },
  {
    title: "Product Promo Video",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
    link: "/works/product-promo-video",
  },
  {
    title: "Color Grading Showcase",
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80&auto=format&fit=crop",
    link: "/works/color-grading-showcase",
  },
  {
    title: "Motion Graphics Package",
    image:
      "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?w=800&q=80&auto=format&fit=crop",
    link: "/works/motion-graphics-package",
  },
];
