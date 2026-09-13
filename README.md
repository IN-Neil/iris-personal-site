# Iris Matos — Imagine → Build

A one-page personal site told as a paper boat's night journey across a stormy
sea toward a lighthouse. An adult hand and a child's hand launch the boat; four
chapters follow (questions → building → community → contribution); the ending
is a bearing, not an arrival.

Built with Next.js (App Router), TypeScript, and Tailwind CSS v4. No backend,
no CMS, no tracking. Deploys to Vercel as-is.

## Run it locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:4317
```

Other scripts:

```bash
pnpm typecheck  # strict TypeScript
pnpm lint       # ESLint (next/core-web-vitals)
pnpm build      # production build
```

## Where to edit things

| I want to change…                                  | Edit this file                                |
| -------------------------------------------------- | --------------------------------------------- |
| Any text: title, chapters, milestones, ending      | `src/content/site.ts`                         |
| Resume / LinkedIn / GitHub / project links         | `links` in `src/content/site.ts`              |
| Floating questions in chapter one                  | `questionFragments` in `src/content/site.ts`  |
| Colours, fonts, card style, animations             | `src/app/globals.css`, `src/app/layout.tsx`   |
| How long each chapter lasts on scroll              | `segments` in `src/lib/journey.ts`            |
| Sky colours, zoom, storm intensity, sea roughness  | the `*Stops` arrays in `src/lib/journey.ts`   |
| Where things sit in the scene (boat, lighthouse…)  | `src/components/journey/Stage.tsx`            |
| The sprites themselves (boat, hands, lighthouse…)  | `src/components/journey/sprites.tsx`          |
| Page metadata (browser tab title, description)     | `metadata` in `src/app/layout.tsx`            |

To add your resume, drop the PDF into `public/` (e.g. `public/iris-matos-resume.pdf`)
and set the Resume `href` in `src/content/site.ts` to `/iris-matos-resume.pdf`.

## How it works

Everything on the page is driven by one number, `progress` (0 → 1).

- **Desktop** (`src/components/journey/Journey.tsx`): a tall scroll container
  holds a sticky, viewport-sized stage. Vertical scroll position becomes
  `progress`, which slides the parallax layers sideways, zooms the camera,
  shifts the time of day, and fades chapter panels in and out.
- **Mobile** (`src/components/journey/JourneyStacked.tsx`): the same `Stage`
  is rendered as a frozen frame at each chapter's midpoint, stacked vertically
  with the text beneath it.
- **Stage** (`src/components/journey/Stage.tsx`): the world as layers, back to
  front — stars, moon, clouds, far sea + shores + lighthouse, mid sea, the boat
  (with the hands and the gust), near sea + question fragments, foreground sea,
  then rain and lightning over the lens. Each layer is several viewports wide
  and translates by `progress × parallaxFactor`.
- **Sprites** are SVG rectangles on a small grid with `crispEdges`, which is
  what gives the low-res feeling without using pixel fonts anywhere.

Motion respects `prefers-reduced-motion` (waves, bobbing, beam, rain, lightning
flashes, and twinkle stop; scroll-driven camera movement remains).

## Deploy

Push to a Git host and import the repo in Vercel. No environment variables are
needed.
