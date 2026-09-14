# Departure scroll choreography

This pass keeps the existing pixel-art world and four-chapter story. The opening
now follows the supplied parent/child reference. The original PNGs are stored
unchanged in `public/sprites`; `drawn` in `sprites.tsx` frames their transparent
padding through SVG view boxes. `dockWide` is used; `dockShort` is available as
an alternate.

## Timing spec

Distances below are measured from the top of the desktop page in viewport
heights, not seconds. Visitors control the speed and can stop to read or scroll
backward. The page is 12 viewport heights tall, with 11 of available travel.

| Scroll distance | Beat |
| --- | --- |
| 0–0.56 | Opening title over the parent and dock |
| 0.56–0.96 | Title fades away as the dock leaves |
| 1.10–1.55 | Five stacked questions fade in |
| 1.55–3.15 | Questions hold at full opacity; scenery holds its position |
| 3.15–3.60 | Questions fade away |
| 3.60–4.536 | Scene-only breathing room |
| 4.536 onward | Existing Chapter One label, heading, and body begin |

`departureTiming` in `src/lib/journey.ts` controls the interlude.
`storyProgress` inserts three extra viewport heights at scene progress 0.12,
then resumes the original timeline. Later chapter weather, scenery, and text
remain synchronized. The ocean and clouds retain their existing ambient motion.

On phones, the opening uses a tall scene followed by the same questions in
normal document flow, then the existing chapter cards. No scroll-dependent
reading speed is required.

## Verified

- [x] Supplied assets preserved byte-for-byte; framing introduces no redraw.
- [x] Parent and child stand on the larger dock; title and parent share a left alignment.
- [x] Pixelify Sans title computes to weight 700.
- [x] Cliffs, moon, and clouds balance the right side.
- [x] All five questions visible together during the hold.
- [x] Questions and Chapter One are both hidden during the breathing interval.
- [x] Desktop (1440 × 900) and phone (390 × 844) opening inspected.
- [x] Phone document has no horizontal overflow.
- [x] Timing regression tests pass (`pnpm test`, Node 22.6+).
- [x] Lint, TypeScript, and production build pass.
