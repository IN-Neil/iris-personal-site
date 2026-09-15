# Design revision — user Figma drafts (2026-09-15)

Headless Chrome viewport emulation (CSS viewports, no browser controls) against a production
build of this revision, plus a visual load in the iOS 26.2 Simulator (Safari, iPhone 17 Pro Max).

| File | What it shows |
| --- | --- |
| `sweep-440x956.json` | iPhone 17 Pro Max size: ending fits at arrival, clear of the boat, 4/4 links, no extra scroll |
| `sweep-393x852.json` | Ending rests 11px over the boat at arrival; 27px of further scroll clears it |
| `sweep-375x667.json`, `sweep-320x568.json` | Ending scrolls over the pinned lighthouse until clear; 4/4 links reachable at page end; no chapter copy over the boat |
| `sweep-844x390.json` | Short landscape: same scrolling ending |
| `screens/440x956-ch1-copy.jpg` | 29px question, 18px body, narrower paragraph beside the small moon, controls row |
| `screens/440x956-arrival.jpg`, `393x852-arrival.jpg` | Ending in the lighthouse scene; links and footer above the boat |
| `screens/320x568-*.jpg` | Smallest phone: 24px / 17px type fits above the boat; page end shows the scrolled ending |
| `screens/1440x900-arrival.jpg` | Desktop: only the copy changed ("Onwards." removed, new paragraph) |

Remaining flags: "copy over moon" in chapters 1 and 3 (the check measures whole text blocks; chapter
one's paragraph clears the moon visually on phones at least 600px tall) and chapter 2 at 375px and
narrower. The 430×932 sweep from the first pass of this revision predates the final ending layout and
is not included.
