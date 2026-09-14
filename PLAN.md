# PLAN — Iris Matos personal site

## Goal

A one-page, scroll-driven narrative site: a paper boat crossing a dark, stormy
sea toward a lighthouse, told in four chapters plus an ending. Next.js +
Tailwind, no backend, deployable on Vercel. Quiet, poetic, pixel-inspired but
not retro.

The opening: a parent and child watch from a moonlit dock as the paper boat
drifts away. Chapter One gives context first, followed by individual questions drifting through the sky.
The lighthouse is a bearing, not an arrival.

## High-level design

- **Content lives in one file:** `src/content/site.ts` (all copy + links).
- **Journey math lives in one file:** `src/lib/journey.ts` (scroll segments,
  zoom/night/sea keyframes, palette interpolation).
- **One scene, two layouts.** `Stage` draws the world for any progress value
  0→1. Desktop (`Journey`) drives progress from vertical scroll inside a sticky
  viewport. Mobile (`JourneyStacked`) renders the same `Stage` frozen at each
  chapter's moment and stacks the chapters vertically.
- **Layers, not a game engine.** Sky, stars, moon, far sea, mid sea, boat,
  near sea, foreground. Each layer is a plain div translated by
  `progress × parallaxFactor`. Big set pieces (boat, hands, moon, clouds,
  shores, lighthouse, cabin) are drawn pixel-art PNGs in `public/sprites`
  (originals in `assets/source`); small details stay as SVG rectangles.
- **Fixed camera, moving world.** No zoom. The camera sits close to the water
  throughout; the moon rises and swells from chapter one into two, clouds and
  shores slide through, and each chapter's text is placed wherever that scene
  leaves room (`textPlacement` in `Journey.tsx`). Words arrive last.
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
- [x] Quiet typography pass: pixel captions, no cards, milestones as world markers
- [x] Chapter-one close-up on the boat with side dialog
- [x] Asset spec for an image-generating collaborator (`docs/ASSET-SPEC.md`)
- [x] Chapter pacing: environment-only opening, caption → heading → typed body, breathing room
- [x] Per-chapter weather: wind (1), clear stars (2), clouding over (3), storm (4)
- [x] Stage: layered scene driven by progress
- [x] Desktop Journey: sticky viewport, scroll progress, text panels, route map
- [x] Mobile JourneyStacked
- [x] Fonts, metadata, global styles, reduced-motion support
- [x] Typecheck + lint + production build
- [x] Visual pass in browser (desktop + mobile widths)
- [x] README with run instructions and "where to edit" guide
- [x] Drawn sprites wired in (crop + palettise script run once; see commit)
- [x] Fixed camera; moon path; simplified intro; per-chapter text placement (intro, ch1, ch2)
- [ ] Chapter three: cliffs asset drifting in with lights and stars
- [ ] Chapter four: storm composition with cloud banks
- [ ] Ending: check lighthouse / cabin / cliffs placement with the new camera

## Later (not MVP)

- [x] Adult and child figures on the departure shore watching the boat leave
- [x] Real resume PDF in `public/` and real LinkedIn / GitHub URLs
- [ ] Optional ambient audio toggle
- [ ] Optional OG image

## September 13 departure refinement

- [x] Import supplied adult, child, and both dock variants without altering originals
- [x] Match reference composition; bold IRIS above parent, larger dock, balanced right sky
- [x] Replace scattered background questions with a larger, stationary stack
- [x] Add smooth fades, a reading hold, and breathing room before Chapter One
- [x] Preserve later chapter timing through a separate scroll-to-story mapping
- [x] Verify desktop and phone layouts; fix phone horizontal overflow
- [x] Add timing regression tests; pass lint, typecheck, and production build
- [x] Record editable timing spec in `docs/SCROLL-CHOREOGRAPHY.md`

## Context-first choreography revision

- [x] Preserve `a3afcdc` as the previous-version checkpoint
- [x] Remove the frozen scroll interval; continuously advance the scene
- [x] Show each chapter copy before its questions or milestone stars
- [x] Space examples individually across the sky at a larger reading size
- [x] Keep the mountains through Chapter One's questions
- [x] Add open water after the final stars before the lighthouse emerges
- [x] Reorder phone questions after Chapter One context
- [x] Update timing spec and regression tests; pass lint, typecheck, build
- [x] Complete browser verification of the reordered journey

## MVP content and mobile finish

- [x] Link unchanged supplied résumé, GitHub, LinkedIn, and Six Ways to See One File
- [x] Change closing note to “Onwards.” and credit Fable 5.1 and Astra 6
- [x] Link timing spec prominently from README; keep it in `docs/`
- [x] Correct heading IDs for assistive readers and enlarge footer tap targets
- [x] Verify narrow phones, reading order, server-rendered copy, and résumé endpoint
- [x] Pass six regression tests, lint, typecheck, and production build
