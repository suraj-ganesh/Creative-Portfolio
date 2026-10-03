import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import GridWrap from "@/components/GridWrap";
import StickyName from "@/components/StickyName";
import CustomScrollbar from "@/components/CustomScrollbar";
import { ThemeProvider } from "@/lib/theme";
import SiteFx from "@/components/SiteFx";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Suraj Ganesh - Video Editor & Colorist",
  description:
    "Suraj Ganesh is a Video Editor based in Jhapa, working with KHARAAYO INC. Skilled in DaVinci Resolve, Premiere Pro and After Effects — color grading, motion graphics and audio mixing.",
  openGraph: {
    title: "Suraj Ganesh - Video Editor & Colorist",
    description:
      "Video Editor producing broadcast-quality videos — color grading, motion graphics and audio mixing. BCA at Mechi Multiple Campus, Jhapa.",
    url: "https://surajganesh.com.np/",
    siteName: "surajganesh",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80&auto=format&fit=crop",
        width: 1200,
        height: 620,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suraj Ganesh - Video Editor & Colorist",
    description:
      "Video Editor producing broadcast-quality videos — color grading, motion graphics and audio mixing.",
  },
  icons: {
    icon: "/favicons/favicon-mode_0.svg",
    apple: "/favicons/favicon-mode_0.svg",
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
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon-mode_0.svg" />
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
      </head>
      <body className="body">
        <ThemeProvider>
        <div className="transition-wrapper">
          <GridWrap />
          <Nav />
          {children}
          <StickyName />
          <CustomScrollbar />
        </div>
        </ThemeProvider>

        <SiteFx />
      </body>
    </html>
  );
}
