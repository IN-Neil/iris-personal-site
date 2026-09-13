# Pixel asset spec — Iris · Imagine → Build

This document is for an image-generating collaborator. It describes exactly
what sprites the site can use, in what format, so they drop straight into the
code. Everything here is optional: the site already renders every sprite
procedurally, so any asset that arrives replaces a placeholder; any that
doesn't, keeps the current version.

## 1. The world in one paragraph

A night sea, drawn as quiet pixel art. Large simple shapes, limited palette,
no outlines. A small ivory paper boat (the kind kids fold) crosses from a dark
shore on the left toward a red-and-white lighthouse on a rock on the right. At
the start, an adult hand supports a child's hand and lowers the boat onto the
water. Weather: moonlit and calm → clouds gather → a storm with rain and one
lightning bolt → calm again as the lighthouse beam appears. Tone: the
"be where you are." / "you have reached the end..." school of pixel art:
poetic, sparse, big skies, tiny subject. Not arcade, not cute.

## 2. Hard technical requirements (read first)

These are what make an image usable. If any of them can't be met, use the
fallback in §2b.

1. **PNG with a transparent background.** No sky, no water, no ground in the
   file — just the object. The site composites it over a moving scene.
2. **Native pixel resolution.** One image pixel = one art pixel. A 24×12 boat is
   a 24×12 PNG. Do not upscale, do not add a soft "pixel look" to a large image.
3. **Hard edges only.** No anti-aliasing, no gradients, no blur, no drop
   shadows, no glow. Every pixel is exactly one colour from the palette.
4. **Palette (§3) only.** Shading is done with a second palette colour, not
   with lighter/darker tints.
5. **Light source: upper right** (the moon is at the top right of the scene).
   Lit sides face right; shadow sides face left.
6. **Exact canvas sizes** from the table in §4. The site positions sprites by
   their box, so a 30×14 boat instead of 24×12 will sit wrong on the water.
7. **One object per file**, named as in §4, plus the listed variants.
8. **No text, no watermark, no signature** inside the image.

### 2b. Fallback if native-resolution transparent PNG is impossible

Some image tools can't output tiny images or true transparency. In that case:

- Render at **exactly 8× scale** on a strict grid: each art pixel is an 8×8
  block of a single flat colour, aligned to multiples of 8. A 24×12 boat
  becomes a 192×96 image. Fill the background with solid magenta `#FF00FF`.
- Iris's developer will key out the magenta and downsample with
  nearest-neighbour. This only works if the blocks are truly flat and aligned,
  so please zoom in and check before sending.

## 3. Palette

Use these and only these. Most sprites need three to five of them.

| Name | Hex | Use |
| --- | --- | --- |
| Paper Ivory | `#EAE6DE` | paper boat, lighthouse white stripes, moon, highlights |
| Shell Beige | `#C7B2A0` | paper shadow fold, adult hand, moon craters |
| Warm Skin (child) | `#E9CBB0` | child's hand only |
| Soft Peach-Coral | `#DC9A73` | lit windows, lantern light |
| Poppy Coral | `#D96144` | lighthouse red stripes |
| Sandstone | `#C7936C` | wood, dock post |
| Charcoal Ink | `#221D1A` | darkest details: lighthouse ironwork, roof, door |
| Slate Grey | `#3B4548` | cabin walls, rock mid-tone |
| Night Blue | `#1F2C42` | the sky behind everything (for previewing only, not in files) |
| Deep Shore | `#2C3A3C` | shore and rock silhouettes |
| Storm Cloud | `#2B3646` | clouds |
| Bright Surf Cyan | `#57A9C7` | rare accent (marker dots) |

## 4. Asset list

Sizes are in art pixels (= image pixels, see §2.2). "Anchor" is the point the
site aligns to; please respect it.

