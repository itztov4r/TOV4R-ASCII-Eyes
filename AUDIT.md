# Repository audit — 4 November 2026

Source reviewed: `1863118c63587d59f03306ea7889fb4d1786d2e9` on `main`. Changes are proposed on `audit/repository-improvements-2026-11-04`; nothing was merged or deployed.

## Changes

- Skip expensive eye rasterization while paused or hidden, retaining redraw on resize or interaction.
- Preserve playback, replay, palette selection, cinema mode and fullscreen fallback.
- Add simulated-browser tests for pause and hidden-tab behavior.

## Verification

2 automated behavioral tests passed. All 3 recorded source/test checks passed. Local verification used Node.js 26.12.0 and Python 3.15.0; CI should also confirm the configured deployment versions.

- `node --test tests\motion.test.js`
- `node --check for repository JavaScript files`

Local HTML asset references were compared with the complete GitHub file inventory. Real desktop/mobile visual verification was blocked in this environment: the in-app preview could not reach the local server and the desktop browser did not expose a usable window. No claim of browser/device acceptance is made. Automated DOM/canvas simulations, where present, do not replace that check.

## Remaining limits and rollout

- No authentication or database.
- The animation frame callback still schedules, but canvas/image-data work is skipped while idle.
