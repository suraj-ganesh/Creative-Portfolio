export interface AwardItem {
  platform: string;
  title: string;
  certificateImage?: string;
  certificateAlt?: string;
}

export interface AwardGroup {
  year: string;
  project: string;
  awards: AwardItem[];
}

export const awardsData: AwardGroup[] = [
  {
    year: "'25",
    project: "bleibtgleich'25",
    awards: [
      {
        platform: "CSS Winner",
        title: "Site of the Day",
        certificateImage:
          "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbd21e05930273ded153f_award-certificate-awwwards-sotd.avif",
        certificateAlt:
          "CSS Winner Site of the Day certificate for bleibtgleich'25",
      },
      {
        platform: "GSAP",
        title: "Site of the Day",
      },
      {
        platform: "Awwwards",
        title: "Portfolio Honors",
        certificateImage:
          "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbd2e75a580cbbca15946_award-certificate-awwwards-portfolio-honor.avif",
        certificateAlt:
          "Awwwards Portfolio Honors certificate for bleibtgleich'25",
      },
      {
        platform: "Awwwards",
        title: "Site of the Day",
        certificateImage:
          "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbd1a2ccd53eb1d71aa1f_award-certificate-awwwards-sotd-1.avif",
        certificateAlt:
          "Awwwards Site of the Day certificate for bleibtgleich'25",
      },
      {
        platform: "CSS Design Awards",
        title: "WOTD",
        certificateImage:
          "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbd29fb1e855014fc9e5b_award-certificate-awwwards-word.avif",
        certificateAlt:
          "CSS Design Awards Website of the Day certificate for bleibtgleich'25",
      },
    ],
  },
  {
    year: "'24",
    project: "insta.gallery",
    awards: [
      {
        platform: "Awwwards",
        title: "Typography Honor",
        certificateImage:
          "https://cdn.prod.website-files.com/6a36a3fb2e061ee276a4e112/6a5fbeb47d8da1d658ca6bd5_instagallery-award_certificate_awwwards-typography_honor.avif",
        certificateAlt: "Awwwards Typography Honor certificate for insta.gallery",
      },
    ],
  },
  {
    year: "'23",
    project: "bleibtgleich'23",
    awards: [
      {
        platform: "Behance",
        title: "BR",
      },
      {
        platform: "Behance",
        title: "UI",
      },
    ],
  },
];