| Priority | File | Size (w×h) | What it is | Anchor / notes | Variants |
| --- | --- | --- | --- | --- | --- |
| 1 | `paper-boat.png` | 24×12 | A folded paper boat, side view, bow pointing right. Ivory with one Shell-Beige shadow side. Two tiny points at bow and stern, a triangular centre fold. | Bottom edge = waterline. Fill the full width. | `paper-boat-lit.png`: same, with a small Peach glow inside the fold (2–3 px) |
| 1 | `hands.png` | 96×56 | An adult hand, palm up, entering from the left edge (forearm cut off by the canvas edge), fingers pointing right. A child's smaller hand rests in the adult palm, also palm up, fingers pointing right. Silhouette-like, warm paper cut-outs, Shell Beige adult / Warm Skin child, minimal internal detail (a finger gap is enough). | The child's fingertips must land inside the box x 52–66, y 10–14 — that is where the boat sits. Adult fingertips can reach x ≈ 90. | none |
| 1 | `lighthouse.png` | 48×92 | Tapered tower, ivory and Poppy horizontal bands (5–6 px tall each), black gallery railing, lantern room, stepped dark roof. No rock in this file. | Bottom centre. | `lighthouse-lit.png`: lantern room glows Peach |
| 1 | `shore-arrival.png` | 240×64 | Dark rock/hill silhouette in Deep Shore, rising from sea level on the left to a plateau on the right. Stepped, low-detail. The lighthouse will stand at about x = 70, the cabin at about x = 150. | Bottom edge = below the waterline (the sea covers the bottom 20 px). Transparent above the silhouette. | none |
| 2 | `cabin.png` | 40×28 | A small keeper's house: Slate walls, dark stepped roof, chimney, door, two square windows glowing Peach. | Bottom centre. | none |
| 2 | `moon.png` | 24×24 | Full moon, Paper Ivory, a few Shell-Beige crater pixels. Circular but pixel-stepped; no glow. | Centre. | none |
| 2 | `cloud-large.png` | 96×32 | Blocky cumulus silhouette in Storm Cloud, flat bottom, bulbous top, like the clouds in the mood board but dark. | Any; used as a floating layer. | none |
| 2 | `cloud-medium.png` | 72×24 | Same family. | — | none |
| 2 | `cloud-small.png` | 48×16 | Same family. | — | none |
| 2 | `shore-departure.png` | 120×40 | A dark shore rising toward the left edge, mirror image of the arrival shore in spirit. Optional: one Sandstone dock post 2×8 near the right end. | Bottom edge below waterline (sea covers bottom 12 px). | none |
| 3 | `bolt.png` | 12×40 | A single jagged lightning bolt, Paper Ivory, 2 px thick. | Top centre. | none |
| 3 | `figure-adult.png` | 10×28 | Standing adult silhouette in Deep Shore, seen from behind, looking right toward the sea. | Bottom centre. | none |
| 3 | `figure-child.png` | 7×18 | Standing child silhouette in Deep Shore, same direction, beside the adult. | Bottom centre. | none |

Priority 1 is what changes the site the most. Priority 3 (the two standing
figures) is a new idea: after the hands let the boat go, the adult and child
could be seen on the departure shore watching it leave. Not required.

### Things we do NOT need as images

Waves, foam, rain, stars, the moon's reflection, the lighthouse beam, and the
question captions are generated in code because they animate and change colour
with the weather. Please don't spend effort there.

## 5. One prompt you can paste

> Create a pixel-art sprite for a quiet night-sea scene. Output a PNG with a
> fully transparent background at native resolution: the canvas must be exactly
> **[W]×[H] pixels** and one image pixel must equal one art pixel. Hard edges
> only — no anti-aliasing, gradients, blur, glow, or shadows. Use only these
> colours: [list from §3 for this asset]. Light comes from the upper right.
> Subject: **[description from §4]**. Anchor: **[anchor from §4]**. No text or
> watermark. Style: large simple shapes, limited palette, restrained and poetic
> pixel art (not arcade, not cute).
>
> If you cannot output at native resolution with transparency, instead render
> at exactly 8× (canvas [8W]×[8H]) on a solid `#FF00FF` background, with every
> art pixel as a flat 8×8 block aligned to the 8-pixel grid.

## 6. Font

No font asset is needed. The site uses **Silkscreen** (Google Fonts, free) for
pixel captions and labels, **Fraunces** for headings, and **IBM Plex Sans**
for body text. Pixel type is used only for short lines — never body copy — so
it stays legible and doesn't turn the page into a game UI.

If the collaborator wants to propose a different pixel face, the constraints
are: free licence, available on Google Fonts or as a `.woff2`, legible at
10–12 px, all-caps friendly.

## 7. How the assets get used

- Files go in `public/sprites/`.
- Each is rendered as an `<img>` with `image-rendering: pixelated`, scaled by
  the site to its slot (the boat is about 10% of the viewport width on
  desktop, the lighthouse about 30% of the viewport height).
- Where a sprite has a lit/unlit variant, the site cross-fades between them as
  the story progresses (boat light from chapter two; lighthouse from the end).
- Shores and clouds are darkened further during the storm with a CSS filter,
  so please draw them at their "calm night" colour.
