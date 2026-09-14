# Iris Matos — Imagine → Build

**Live site:** [iris-builds.pages.dev](https://iris-builds.pages.dev)

This is a personal, builder-focused website told through a paper boat's night
journey. A parent and child watch from the dock while four chapters introduce
curiosity, building, community, and contribution. It was created for Iris
Matos's Claude Campus Ambassador application.

The experience is intentionally quiet and exploratory: desktop visitors move
through a scroll-driven pixel-art scene, while phone visitors get the same
story in a readable vertical sequence. Ambient audio, responsive scene changes,
reduced-motion support, and accessible text are part of the experience.

## Built with

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Next Font with Piazzolla and Pixelify Sans
- Static export hosted on Cloudflare Pages

This is an AI-assisted project. Iris designed the experience, directed the
implementation, made the creative and product decisions, iterated on the
result, and built it with AI tools as part of her development workflow.

## Run locally

Use Node 22.6+ and pnpm 10+:

```sh
pnpm install
pnpm dev        # http://localhost:4317
```

## Verify and build

```sh
pnpm test       # scroll sequencing and continuous movement
pnpm typecheck
pnpm lint
pnpm build      # writes the Cloudflare Pages export to out/
```

## Project map

| Area | Location |
| --- | --- |
| Page composition | `src/app/page.tsx` |
| Metadata and search directives | `src/app/layout.tsx`, `public/robots.txt` |
| Copy, milestones, profile links | `src/content/site.ts` |
| Desktop scroll journey | `src/components/journey/Journey.tsx` |
| Mobile reading journey | `src/components/journey/JourneyStacked.tsx` |
| Scene and sprite composition | `src/components/journey/Stage.tsx`, `src/components/journey/sprites.tsx` |
| Scroll timing logic | `src/lib/journey.ts` |
| Original sprites and audio | `public/` |
| Design and timing notes | `docs/` |
| Deployment record | `DEPLOYMENT.md` |

## Deployment

The canonical source is the public GitHub repository [IN-Neil/iris-personal-site](https://github.com/IN-Neil/iris-personal-site).
Cloudflare Pages builds the production branch and publishes the static `out/`
directory at [iris-builds.pages.dev](https://iris-builds.pages.dev).

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the actual project configuration and
maintenance workflow.

## Licensing

- **Source code:** MIT License; see [`LICENSE`](LICENSE).
- **Original art, writing, illustrations, and creative assets:** Copyright ©
  2026 Iris Matos. All Rights Reserved; see [`ASSETS_LICENSE.md`](ASSETS_LICENSE.md).
- **Third-party material:** remains under its original license and is recorded
  in [`CREDITS.md`](CREDITS.md).
