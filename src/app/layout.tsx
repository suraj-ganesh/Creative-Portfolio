import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeLever from "@/components/ThemeLever";
import GridWrap from "@/components/GridWrap";
import StickyName from "@/components/StickyName";
import CustomScrollbar from "@/components/CustomScrollbar";
import InitialLoader from "@/components/InitialLoader";
import CvButton from "@/components/CvButton";
import { ThemeProvider } from "@/lib/theme";
import SiteFx from "@/components/SiteFx";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Suraj Ganesh",
  description:
    "Suraj Ganesh is a Video Editor based in Jhapa, working with KHARAAYO INC. Skilled in DaVinci Resolve, Premiere Pro and After Effects — color grading, motion graphics and audio mixing.",
  openGraph: {
    title: "Suraj Ganesh",
    description:
      "Video Editor producing broadcast-quality videos — color grading, motion graphics and audio mixing. BCA at Mechi Multiple Campus, Jhapa.",
    url: "https://surajganesh.com.np/",
    siteName: "surajganesh",
    images: [
      {
        url: "https://surajganesh.com.np/images/posters/color-grading-showcase.jpg",
        width: 1200,
        height: 620,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suraj Ganesh",
    description:
      "Video Editor producing broadcast-quality videos — color grading, motion graphics and audio mixing.",
  },
  icons: {
    icon: "/images/hero-mark-icon.png",
    apple: "/images/hero-mark-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-mod-js" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.prod.website-files.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Mobile LCP: hero mark is the largest above-fold paint on phones.
            Preload is paint-only, no visual/layout change on any viewport. */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-mark.png"
          fetchPriority="high"
        />
        <link rel="icon" type="image/png" href="/images/hero-mark-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var v = sessionStorage.getItem("theme-mode") || "base";
                  var c = { base: "theme-mode-base", 1: "theme-mode-1", 2: "theme-mode-2", 3: "theme-mode-3", 4: "theme-mode-4" }[v] || "theme-mode-base";
                  document.documentElement.classList.add(c);
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Without JS the loading cover can never lift — never show it. */}
        <noscript>
          <style>{`.initial-loader{display:none !important}`}</style>
        </noscript>
      </head>
      <body className="body">
        {/* Shared goo filter for the blob-to-text heading morph.
            The blur deviation is driven from lib/fx/reveal.ts. */}
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="text-goo" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur id="text-goo-blur" stdDeviation="10" result="b" />
              <feColorMatrix
                in="b"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              />
            </filter>
            <filter id="logo-goo" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur id="logo-goo-blur" stdDeviation="14" result="b" />
              <feColorMatrix
                in="b"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              />
            </filter>
          </defs>
        </svg>
        <ThemeProvider>
        <div className="transition-wrapper">
          <GridWrap />
          <Nav />
          <ThemeLever />
          <CvButton />
          {children}
          <StickyName />
          <CustomScrollbar />
          <InitialLoader />
        </div>
        </ThemeProvider>

        <SiteFx />
      </body>
    </html>
  );
}
