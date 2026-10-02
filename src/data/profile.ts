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
  socials: {
    linkedin: string;
    behance: string;
    instagram: string;
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
  firstName: "Maksym",
  lastName: "Bleibtgleich",
  role: "UX/UI Designer & Developer",
  location: "Based in Kyiv",
  company: {
    name: "TFTL",
    url: "https://thefirstthelast.agency/?utm_source=bleibtgleich&utm_medium=article&utm_campaign=promo",
  },
  heroHeadings: {
    line1: "Design",
    line2: "Digital",
    line3: "Products,",
    line4: "UX/UI",
    line5: "& Web-flow dev.",
  },
  heroBio:
    "Designs and builds websites, products, and digital systems with a focus on clarity, performance, and usability.",
  heroMotto: {
    line1: "the",
    line2: "best",
    line3: "ideas deserve",
    line4: "execution.",
  },
  email: "hi.bleibtgleich@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/bleibtgleich/",
    behance: "https://www.behance.net/bleibtgleich",
    instagram: "https://www.instagram.com/bleibtgleich/",
  },
  footerQuote: {
    line1: "Everything",
    line2: "that exists",
    line3: "had first",
    line4: "existed as",
    line5: "nothing",
    line6: "more",
    line7: "than a",
    line8: "sentence.",
  },
  copyrightYear: "‘26",
};
