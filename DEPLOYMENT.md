# Deployment record

This document records the deployment that was actually completed for Iris
Matos's personal website.

## Architecture

```text
Public GitHub repository → Cloudflare Pages → iris-builds.pages.dev
```

The site is exported as static HTML, CSS, JavaScript, fonts, images, audio,
and documents. There is no backend, database, server-only route, analytics, or
required runtime secret.

## Repository

- Repository: <https://github.com/IN-Neil/iris-personal-site>
- Production branch: `cursor/personal-site-03d5`
- Visibility: Public
- Canonical source: GitHub
- Source license: [`LICENSE`](LICENSE) — MIT License
- Creative-work boundary: [`ASSETS_LICENSE.md`](ASSETS_LICENSE.md)
- Third-party material: [`CREDITS.md`](CREDITS.md)

The requested branch is the repository's default branch. Cloudflare's first
production build fetched commit `7e972df5409ddb85bc2b9d3266fe4822214e8a99`.

## Cloudflare Pages configuration

- Project name: `iris-builds`
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `pnpm build`
- Build output directory: `out`
- Production branch: `cursor/personal-site-03d5`
- Production URL: <https://iris-builds.pages.dev>
- Environment variables: None
- Runtime: No runtime environment variable is configured. Cloudflare's Pages
  build environment successfully installed pnpm `10.33.3` and completed the
  build; the local verification environment used Node `22.23.2`.

The repository's `next.config.ts` sets `output: "export"`, which makes the
production artifact compatible with Cloudflare Pages static hosting.

## Automatic deployment

Cloudflare Pages is connected to the GitHub repository and watches the
production branch. A push to `cursor/personal-site-03d5` starts a new Pages
build automatically. The initial production deployment successfully cloned
the repository, ran `pnpm build`, uploaded the generated `out/` directory, and
published the site globally.

## Search indexing

This site is intended for people who receive the application link, not for
ordinary search discovery. It is not private or access-protected.

- The page metadata sends `noindex`, `nofollow`, `noarchive`, and Googlebot
  `noimageindex` directives.
- [`public/robots.txt`](public/robots.txt) contains `Disallow: /` for all user
  agents.
- These directives discourage indexing; they are not a security boundary.

## Licensing structure

- Source code is released under the MIT License.
- Iris Matos's original art, writing, illustrations, visual assets, and other
  original creative material remain Copyright © 2026 Iris Matos. All Rights
  Reserved.
- Third-party material retains its original license. The two included
  soundtrack tracks and the fonts are documented in [`CREDITS.md`](CREDITS.md).

## Maintenance workflow

1. Make a change on the production branch.
2. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` locally.
3. Confirm the generated `out/` artifact and public asset paths are correct.
4. Commit the change with a clear message.
5. Push to `cursor/personal-site-03d5`.
6. Wait for Cloudflare Pages to finish its automatic deployment.
7. Open <https://iris-builds.pages.dev> and verify the changed experience.

## Troubleshooting notes

- The newer Cloudflare creation wizard initially opened a Workers flow. The
  project was created through Cloudflare's legacy Pages GitHub import flow so
  the hosting architecture remains Pages, as requested.
- Cloudflare's Next.js static-export preset initially suggested `npx next
  build`; it was set to the repository's verified `pnpm build` command.
- The site has no server routes or environment variables, so no adapter,
  secret, or runtime configuration was added.
- If a deployment fails, inspect the Cloudflare build log first, then reproduce
  locally with `pnpm install` followed by the verification commands above.
