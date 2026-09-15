# Mobile journey — Phase 2 checkpoint evidence

Development checkpoint for review, **not a release**. All results below are headless
Chrome viewport emulation (CSS viewports, DPR 1, no browser controls) against a production
static export of this branch. No Simulator or physical-device evidence is included here.

## Files

| File | What it shows |
| --- | --- |
| `desktop-compare-1440x900.txt` | Pixel comparison of 10 frozen 1440×900 captures against the Phase 0 baseline (`eb160b5`). Threshold: summed RGB difference > 24 per pixel. |
| `sweep-320x568-375x667.json`, `sweep-393x852-430x932.json` | Portrait geometry sweeps |
| `sweep-landscape-844x390-667x375.json` | Short-landscape geometry sweeps |
| `screens/*.jpg` | Key moments at 393×852, 320×568, 844×390 and 1440×900 (JPEG copies of the PNG captures) |

## Desktop comparison

9 of 10 positions are pixel-identical. The two non-zero rows are capture noise, not changes:

- **Departure** (710 px, a band at y 608–858): two captures of the unmodified baseline differ by 1,157 px in the same band.
- **Arrival** (377 px near the cabin): under the same machine load, the unmodified baseline build recaptured differs from its own first capture by 3,603 px. That recapture and a capture of this branch taken right after it differ by **0 px**.

## Sweeps

Each size runs 581 forward positions (every 0.05 of the 29 viewport-heights of travel),
the same 581 backward, and 200 pseudo-random jumps. The check waits two frames at each position,
then measures rendered rectangles, transforms included.

Checks: continuous travel (star-layer translate never reverses); boat inside the stage;
every example rendered (15) and each reaching full opacity; examples at opacity ≥ 0.5 not
clipped, not over the boat, not over the moon; chapter copy at opacity ≥ 0.5 inside the frame
and not over the boat or the moon; lighthouse not clipped; pinned ending caption not over the
boat or lighthouse; no horizontal page overflow; intro not over the boat.

| Size | Travel reversals | Examples | Blocking failures | Remaining flags |
| --- | --- | --- | --- | --- |
| 320×568 | 0 | 15/15 full | 0 | copy over moon: ch1 43, ch2 37, ch3 19 (forward) |
| 375×667 | 0 | 15/15 full | 0 | copy over moon: ch1 43, ch3 19 |
| 393×852 | 0 | 15/15 full | 0 | copy over moon: ch1 44, ch3 19 |
| 430×932 | 0 | 15/15 full | 0 | copy over moon: ch1 37, ch3 19 |
| 844×390 | 0 | 15/15 full | 0 | copy over moon: ch1 44, ch2 6; examples over moon: 4 titles |
| 667×375 | 0 | 15/15 full | 0 | same as 844×390 |

"Over moon" is a legibility flag, not clipping. Phone and landscape copy has a night-coloured
text halo (`screens/393x852-ch1-copy.jpg`). The landscape examples-over-moon and chapter-two
flags also appear at 1440×900 on the unchanged desktop composition.

## Reproduce

```bash
pnpm build
python3 -m http.server 4323 --bind 127.0.0.1 --directory out
node scripts/journey-check.mjs sweep http://127.0.0.1:4323/ sweep.json 320x568 393x852
node scripts/journey-check.mjs capture http://127.0.0.1:4323/ shots 1440x900
node scripts/journey-check.mjs compare <baseline-shots> shots
```

Baseline captures come from a build of `eb160b5` using the same `capture` command.
