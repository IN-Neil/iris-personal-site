# Iris Matos — Imagine → Build

A personal website told through a paper boat's night journey. A parent and child
watch from the dock; four chapters introduce curiosity, building, community,
and contribution. Each chapter gives context before its questions or examples.

**[Read the timing spec → docs/SCROLL-CHOREOGRAPHY.md](docs/SCROLL-CHOREOGRAPHY.md)**

The spec includes chapter timing, individual-example fades, open water before
the lighthouse, and the phone reading sequence. All documentation lives in
[`docs/`](docs/).

## Run and verify

Use Node 22.6+ and pnpm.

```sh
pnpm install
pnpm dev        # http://localhost:4317
pnpm test       # scroll sequencing and continuous movement
pnpm typecheck
pnpm lint
pnpm build
```

## Where to edit

| Change | File |
| --- | --- |
| Copy, questions, milestone details, profile links, credits | `src/content/site.ts` |
| Résumé download | `public/iris-student-resume.pdf` |
| Timing documentation | [docs/SCROLL-CHOREOGRAPHY.md](docs/SCROLL-CHOREOGRAPHY.md) |
| Scroll distances and fade timing | `scrollBeats`, `chapterPhases`, `exampleWindow` in `src/lib/journey.ts` |
| Scene composition and drifting examples | `src/components/journey/Stage.tsx` |
| Original sprites and transparent-canvas framing | `public/sprites/`, `src/components/journey/sprites.tsx` |
| Phone reading layout | `src/components/journey/JourneyStacked.tsx` |
| Fonts and styling | `src/app/layout.tsx`, `src/app/globals.css` |

## Reading experience

Phones use ordinary vertical reading order: introduction, chapter scene, full
chapter copy, then its questions or milestone details. All four chapters lead
to the ending and profile links. Text is present in the server-rendered HTML;
readers do not need to execute a typewriter effect to obtain the complete copy.
Each layout has unique heading IDs for assistive technology. Footer links have
at least 44px-high tap targets.

Desktop uses a sticky scene with continuous parallax travel. Longer chapter
intervals slow its pace without freezing scroll progress. Copy appears before
individual questions or stars. The last stars clear before the lighthouse
emerges. Reduced-motion preferences disable ambient animations.

Built with Next.js App Router, TypeScript, and Tailwind CSS. Pixelify Sans is
used for pixel headings and Piazzolla for body text. No backend or tracking.

## Deployment

The site builds as static pages and can be imported into Vercel. No environment
variables are required. Local commits are kept as reversible checkpoints;
pushing and deployment are separate steps.
