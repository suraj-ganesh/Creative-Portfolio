import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import GridWrap from "@/components/GridWrap";
import StickyName from "@/components/StickyName";
import CustomScrollbar from "@/components/CustomScrollbar";
import { ThemeProvider } from "@/lib/theme";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "bleibtgleich - UX/UI Designer & Developer",
  description:
    "UX/UI designer and creative developer building award-winning digital products. From interface design to animated Webflow, GSAP and WebGL builds.",
  openGraph: {
    title: "bleibtgleich - UX/UI Designer & Developer",
    description:
      "UX/UI designer and creative developer building award-winning digital products. From interface design to animated Webflow, GSAP and WebGL builds.",
    url: "https://bleibtgleich.dev/",
    siteName: "bleibtgleich",
    images: [
      {
        url: "https://pub-0b5dfbb7f1bd46be9741d4d704b92507.r2.dev/opengraph-v3.png",
        width: 1200,
        height: 620,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bleibtgleich - UX/UI Designer & Developer",
    description:
      "UX/UI designer and creative developer building award-winning digital products. From interface design to animated Webflow, GSAP and WebGL builds.",
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
    <html lang="en" className="w-mod-js">
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
        <div data-barba="wrapper" className="transition-wrapper">
          <GridWrap />
          <Nav />
          {children}
          <StickyName />
          <CustomScrollbar />
        </div>
        </ThemeProvider>

        {/* Site Bundle with GSAP, Webflow, Barba, Lenis, Three.js, and Slater */}
        <Script
          src="/js/site-bundle.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
