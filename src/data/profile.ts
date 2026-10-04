export interface Profile {
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  company: {
    name: string;
    url: string;
  };
  heroHeadings: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
  };
  heroBio: string;
  heroMotto: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  email: string;
  phone: string;
  website: string;
  socials: {
    linkedin?: string;
    behance?: string;
    instagram?: string;
    facebook?: string;
    github?: string;
    x?: string;
  };
  footerQuote: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
    line6: string;
    line7: string;
    line8: string;
  };
  copyrightYear: string;
}

export const profile: Profile = {
  firstName: "Suraj",
  lastName: "Ganesh",
  role: "Video Editor & Colorist",
  location: "Based in Jhapa",
  company: {
    name: "KHARAAYO INC.",
    url: "https://surajganesh.com.np",
  },
  heroHeadings: {
    line1: "Edit",
    line2: "Cinematic",
    line3: "Stories,",
    line4: "Color",
    line5: "& Motion graphics.",
  },
  heroBio:
    "Video Editor producing digital content for media — skilled in DaVinci Resolve, Premiere Pro and After Effects, with a strong command of color grading, motion graphics and audio mixing.",
  heroMotto: {
    line1: "every",
    line2: "cut",
    line3: "tells a",
    line4: "story.",
  },
  email: "surajganesh404@gmail.com",
  phone: "+977 9745867068",
  website: "surajganesh.com.np",
  socials: {
    linkedin: "",
    behance: "",
    instagram: "",
    facebook: "",
    github: "",
    x: "",
  },
  footerQuote: {
    line1: "Every",
    line2: "story",
    line3: "starts as",
    line4: "raw footage",
    line5: "waiting",
    line6: "for",
    line7: "the",
    line8: "final cut.",
  },
  copyrightYear: "‘26",
};
