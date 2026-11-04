# The Connection — TOV4R

Animated ASCII eyes inspired by the supplied reference video. Original browser implementation: procedural eyes, eyelashes and iris detail rendered as text characters.

## Open

Open `index.html` directly in a current browser. No installation, account, API, assets or build step required.

## Controls

- Move the pointer to guide the gaze; click the portrait to blink.
- Pause / Play or Space to stop / resume; Replay restarts the cinematic sequence.
- Pick Amber, Rose, Mint or Silver.
- Cinema expands the portrait. Escape exits Cinema.
- Fullscreen enters the browser's fullscreen mode.

The eyes blink automatically and the camera slowly moves into a close-up. Mobile layout and reduced-motion preference supported. Reduced motion starts paused; Play enables animation.

## GitHub Pages

In repository Settings → Pages choose Deploy from a branch, then `main` and `/ (root)`, and Save.

Files: `index.html`, `style.css`, `script.js`. The `.openai` folder is only used for local preview and can be omitted on GitHub.


## Audit verification

Run `node --test tests/*.test.js` for simulated-canvas behavior checks. See [AUDIT.md](AUDIT.md) for changes, test evidence and remaining visual checks.
