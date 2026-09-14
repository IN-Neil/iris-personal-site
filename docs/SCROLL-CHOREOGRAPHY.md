# Scroll choreography — context before examples

The departure artwork stays intact. The previous stacked-question pause is
replaced by continuous travel: scrolling always advances the world. Each
chapter gives its context first, then its examples appear separately in the sky.
The copy is unchanged.

## Timing spec

Distances are viewport heights from the top of the desktop page, not seconds.
The page is 30 viewport heights tall, with 29 of actual scroll travel. The
visitor can stop, speed up, or reverse at any point; there is no scroll lock.

| Travel | Content |
| --- | --- |
| 0–1 | Departure; IRIS fades away |
| 1–3.625 | Chapter One context (including full-copy reading time) |
| 4.15–8.2 | Five questions, appearing individually |
| 8.5–10.775 | Chapter Two context |
| 11.23–14.74 | Rolling Context, Amira, Irispedia, Six Ways to See One File |
| 15–16.925 | Chapter Three context |
| 17.31–20.28 | Cyberpsychology coursework, Social Psychology Club, HCI |
| 20.5–22.425 | Chapter Four context |
| 22.81–25.78 | AI workshop, participants' games, independent research |
| 25.78–27.5 | Open water; the last stars have passed |
| 27.5–29 | Arrival cliffs and lighthouse gradually emerge; ending copy follows |

Within each chapter, copy fades in over the first 2–6%, is fully typed at 15%,
and fades out by 35%. Examples occupy 42–96%, each in its own equally sized
window. Each example fades in/out across 14% of its window and remains fully
readable for the middle 72%. Positions alternate across the sky; text drifts
with the world rather than forming a fixed list. The departure mountains remain
visible through the questions. The lighthouse itself begins appearing around
27.69 viewport heights; the ending copy begins around 27.88.

Edit `scrollBeats` and `SCROLL_SCREENS` in `src/lib/journey.ts` for travel length.
`chapterPhases` controls copy timing; `exampleWindow` and `exampleVisibility`
control the individual examples. World movement uses linear interpolation with
strictly increasing progress, including through every reading interval.

On phones, the same order uses natural document flow: chapter context comes
before its questions or milestone details. Chapter One's questions are spaced
individually after its body, and there is extra room before the ending.

## Verification

- [x] Six timing tests: no frozen intervals, context precedes all examples, no overlapping example windows, and open water before the lighthouse.
- [x] Lint, TypeScript, and production build pass.
- [x] Browser pass: context, scattered questions, later stars, ending, and phone order.

## Rollback

`a3afcdc` preserves the previous opening and stacked-question version. The new
choreography is a separate checkpoint; the original PNGs remain unchanged.

## Mobile-first MVP checks

Phones use document scroll distance rather than the desktop timeline above.
The entire chapter body is immediately readable, followed by its questions or
milestones. This order is also present in the server-rendered HTML for text
readers and crawlers. No timed interaction is needed to obtain the copy.

- [x] Phone widths 320px and 390px: no horizontal overflow; context before examples.
- [x] Heading IDs are unique across both responsive layouts.
- [x] Footer link targets are at least 44px high.
- [x] Résumé serves HTTP 200 as a PDF and matches the supplied file byte-for-byte.
- [x] GitHub, LinkedIn, and both project-link placements use the supplied destinations (LinkedIn recovered from the résumé hyperlink).
- [x] Closing note reads “Onwards.”; credits include Fable 5.1 and Astra 6.

The timing spec is linked prominently from the repository README. The desktop
scroll timings have not changed during this final content and mobile pass.

## Camera framing

The full scenery and candle boat share one camera. Departure stays wide at 1× through progress 0.12, then eases to 1.4× by 0.19. This framing holds through the final independent research star (ending at 0.8328). The camera pulls back from 0.84 to 0.93, reaching the original 1× framing before the lighthouse arrives. Travel continues throughout. The pivot follows the boat at the waterline. Mobile chapter illustrations use a gentler 1.2× crop; their copy remains in normal document flow.

## Soundtrack (independent of scroll)

The page attempts playback on arrival at volume level 2 of 4 (25% audio gain). If the browser blocks autoplay, the sound button starts playback on a tap. Its on/off icon follows actual playback, and pausing preserves position. Starfield Romance plays first, then The Beach Where Dreams Die on the audio `ended` event; the playlist repeats after both finish. Scrolling never seeks, changes tracks, or pauses music. One shared player serves desktop and mobile. The button stays at the intro's left column (11% desktop, 24px mobile), above the name. Source WAVs remain in Downloads; the site serves 160 kbps MP3s for mobile bandwidth.

The four 12px volume squares have 5.35px gaps and fill cumulatively. The default is two filled squares; levels use 10%, 25%, 50%, and 100% audio gain so the middle setting is gentler. The 44px-high slider supports tapping, dragging, and keyboard arrows. Changing volume preserves playback and track position.
