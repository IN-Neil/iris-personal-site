# Mobile journey research evidence (preserved)

Copied on 2026-09-14 from a temporary Claude session scratchpad
(`/private/tmp/claude-501/-Users-gmr-plugins/1f6a2b00-d99a-4be0-9a90-17c6c6afcfe3/scratchpad/`),
which may be deleted. Integrity: `SHA256SUMS` (run `shasum -a 256 -c SHA256SUMS` in this directory).

| Path | What it is | Provenance |
| --- | --- | --- |
| `prototype-evidence.html` | Follow-up report (compact vs crop vs wide) | Published as “Journey Phone Prototype”; links rewritten from `shots/` and `data/` to `evidence/` |
| `journey-on-iphone.html` | First decision report, with its correction notice | Superseded in part by the follow-up |
| `evidence/prototype.patch` | Prototype diff against `e267916` (5 files) | Built and type-checked in a scratch copy, never applied to this repository |
| `evidence/*.jpg` | Screenshots, headless Chrome, CSS viewports, DPR 1, no browser controls | Built from `e267916` + patch |
| `evidence/*.json` | `screens`, `fit`, `sweep`, `perf`, `perf-idle-animations-only`, `a11y`, `desktopref` | Same runs as the screenshots |
| `harness.mjs.txt` | Measurement harness used for the JSON and screenshots | Renamed `.txt` so it is not linted or executed by accident |
| `proto-src/src/**/*.txt` | Prototype sources before `Stage.tsx` patching (Journey, page, crop) | `Stage.tsx` changes exist only in the patch. Renamed `.txt`: they are evidence, not project code, and fail this repo's lint rules |

Excluded: headless Chrome profiles, `node_modules`, build output, scratch copies of the repository.

Evidence classes: headless Chrome viewport emulation; iOS 26.2 Simulator Safari (viewport readout only, values recorded in the report, screenshots not preserved). No physical-device evidence.

Known limits carried forward: `perf.json` comes from headless Chrome with CPU throttling and does not predict iPhone smoothness; zoom rows in `fit.json` are smaller viewports, not browser zoom; `sweep.json` used the prototype's `data-probe` hooks, which this branch replaces with `data-journey`.
