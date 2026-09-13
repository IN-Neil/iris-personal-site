# PLAN — Iris Matos personal site

## Goal

A one-page, scroll-driven narrative site: a paper boat crossing a dark, stormy
sea toward a lighthouse, told in four chapters plus an ending. Next.js +
Tailwind, no backend, deployable on Vercel. Quiet, poetic, pixel-inspired but
not retro.

The opening: an adult hand supporting a child's hand lowers the paper boat onto
the water; the hands withdraw, the wind takes the boat, and the journey begins.
The lighthouse is a bearing, not an arrival.

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
- **Weather is the emotional arc.** Moonlit and calm at departure → clouds
  gather (building) → warm distant lights (community) → full storm with rain
  and lightning (finding my part) → the sea settles and the lighthouse beam
  appears (direction).

## Implementation steps

- [x] Scaffold Next.js (TypeScript, Tailwind v4, pnpm)
- [x] Content file with chapters, milestones, links (placeholders marked)
- [x] Journey math + palette
- [x] Sprites: paper boat, hands, lighthouse, moon, cabin, bird, cloud, bolt
- [x] Night/storm revision after the mood board (paper boat, hands opening)
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
