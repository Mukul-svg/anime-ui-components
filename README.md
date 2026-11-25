# Koma Desk · Powered by Anime VFX

A real, local-first **Daily Task Planner, Focus Sprint Timer, and Standup Exporter** (**Koma Desk**) powered by all **35 Anime VFX Web Components** — plus the complete interactive 35-control Component Showcase & Canvas VFX Lab accessible from the top navigation.

> **Built on [Sakuga VFX](https://github.com/finktheartist/sakuga-vfx) by Justin Finkelman (MIT License).**
> Anime VFX bundles the 12 original upstream Sakuga VFX controls verbatim and extends the shared `window.SakugaFX` physics and canvas engine with 23 additional Studio Pack Web Components. Every control in Koma Desk mutates real persisted state (`localStorage`) with zero backend dependencies, making it 100% static and GitHub Pages ready.

---

## Features

- **Tasks Workspace (`Tasks`)** — Create, search, filter (`All` / `Active` / `Done` + tag filters), sort (`Priority` / `Newest` / `Estimate`), boost kudos, edit sprint estimates, inspect notes, complete tasks with live daily progress & combo streaks, and switch live `--sk-*` color palettes.
- **Focus Sprint Studio (`Focus`)** — Real countdown ring timer (`10s` demo, `5m`, `25m`, `45m`, or custom slider minutes) with Web Audio API harmonic completion chime, optional auto-complete on finish, distraction-dimming Deep Focus Mode, star quality ratings, quick-action radial dial, and logged focus session history.
- **Standup Export & Scratchpad (`Summary`)** — Auto-generated Markdown standup reports with one-click copy, real `.md` and `.json` file downloads, a 4-digit PIN-locked private scratchpad (`2026`), chronological activity log, and press-and-hold purge protection for completed tasks.
- **35-Control Anime VFX Library (`Components`)** — Interactive slow-motion Keyframe Stage, full 35-control Gallery, Direct Canvas VFX Lab, Live Composite Form Playground, and Live `--sk-*` Theme Studio.

---

## Component Catalog (35 Controls)

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

### Anime VFX Studio Pack Extensions (23)

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
| Compact Action Button | `<sakuga-action-button>` | Actions | Compact cel-shaded icon+label trigger with squash bounce, speed lines & kira (`シュッ`) |
| Icon Action Button | `<sakuga-icon-button>` | Actions | Square cel-shaded icon button with danger shard shatter or crisp ticks (`カチッ`) |
| Multiline Textarea | `<sakuga-textarea>` | Inputs | Cel-shaded multiline text box with focus spring pop & keystroke dust puffs |
| Ink Underline Nav | `<sakuga-nav>` | Selection | Single-line typographic nav links with velocity-stretched spring cel underline (`カチッ`) |
| Impact Alert Banner | `<sakuga-alert>` | Feedback | Cel-shaded notice/validation banner with entry spring pop & shard dismiss (`シュッ`) |

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

### Deploy to GitHub Pages

Anime VFX is a 100% static client-side app with relative asset paths (`base: './'`) and a ready-to-run workflow in `.github/workflows/deploy-pages.yml`:

1. Push this repository to GitHub (default branch `main`).
2. In your repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or trigger the **Deploy Anime VFX to GitHub Pages** workflow manually in the **Actions** tab) to publish automatically.

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
