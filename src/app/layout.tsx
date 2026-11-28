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
import SiteFxGate from "@/components/SiteFxGate";

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
        url: "https://surajganesh.com.np/images/posters/color-grading-showcase.webp",
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
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="icon" type="image/png" href="/images/hero-mark-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  window.__fxBootAt = performance.now();
                } catch (e) {}
                try {
                  var fast =
                    window.matchMedia("(max-width: 991px)").matches ||
                    window.matchMedia("(pointer: coarse)").matches;
                  window.__fxFastLoader = fast;
                  if (fast) {
                    window.__fxFastLoaderReleased = true;
                    try {
                      performance.mark("fx-fast-released");
                    } catch (e) {}
                    var started = performance.now();
                    var tick = function () {
                      var value = document.querySelector(".initial-loader__value");
                      if (!value) return;
                      var p = Math.min((performance.now() - started) / 700, 1);
                      value.textContent = Math.round(1 + 99 * p) + "%";
                      if (p < 1) window.setTimeout(tick, 100);
                    };
                    tick();
                  }
                } catch (e) {}
                try {
                  document.documentElement.classList.add("fx-armed");
                } catch (e) {}
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              /* Fail-open kill-switch: if boot JS crashes or a chunk never
                 arrives, the React loader cannot dismiss its own cover. This
                 dependency-free timer adds .fx-dead so the cover is hidden and
                 staged content is revealed (see globals.css). Healthy loads
                 signal .fx-ready from SiteFx and never trip it. */
              (function () {
                var CEILING_MS = 6000;
                var ERROR_GRACE_MS = 1200;
                var done = false;
                var timer = 0;
                function forceReveal() {
                  if (done) return;
                  done = true;
                  try {
                    clearTimeout(timer);
                  } catch (e) {}
                  /* Never removeChild the loader node: React still owns it. */
                  try {
                    document.documentElement.classList.add("fx-dead");
                  } catch (e) {}
                  try {
                    document.body.classList.remove("is-initial-loading");
                  } catch (e) {}
                  try {
                    window.dispatchEvent(new CustomEvent("lenis:settled"));
                  } catch (e) {}
                }
                function maybeReveal() {
                  try {
                    if (document.documentElement.classList.contains("fx-ready")) return;
                  } catch (e) {}
                  forceReveal();
                }
                window.addEventListener("error", function () {
                  setTimeout(maybeReveal, ERROR_GRACE_MS);
                });
                window.addEventListener("unhandledrejection", function () {
                  setTimeout(maybeReveal, ERROR_GRACE_MS);
                });
                timer = setTimeout(maybeReveal, CEILING_MS);
              })();
            `,
          }}
        />
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

        <SiteFxGate />
      </body>
    </html>
  );
}
