export interface OrbitCard {
  title: string;
  image: string;
  link?: string;
  /** Direct video file for the tile. When present the tile renders a
   *  muted looping <video> (poster = image) instead of a plain <img>. */
  videoSrc?: string;
  /** Native aspect of the source — vertical clips are 9:16. Defaults
   *  to vertical since most portfolio clips are 720x1280 / 1080x1920. */
  aspect?: "9:16" | "16:9";
}

export const defaultOrbitCards: OrbitCard[] = [
  {
    title: "Draw With Me (part1)",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80&auto=format&fit=crop",
    link: "/works/social-media-campaign",
    videoSrc: "/Videos/Draw%20With%20Me%20%28part1%29.mp4",
    aspect: "9:16",
  },
  {
    title: "Draw With Me (part2)",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
    link: "/works/product-promo-video",
    videoSrc: "/Videos/Draw%20With%20Me%20%28part2%29.mp4",
    aspect: "9:16",
  },
  {
    title: "Tech Team Intro",
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80&auto=format&fit=crop",
    link: "/works/color-grading-showcase",
    videoSrc: "/Videos/Tech%20Team%20Intro.mp4",
    aspect: "9:16",
  },
  {
    title: "Aastha Paperflies Promo",
    image:
      "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?w=800&q=80&auto=format&fit=crop",
    link: "/works/motion-graphics-package",
    videoSrc: "/Videos/Aastha%20Paperflies%20Promo.mp4",
    aspect: "9:16",
  },
];
