# bleibtgleich — Next.js Portfolio Clone

A complete Next.js clone of [bleibtgleich.dev](https://bleibtgleich.dev/), ported from Webflow + GSAP + Three.js + Barba.js into a modern Next.js 16 App Router project with TypeScript.

---

## 🌟 Key Features

- **Full Multi-Page Experience (21 Pre-rendered Static Pages)**:
  - **Home (`/`)**: Hero typography, interactive Three.js fluid simulation canvas, 3D orbit cards, interactive 5-theme switcher, Work 24-26 showcase with rotating 3D globe database, interactive awards table with live certificate hover previews, and live ticking clock footer with rotating materials logos.
  - **Work (`/work`)**: Complete showcase of recent works, tags, hover states, and case study links.
  - **Contact (`/contact`)**: Interactive mechanical rotary telephone dial (`dial-wrap`) with rotation physics, sound/haptic feedback, and interactive mode switching.
  - **Archive / Experiments (`/archive`)**: 13 experimental 3D items with filtering, interactive demos, and preview modal.
  - **14 Work Case Studies (`/works/[slug]`)**:
    - `velor-app` (Velor Dating App)
    - `bleibtgleich25` (bleibtgleich'25)
    - `bleibtgleich23` (bleibtgleich'23)
    - `grabl-app` (Grabl App)
    - `grabl-app-logo` (Grabl App Logo)
    - `jds` (JDS)
    - `mkaan` (Mkaan)
    - `cybernation-merch` (Cybernation Merch)
    - `do-lorem-ipsum` (Do Lorem Ipsum)
    - `durak-concept` (Durak Miniapp)
    - `insta-gallery` (insta.gallery)
    - `metrics-over-aesthetics` (Metrics over aesthetics)
    - `nabil-issa` (Nabil Issa Concept)
    - `xpm` (XPM Logo)
  - **404 Page (`/_not-found`)**: Custom "Page Not Found" screen matching the original totem design.

- **Animation & Creative Tech Stack**:
  - **GSAP 3.15.0** + Club plugins: `ScrollTrigger`, `MorphSVGPlugin`, `SplitText`, `CustomEase`, `Draggable`, `InertiaPlugin`
  - **Barba.js**: Client-side page transitions with smooth container morphing and state preservation
  - **Three.js**: Interactive WebGL fluid ripples and 3D card spheres
  - **Lenis**: Kinetic smooth scrolling
  - **Interactive 5-Theme Switcher**: Instant switching between Base (Dark), Concrete, Rust, Verdigris, and Blood color palettes, with live SVG favicon updates
  - **Locally Hosted Assets**: Akzidenz Grotesk Pro font, SVG favicons, and bundled scripts

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
pnpm build
pnpm start
```

---

## 📁 Project Structure

```
bleibtgleich-next/
├── public/
│   ├── css/
│   │   ├── lenis.css
│   │   └── webflow.css
│   ├── favicons/
│   │   ├── favicon-mode_0.svg
│   │   ├── favicon-mode_1.svg
│   │   ├── favicon-mode_2.svg
│   │   ├── favicon-mode_3.svg
│   │   └── favicon-mode_4.svg
│   ├── fonts/
│   │   └── AkzidenzGroteskPro-Md.woff2
│   └── js/
│       └── site-bundle.js  # Unified GSAP, Webflow, Three.js, Lenis, Barba, and Slater bundle
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Home page
│   │   ├── not-found.tsx     # 404 page
│   │   ├── archive/page.tsx  # Archive / Experiments
│   │   ├── contact/page.tsx  # Rotary Telephone Dial
│   │   ├── work/page.tsx     # Work catalog
│   │   └── works/[slug]/page.tsx  # Dynamic case studies (14 routes)
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── GridWrap.tsx
│   │   ├── StickyName.tsx
│   │   ├── CustomScrollbar.tsx
│   │   └── ThemeChangeOverlay.tsx
│   ├── data/
│   │   ├── pages.json        # Page data for top-level routes
│   │   └── works.json        # 14 Case studies data
│   └── styles/
│       ├── lenis.css
│       └── webflow.css
├── next.config.ts
├── package.json
└── tsconfig.json
```
