export interface OrbitCard {
  title: string;
  image: string;
  link?: string;
  mediaType?: "video" | "poster";
  /** Direct video file for the tile. When present the tile renders a
   *  muted looping <video> (poster = image) instead of a plain <img>. */
  videoSrc?: string;
  /** Native aspect of the source — vertical clips are 9:16. Defaults
   *  to vertical since most portfolio clips are 720x1280 / 1080x1920. Posters use 3:4. */
  aspect?: "9:16" | "16:9" | "3:4";
}

export const defaultOrbitCards: OrbitCard[] = [
  {
    title: "Draw With Me (part1)",
    image:
      "/images/posters/social-media-campaign.jpg",
    link: "/works/social-media-campaign",
    videoSrc: "/Videos/Draw%20With%20Me%20%28part1%29.mp4",
    mediaType: "video",
    aspect: "9:16",
  },
  {
    title: "Draw With Me (part2)",
    image:
      "/images/posters/product-promo-video.jpg",
    link: "/works/product-promo-video",
    videoSrc: "/Videos/Draw%20With%20Me%20%28part2%29.mp4",
    mediaType: "video",
    aspect: "9:16",
  },
  {
    title: "Tech Team Intro",
    image:
      "/images/posters/color-grading-showcase.jpg",
    link: "/works/color-grading-showcase",
    videoSrc: "/Videos/Tech%20Team%20Intro.mp4",
    mediaType: "video",
    aspect: "9:16",
  },
  {
    title: "Aastha Paperflies Promo",
    image:
      "/images/posters/motion-graphics-package.jpg",
    link: "/works/motion-graphics-package",
    videoSrc: "/Videos/Aastha%20Paperflies%20Promo.mp4",
    mediaType: "video",
    aspect: "9:16",
  },
  {
    title: "Buddha Jayanti Poster",
    image:
      "/images/posters/BuddhaJayantiPaperflies.webp",
    link: "/works/buddha-jayanti-paperflies",
    mediaType: "poster",
    aspect: "3:4",
  },
  {
    title: "Card Design",
    image:
      "/images/posters/CardDesign.webp",
    link: "/works/card-design",
    mediaType: "poster",
    aspect: "3:4",
  },
  {
    title: "Dashain 1",
    image:
      "/images/posters/Dashain1.webp",
    link: "/works/dashain-1",
    mediaType: "poster",
    aspect: "3:4",
  },
  {
    title: "Leap Board 1",
    image:
      "/images/posters/LeapBoard1.webp",
    link: "/works/leap-board-1",
    mediaType: "poster",
    aspect: "3:4",
  },
];