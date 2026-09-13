# PLAN — Iris Matos personal site

## Goal

A one-page, scroll-driven narrative site: a boat crossing the sea toward a
lighthouse, told in four chapters plus an ending. Next.js + Tailwind, no
backend, deployable on Vercel. Calm, poetic, pixel-inspired but not retro.

## High-level design

- **Content lives in one file:** `src/content/site.ts` (all copy + links).
- **Journey math lives in one file:** `src/lib/journey.ts` (scroll segments,
  zoom/night/sea keyframes, palette interpolation).
- **One scene, two layouts.** `Stage` draws the world for any progress value
  0→1. Desktop (`Journey`) drives progress from vertical scroll inside a sticky
  viewport. Mobile (`JourneyStacked`) renders the same `Stage` frozen at each
  chapter's moment and stacks the chapters vertically.
- **Layers, not a game engine.** Sky, stars, moon/sun, far sea, mid sea, boat,
  near sea, foreground. Each layer is a plain div translated by
  `progress × parallaxFactor`. Sprites are SVG rectangles on a grid.
- **Time of day is the emotional arc.** Ivory morning → light ocean →
  peach dusk → slate → night with the lighthouse lit.

## Implementation steps

- [x] Scaffold Next.js (TypeScript, Tailwind v4, pnpm)
- [x] Content file with chapters, milestones, links (placeholders marked)
- [x] Journey math + palette
- [x] Sprites: boat, lighthouse, moon, sun, cabin, bird
- [x] Stage: layered scene driven by progress
- [x] Desktop Journey: sticky viewport, scroll progress, text panels, route map
- [x] Mobile JourneyStacked
- [x] Fonts, metadata, global styles, reduced-motion support
- [x] Typecheck + lint + production build
- [x] Visual pass in browser (desktop + mobile widths)
- [x] README with run instructions and "where to edit" guide

## Later (not MVP)

- [ ] Real resume PDF in `public/` and real LinkedIn / GitHub URLs
- [ ] Optional ambient audio toggle
- [ ] Optional OG image
