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
    project: "KHARAAYO INC. — Video Editor",
    awards: [
      {
        platform: "Video Editing",
        title: "Broadcast-Quality Delivery",
      },
      {
        platform: "Color Grading",
        title: "Cinematic Final Look",
      },
      {
        platform: "Motion Graphics",
        title: "CTA & Title Design",
      },
      {
        platform: "Audio Mixing",
        title: "Sound Design & Mix",
      },
    ],
  },
  {
    year: "'23–'27",
    project: "BCA — Mechi Multiple Campus",
    awards: [
      {
        platform: "Education",
        title: "Bachelor of Computer Application",
      },
      {
        platform: "Tools",
        title: "DaVinci Resolve · Premiere Pro · After Effects",
      },
      {
        platform: "Tools",
        title: "CapCut · Figma · Canva · Affinity",
      },
    ],
  },
  {
    year: "'24",
    project: "Certifications",
    awards: [
      {
        platform: "Certified",
        title: "Video Editing Fundamentals",
      },
      {
        platform: "Certified",
        title: "Motion Graphics Essentials",
      },
      {
        platform: "Certified",
        title: "Color Correction",
      },
    ],
  },
];
