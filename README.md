# Anime VFX

An interactive showcase, canvas VFX lab, and expanded **30-control** Web Components collection for anime-physics UI controls — ordinary paper-crisp interface primitives at rest that squash on damped springs, overshoot, and throw cel-shaded smoke puffs, impact bursts, crystal shards, splashes, and traced manga sound effects onto a single shared canvas layer.

> **Built on [Sakuga VFX](https://github.com/finktheartist/sakuga-vfx) by Justin Finkelman (MIT License).**
> Anime VFX bundles the 12 original upstream Sakuga VFX controls verbatim and extends the shared `window.SakugaFX` physics and canvas engine with 18 additional Studio Pack Web Components plus an interactive slow-motion inspector, direct canvas VFX lab, composite form playground, and live `--sk-*` theme studio.

---

## Features

- **30 Live Anime-Physics Web Components** — 12 original Sakuga VFX controls + 18 Anime VFX Studio Pack extensions (`29` unique custom elements), all zero-dependency and `prefers-reduced-motion` aware.
- **Live Keyframe Stage** — Inspect springs and canvas frames in real time (`1×`), slow motion (`0.35×`, `0.15×`), pause, or step forward frame-by-frame (`+1 Frame`) via `window.SakugaFX.advance()`.
- **Direct Canvas VFX Lab** — Trigger all 11 cel-shaded canvas primitives (`burst`, `puff`, `shards`, `splash`, `slash`, `ring`, `donut`, `lines`, `ticks`, `wob`, `kira`), 4 multi-effect combos, and 6 traced manga SFX (`ドン!`, `ズザッ`, `カチッ`, `ポン`, `ゴゴゴゴ`, `シュッ`) in Solid Ink, Hollow, or Screentone styles.
- **Live Composite Form Playground** — 10 form-associated controls wired together via `ElementInternals` with validation, storm-cloud progress bar, checkmark landing, and skid toast notifications.
- **Live `--sk-*` Theme Studio** — Switch between 5 cel palettes (`Classic Sakuga`, `Shonen Crimson`, `Cel Cobalt`, `Studio Genga`, `Manga Ink`) or fine-tune individual CSS tokens and canvas ink live with one-click CSS export.

---

## Component Catalog (30 Controls)

### Original Sakuga VFX Controls (12)

Authored by Justin Finkelman in [`finktheartist/sakuga-vfx`](https://github.com/finktheartist/sakuga-vfx) and served from `public/sakuga-vfx/`:

| Control | Custom Element | Script | Signature Effect |
| --- | --- | --- | --- |
| Primary Button | `<sakuga-button>` | `button.js` | Squash hold, 1-frame invert, impact burst, rolling smoke, `done()` check (`ドン!`) |
| Secondary Button | `<sakuga-button variant="secondary">` | `button.js` | Compact spring squash and three cel-shaded directional wedges |
| Toggle | `<sakuga-toggle>` | `toggle.js` | Hand-painted 43-frame smear, slam splash, and flooded track settle |
| Slider | `<sakuga-slider>` | `slider.js` | Teardrop velocity stretch, spring lag, rolling cumulus clouds, release crescent |
| Checkbox | `<sakuga-checkbox>` | `checkbox.js` | Twin orbiting crescents, crystal shards, self-drawing tick (`ズザッ`) |
| Radio | `<sakuga-radio>` | `radio.js` | Spring-in dot, wedge fan, twin smoke puffs, hollow `ポン` |
| Text Input | `<sakuga-input>` | `input.js` | Caret-tracked keystroke dust puffs on every character typed |
| Tabs | `<sakuga-tabs>` | `tabs.js` | Velocity-stretched sliding indicator with landing wedges and dust puff |
| Progress | `<sakuga-progress>` | `progress.js` | Riding storm cloud, levitating pebbles, `ゴゴゴゴ`, finisher burst + check (`ドン!`) |
| Rating | `<sakuga-rating>` | `rating.js` | Cascading spring star pops with celebratory impact burst at 5 stars |
| Toast | `<sakuga-toast>` | `toast.js` | Speed-smear slide-in, skid dust landing (`ズザッ`), spring shrink exit |
| Tooltip | `<sakuga-tooltip>` | `tooltip.js` | Speech-bubble spring pop with twin puffs and crisp `カチッ` lettering |

### Anime VFX Studio Pack Extensions (18)

Built on the shared `window.SakugaFX` core engine and bundled in `public/sakuga-vfx/extras.js`:

| Control | Custom Element | Category | Signature Effect |
| --- | --- | --- | --- |
| Like Button | `<sakuga-like>` | Actions | Heart spring pop, back-layer burst, accent ticks, sparkle glint (`ポン`) |
| Accordion | `<sakuga-accordion>` | Feedback | Horizontal slash seam reveal, speed lines, corner puffs, spring chevron (`シュッ`) |
| Quantity Stepper | `<sakuga-stepper>` | Inputs | Spring-scaled tabular counter, directional tilt, wall-bump wobble (`カチッ`) |
| Dropdown Select | `<sakuga-select>` | Selection | Spring-unfolded listbox menu, crystal shards, speed streaks (`ズザッ`) |
| Copy Button | `<sakuga-copy>` | Actions | Icon spring flip to checkmark, crystal shards, kira sparkle (`カチッ`) |
| Multi-Select Chips | `<sakuga-chip-group>` | Selection | Per-chip squash & pop, back-layer mini burst, accent ticks (`ポン`) |
| Segmented Control | `<sakuga-segmented>` | Selection | Spring-gliding thumb with velocity stretch and speed lines (`カチッ`) |
| Passcode / OTP | `<sakuga-otp>` | Inputs | Per-digit spring pop and 4-digit completion burst + kira (`ドン!`) |
| Hold to Confirm | `<sakuga-hold>` | Actions | Rising charge bar, shake buildup, `ゴゴゴゴ` rumble, shockwave + shards (`ドン!`) |
| Combo Counter | `<sakuga-counter>` | Feedback | Spring-scaled tabular counter, kira glint, smoke donut on `+10` milestones (`ポン`) |
| Notification Bell | `<sakuga-bell>` | Feedback | Underdamped swinging bell, vibration arcs, badge spring pop (`カチッ`) |
| Dismissible Tags | `<sakuga-tags>` | Selection | Crystal shard shatter + smoke puff on remove (`シュッ`), burst restore |
| Power Level Meter | `<sakuga-meter>` | Inputs | Cascading bar springs, escalating speed lines, LV 5 overdrive (`ゴゴゴゴ`) |
| Feature Toggle Card | `<sakuga-card-toggle>` | Selection | Full-card squashy bounce, diagonal anime slash, crystal shards (`ズザッ`) |
| Radial Speed Dial | `<sakuga-fab>` | Actions | Spring-spinning `+` trigger fanning 3 distinct VFX actions (`シュッ`) |
| Cel Swatch Picker | `<sakuga-swatches>` | Selection | Ink-rimmed cel paint dots with splash and color-matched kira (`ポン`) |
| Countdown Ring | `<sakuga-timer>` | Feedback | Circular SVG ring with per-second ticks and `00s` shockwave finisher (`ドン!`) |
| Split Action Button | `<sakuga-split-button>` | Actions | Primary impact burst (`ドン!`) paired with a spring-unfolded action menu |

---

## Getting Started

### Run the Showcase Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build & Test

```bash
npm run build
npm run lint
npx tsx --test src/lib/sakugaStudio.test.ts
```

---

## Using the Web Components in Any HTML Page

Load any upstream Sakuga VFX core script first (so `window.SakugaFX` initializes), then optionally load `extras.js` for the 18 Anime VFX Studio Pack controls:

```html
<!-- Upstream Sakuga VFX core component(s) -->
<script src="/sakuga-vfx/button.js"></script>
<script src="/sakuga-vfx/toggle.js"></script>

<!-- Anime VFX Studio Pack extensions (requires any core script above) -->
<script src="/sakuga-vfx/extras.js"></script>

<sakuga-button>Confirm</sakuga-button>
<sakuga-like count="24" label="Like keyframe"></sakuga-like>
<sakuga-hold label="Hold to Purge" done-label="Purged!"></sakuga-hold>
```

### Upstream CLI Installation (Sakuga VFX Core)

To install any of the 12 original core controls directly from the upstream Sakuga VFX registry:

```bash
npx shadcn add finktheartist/sakuga-vfx/button
npx shadcn add finktheartist/sakuga-vfx/toggle
npx shadcn add finktheartist/sakuga-vfx/slider
```

### Theming with `--sk-*` CSS Variables

All 30 controls share zero-specificity `:where(:root)` CSS tokens so you can restyle every control at once:

```css
:root {
  --sk-card: #ffffff;
  --sk-ink: #1d1a4a;
  --sk-dim: #595488;
  --sk-soft: #b8b3ff;
  --sk-pri: #8f8df7;
  --sk-pri-ink: #1d1a4a;
  --sk-acc: #ff5fa8;
  --sk-track: #c9cbe0;
  --sk-on-pri: #ffffff;
}
```

To sync the overlay canvas cel-shading palette as well, update `window.SakugaFX.P` (`fill`, `shade`, `line`, `accent`, `ink`, `sfx`).

---

## Acknowledgements & License

**Anime VFX** is built directly on top of **[Sakuga VFX](https://github.com/finktheartist/sakuga-vfx)**, created and open-sourced by **Justin Finkelman** under the **MIT License**.

- The 11 upstream single-file Web Component bundles (`button.js`, `toggle.js`, `slider.js`, `checkbox.js`, `radio.js`, `input.js`, `tabs.js`, `progress.js`, `rating.js`, `toast.js`, `tooltip.js`), the shared `window.SakugaFX` physics/canvas engine, the 43-frame hand-painted toggle sprite sheet, and the traced manga SFX vector glyphs are the original work of Justin Finkelman.
- The original upstream MIT license text is preserved intact in [`public/sakuga-vfx/LICENSE`](public/sakuga-vfx/LICENSE).
- All custom elements retain their `<sakuga-*>` tag names, `window.SakugaFX` runtime namespace, and `--sk-*` CSS tokens for full compatibility with upstream Sakuga VFX.
