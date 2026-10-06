export interface CvExperience {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface CvEducation {
  degree: string;
  school: string;
  period: string;
}

export interface CvProject {
  title: string;
  description: string;
}

export const cv = {
  name: "Suraj Ganesh",
  role: "Video Editor",
  phone: "+977 9745867068",
  email: "surajganesh404@gmail.com",
  website: "surajganesh.com.np",
  summary:
    "Video Editor with hands-on experience producing digital content for a media organization. Skilled in DaVinci Resolve, Adobe Premiere Pro and After Effects, with a strong command of color grading, motion graphics and audio mixing. Works well with creative teams to deliver brand-aligned, broadcast-quality videos on deadline. Currently pursuing a BCA at Mechi Multiple Campus, Jhapa.",
  skills: [
    "Video Editing",
    "Motion Graphics",
    "Visual Storytelling",
    "Color Correction & Grading",
    "Audio Editing",
  ],
  tools: [
    "DaVinci Resolve",
    "Adobe Premiere Pro",
    "Capcut",
    "Figma",
    "Canva",
    "Affinity",
  ],
  experience: [
    {
      title: "Video Editor",
      org: "Freelance / Learning",
      period: "2024 – 2025",
      bullets: [
        "Executed freelance video projects from concept to final cut while continuously mastering advanced techniques in DaVinci Resolve and Adobe Premiere Pro.",
        "Expanded technical skill sets independently in color grading, motion graphics, and audio mixing to deliver broadcast-quality assets for diverse client portfolios.",
      ],
    },
    {
      title: "Video Editor",
      org: "Kharaayo Inc.",
      period: "2025 – Present",
      bullets: [
        "Produced and edited video content for the organization's digital channels using DaVinci Resolve and Adobe Premiere Pro.",
        "Applied color grading, motion graphics, and audio mixing to deliver broadcast quality final outputs.",
        "Collaborated with creative teams to align visual storytelling with brand guidelines and audience expectations.",
        "Managed asset libraries, project timelines, and iterative review cycles to meet publishing deadlines.",
      ],
    },
  ] as CvExperience[],
  education: [
    {
      degree: "Bachelor of Computer Application",
      school: "Mechi Multiple Campus",
      period: "2023 – Present",
    },
    {
      degree: "Higher Secondary Education (Science)",
      school: "St. Xavier's School, Deonia",
      period: "2021 – 2023",
    },
  ] as CvEducation[],
  projects: [
    {
      title: "Social Media Campaign Series",
      description:
        "Produced and edited a series of short-form promotional videos designed to increase audience engagement across digital platforms.",
    },
    {
      title: "Product Promo Video",
      description:
        "Produced a short promotional video showing a product's features and benefits, with sound design and call-to-action graphics.",
    },
    {
      title: "Color Grading Showcase",
      description:
        "Graded footage in DaVinci Resolve to set a cinematic mood, match shots and deliver a consistent final look.",
    },
  ] as CvProject[],
};
