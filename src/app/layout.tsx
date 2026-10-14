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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              /* Fail-open kill-switch: if boot JS ever crashes (e.g. a chunk
                 throws during hydration) the React loader can never dismiss
                 its own cover, stranding the page behind 100% forever. This
                 dependency-free poller survives a dead React tree: it removes
                 the cover and force-reveals staged content (see .fx-dead in
                 globals.css). Healthy loads release the cover themselves well
                 before the ceiling, so this never fires for them. */
              (function () {
                var CEILING_MS = 25000;
                var STUCK_MS = 8000;
                var MIN_AGE_MS = 12000;
                var startedAt = Date.now();
                var lastValue = null;
                var lastChange = Date.now();
                var done = false;
                function killCover() {
                  /* NOTE: never removeChild the loader node here. React still
                     owns it — yanking it out from under React makes React's
                     own unmount commit throw NotFoundError (removeChild of a
                     non-child) and crash the route. Hiding via the .fx-dead
                     class keeps the node parented so a later React unmount
                     still succeeds. */
                  try {
                    document.documentElement.classList.add("fx-dead");
                  } catch (e) {}
                  try {
                    document.body.classList.remove("is-initial-loading");
                  } catch (e) {}
                }
                function forceReveal() {
                  if (done) return;
                  done = true;
                  try {
                    document.documentElement.classList.add("fx-dead");
                  } catch (e) {}
                  killCover();
                  try {
                    window.dispatchEvent(new CustomEvent("lenis:settled"));
                  } catch (e) {}
                }
                function currentValue() {
                  try {
                    var v = document.querySelector(".initial-loader__value");
                    return v ? v.textContent : null;
                  } catch (e) {
                    return null;
                  }
                }
                function onCrash() {
                  if (done) return;
                  try {
                    if (!document.querySelector(".initial-loader")) return;
                    var v = currentValue();
                    if (v && v.indexOf("100") !== -1) forceReveal();
                    else if (v !== null && v === lastValue && Date.now() - lastChange > STUCK_MS) forceReveal();
                  } catch (e) {}
                }
                window.addEventListener("error", onCrash);
                window.addEventListener("unhandledrejection", onCrash);
                var timer = setInterval(function () {
                  try {
                    if (done) {
                      clearInterval(timer);
                      return;
                    }
                    var now = Date.now();
                    var loader = document.querySelector(".initial-loader");
                    if (!loader) {
                      /* Cover gone but staged hooks never revealed (blank-page
                         variant) — force them visible past the grace period. */
                      if (now - startedAt > CEILING_MS + 5000) {
                        var hooks = document.querySelectorAll("[data-reveal]");
                        for (var i = 0; i < hooks.length; i++) {
                          try {
                            if (window.getComputedStyle(hooks[i]).visibility === "hidden") {
                              forceReveal();
                              break;
                            }
                          } catch (e) {}
                        }
                        clearInterval(timer);
                      }
                      return;
                    }
                    var v = currentValue();
                    if (v !== lastValue) {
                      lastValue = v;
                      lastChange = now;
                    }
                    if (now - startedAt > CEILING_MS) forceReveal();
                    else if (v !== null && v === lastValue && now - lastChange > STUCK_MS && now - startedAt > MIN_AGE_MS) forceReveal();
                  } catch (e) {}
                }, 1000);
                setTimeout(function () {
                  try {
                    clearInterval(timer);
                  } catch (e) {}
                }, 60000);
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

        <SiteFx />
      </body>
    </html>
  );
}
