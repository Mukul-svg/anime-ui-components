import type {
  ControlCategory,
  FormValidationResult,
  PlaybackModeOption,
  RenderJobInput,
  SakugaCanvasPalette,
  SakugaControlSpec,
  SakugaSfxWord,
  SakugaThemePreset,
} from '../types/sakuga';

export const SAKUGA_REPO = 'finktheartist/sakuga-vfx';
export const SAKUGA_GITHUB_URL = `https://github.com/${SAKUGA_REPO}`;

export const PLAYBACK_MODES: PlaybackModeOption[] = [
  { id: 'realtime', label: '1× Live', speed: 1 },
  { id: 'slow', label: '0.35× Slow', speed: 0.35 },
  { id: 'study', label: '0.15× Study', speed: 0.15 },
];

export const SFX_WORDS: Array<{ id: SakugaSfxWord; kana: string; romaji: string; feel: string }> = [
  { id: 'don', kana: 'ドン!', romaji: 'Don!', feel: 'Heavy impact confirm' },
  { id: 'zuza', kana: 'ズザッ', romaji: 'Zuza!', feel: 'Skid & dust landing' },
  { id: 'kachi', kana: 'カチッ', romaji: 'Kachi', feel: 'Crisp mechanical click' },
  { id: 'pon', kana: 'ポン', romaji: 'Pon', feel: 'Springy pop-in' },
  { id: 'gogo', kana: 'ゴゴゴゴ', romaji: 'Gogogo', feel: 'Menacing rumble surge' },
  { id: 'shu', kana: 'シュッ', romaji: 'Shu!', feel: 'Swift air slice' },
];

export const THEME_PRESETS: SakugaThemePreset[] = [
  {
    id: 'classic',
    name: 'Classic Sakuga',
    subtitle: 'Original paper, indigo ink, lavender cel shade, pink burst',
    card: '#ffffff',
    ink: '#1d1a4a',
    dim: '#595488',
    soft: '#b8b3ff',
    pri: '#8f8df7',
    priInk: '#1d1a4a',
    acc: '#ff5fa8',
    track: '#c9cbe0',
    line: '#5a4fd8',
    onPri: '#ffffff',
  },
  {
    id: 'shonen',
    name: 'Shonen Crimson',
    subtitle: 'Warm manga ink, amber impact shade, vermilion needles',
    card: '#ffffff',
    ink: '#221824',
    dim: '#6c586e',
    soft: '#fcd34d',
    pri: '#f59e0b',
    priInk: '#221824',
    acc: '#e11d48',
    track: '#dfd4dc',
    line: '#b45309',
    onPri: '#ffffff',
  },
  {
    id: 'cobalt',
    name: 'Cel Cobalt',
    subtitle: 'Mecha drafting navy, sky cel shadow, tangerine flare',
    card: '#ffffff',
    ink: '#0f2147',
    dim: '#4d6089',
    soft: '#93c5fd',
    pri: '#3b82f6',
    priInk: '#0f2147',
    acc: '#f97316',
    track: '#cbd5e1',
    line: '#1d4ed8',
    onPri: '#ffffff',
  },
  {
    id: 'matcha',
    name: 'Studio Genga',
    subtitle: 'Pine graphite ink, mint cel highlight, persimmon stamp',
    card: '#ffffff',
    ink: '#143026',
    dim: '#4a6b5d',
    soft: '#86efac',
    pri: '#22c55e',
    priInk: '#143026',
    acc: '#ea580c',
    track: '#cddcd5',
    line: '#15803d',
    onPri: '#ffffff',
  },
  {
    id: 'monochrome',
    name: 'Manga Ink',
    subtitle: 'Pure screentone black, neutral graphite shadow, stark contrast',
    card: '#ffffff',
    ink: '#121214',
    dim: '#52525b',
    soft: '#d4d4d8',
    pri: '#52525b',
    priInk: '#121214',
    acc: '#18181b',
    track: '#d4d4d8',
    line: '#27272a',
    onPri: '#ffffff',
  },
];

export const SAKUGA_CATALOG: SakugaControlSpec[] = [
  {
    key: 'button-primary',
    id: 'button',
    name: 'Primary button',
    tag: 'sakuga-button',
    source: 'upstream',
    category: 'actions',
    sfxLabel: 'ドン!',
    effectSummary: 'Squash hold, 1-frame invert, impact burst, rolling smoke, done check',
    how: 'Press and hold to squash flat, then release to fire the burst.',
    html: '<sakuga-button data-demo="primary">Confirm</sakuga-button>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<sakuga-button>Confirm</sakuga-button>\n<!-- After async success: el.done() -->`,
    attributes: [
      { name: 'variant', description: 'Default primary or "secondary" for a lighter squash and wedge burst.' },
      { name: 'type', description: 'Supports "submit" inside native HTML forms.' },
      { name: 'disabled', description: 'Disables pointer interaction and spring squash.' },
    ],
    events: [
      { name: 'click', description: 'Fires standard click event; call el.done() after success to land the checkmark.' },
    ],
    wireNotes: [
      'Use <sakuga-button>Confirm</sakuga-button> for primary actions and variant="secondary" for quieter controls.',
      'Listen for click as usual, and call el.done() only when the action succeeds.',
    ],
  },
  {
    key: 'button-secondary',
    id: 'button',
    name: 'Secondary button',
    tag: 'sakuga-button',
    source: 'upstream',
    category: 'actions',
    sfxLabel: 'Wedges',
    effectSummary: 'Compact spring squash and three cel-shaded directional wedges',
    how: 'Click for a brisk secondary squash without overtaking the page.',
    html: '<sakuga-button variant="secondary">Cancel</sakuga-button>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<sakuga-button variant="secondary">Cancel</sakuga-button>`,
    attributes: [
      { name: 'variant="secondary"', description: 'Switches to crisp paper fill with subtle directional ticks.' },
      { name: 'disabled', description: 'Disables click and spring animation.' },
    ],
    events: [{ name: 'click', description: 'Standard DOM click event.' }],
    wireNotes: [
      'Pair secondary buttons beside primary buttons so only confirm actions trigger the full burst.',
    ],
  },
  {
    key: 'toggle',
    id: 'toggle',
    name: 'Toggle',
    tag: 'sakuga-toggle',
    source: 'upstream',
    category: 'selection',
    sfxLabel: '43 Frames',
    effectSummary: 'Hand-painted 43-frame smear, slam splash, and flooded track settle',
    how: 'Flip it on, then flip it back off to watch the reverse splash.',
    html: '<sakuga-toggle label="Notifications"></sakuga-toggle>',
    usageSnippet: `<script src="/sakuga-vfx/toggle.js"></script>\n<sakuga-toggle label="Notifications" name="notify"></sakuga-toggle>`,
    attributes: [
      { name: 'label', description: 'Accessible screen-reader label for the switch.' },
      { name: 'checked', description: 'Initial boolean state; programmatic updates jump without animation.' },
      { name: 'name', description: 'Participates in native FormData like a checkbox.' },
    ],
    events: [{ name: 'change', description: 'Fires when toggled; inspect el.checked.' }],
    wireNotes: [
      'The 43-frame WebP sprite sheet is embedded inside toggle.js (~495 KB), requiring zero external image fetches.',
    ],
  },
  {
    key: 'slider',
    id: 'slider',
    name: 'Slider',
    tag: 'sakuga-slider',
    source: 'upstream',
    category: 'inputs',
    sfxLabel: 'Cumulus',
    effectSummary: 'Teardrop velocity stretch, spring lag, rolling clouds, release crescent',
    how: 'Drag it rapidly across the track and let go while still moving.',
    html: '<sakuga-slider value="30" label="Volume"></sakuga-slider>',
    usageSnippet: `<script src="/sakuga-vfx/slider.js"></script>\n<sakuga-slider value="30" min="0" max="100" unit="%" label="Volume"></sakuga-slider>`,
    attributes: [
      { name: 'value / min / max / step', description: 'Numeric range configuration.' },
      { name: 'unit', description: 'Suffix rendered inside the floating value bubble (defaults to "%").' },
      { name: '--sk-slider-width', description: 'CSS custom property controlling track width (default 230px).' },
    ],
    events: [
      { name: 'input', description: 'Fires continuously while dragging.' },
      { name: 'change', description: 'Fires on pointer release with final el.value.' },
    ],
    wireNotes: [
      'Reserve ~30px headroom above the track so the spring value bubble has clear breathing room.',
    ],
  },
  {
    key: 'checkbox',
    id: 'checkbox',
    name: 'Checkbox',
    tag: 'sakuga-checkbox',
    source: 'upstream',
    category: 'selection',
    sfxLabel: 'ズザッ',
    effectSummary: 'Twin orbiting crescents, flying crystal shards, self-drawing tick, dotted SFX',
    how: 'Tick and untick to inspect the crystal burst and screentone lettering.',
    html: '<sakuga-checkbox>Remember me</sakuga-checkbox>',
    usageSnippet: `<script src="/sakuga-vfx/checkbox.js"></script>\n<sakuga-checkbox name="remember">Remember me</sakuga-checkbox>`,
    attributes: [
      { name: 'checked', description: 'Controls checked state.' },
      { name: 'name / value', description: 'Submits with enclosing native <form>.' },
    ],
    events: [{ name: 'change', description: 'Fires on toggle; inspect el.checked.' }],
    wireNotes: ['Text content inside <sakuga-checkbox> becomes its accessible label automatically.'],
  },
  {
    key: 'radio',
    id: 'radio',
    name: 'Radio',
    tag: 'sakuga-radio',
    source: 'upstream',
    category: 'selection',
    sfxLabel: 'ポン',
    effectSummary: 'Spring-in dot, wedge fan, twin smoke puffs, hollow ポン',
    how: 'Switch between options to pop the spring dot and hollow SFX.',
    html: '<sakuga-radio label="Plan"><option value="a" selected>Option A</option><option value="b">Option B</option></sakuga-radio>',
    usageSnippet: `<script src="/sakuga-vfx/radio.js"></script>\n<sakuga-radio label="Plan" name="plan">\n  <option value="a" selected>Option A</option>\n  <option value="b">Option B</option>\n</sakuga-radio>`,
    attributes: [
      { name: 'label', description: 'Accessible name for the radio group.' },
      { name: '<option> children', description: 'Defines choices and initial selected option.' },
    ],
    events: [{ name: 'change', description: 'Fires on selection change; read el.value.' }],
    wireNotes: ['Populate choices with native <option> elements inside <sakuga-radio>.'],
  },
  {
    key: 'input',
    id: 'input',
    name: 'Text input',
    tag: 'sakuga-input',
    source: 'upstream',
    category: 'inputs',
    sfxLabel: 'Dust',
    effectSummary: 'Caret-tracked keystroke dust puffs on every character typed',
    how: 'Focus the field and type a quick burst of letters.',
    html: '<sakuga-input label="Text" placeholder="Type something"></sakuga-input>',
    usageSnippet: `<script src="/sakuga-vfx/input.js"></script>\n<sakuga-input label="Project" placeholder="Type something" name="title"></sakuga-input>`,
    attributes: [
      { name: 'type', description: 'Supports text, email, search, url, tel, and password.' },
      { name: 'placeholder / label', description: 'Placeholder hint and accessible screen-reader label.' },
      { name: '--sk-input-width', description: 'CSS custom property controlling field width (default 230px).' },
    ],
    events: [
      { name: 'input', description: 'Fires on every keystroke; read el.value.' },
      { name: 'change', description: 'Fires on commit/blur.' },
    ],
    wireNotes: ['Works inside native forms via ElementInternals when given a name attribute.'],
  },
  {
    key: 'tabs',
    id: 'tabs',
    name: 'Tabs',
    tag: 'sakuga-tabs',
    source: 'upstream',
    category: 'selection',
    sfxLabel: 'Smear',
    effectSummary: 'Velocity-stretched sliding indicator with landing wedges and dust puff',
    how: 'Click another tab or focus and press Left / Right arrow keys.',
    html: '<sakuga-tabs label="Sections"><option>Home</option><option>Profile</option><option>Settings</option></sakuga-tabs>',
    usageSnippet: `<script src="/sakuga-vfx/tabs.js"></script>\n<sakuga-tabs label="Sections">\n  <option value="home">Home</option>\n  <option value="profile">Profile</option>\n  <option value="settings">Settings</option>\n</sakuga-tabs>`,
    attributes: [
      { name: 'label', description: 'Accessible label for the tablist.' },
      { name: 'selected (property)', description: 'Zero-based active tab index.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { index, value, label }.' },
    ],
    wireNotes: ['Listen for change and render the matching tab panel in your own layout.'],
  },
  {
    key: 'progress',
    id: 'progress',
    name: 'Progress',
    tag: 'sakuga-progress',
    source: 'upstream',
    category: 'inputs',
    sfxLabel: 'ゴゴゴゴ · ドン!',
    effectSummary: 'Riding storm cloud, levitating pebbles, rumbling ゴゴゴゴ, finisher burst + check',
    how: 'Surges once into view with storm clouds and pebbles, or drive it with the buttons below.',
    html: '<sakuga-progress label="Loading"></sakuga-progress>',
    usageSnippet: `<script src="/sakuga-vfx/progress.js"></script>\n<sakuga-progress label="Uploading"></sakuga-progress>\n<!-- Drive with el.set(0.45) and listen for "sakuga:done" -->`,
    attributes: [
      { name: 'label', description: 'Accessible task description.' },
      { name: 'demo', description: 'Loops a surged preview load (remove in production).' },
      { name: '--sk-progress-width', description: 'Bar width (default 280px).' },
    ],
    events: [
      { name: 'sakuga:done', description: 'Fires once when the eased bar finishes at 100%.' },
    ],
    wireNotes: [
      'Call el.set(0..1) as task progress updates; call el.reset() to restart from zero.',
    ],
    wide: true,
  },
  {
    key: 'rating',
    id: 'rating',
    name: 'Rating',
    tag: 'sakuga-rating',
    source: 'upstream',
    category: 'selection',
    sfxLabel: '5-Star Burst',
    effectSummary: 'Cascading spring star pops with a celebratory impact burst at 5 stars',
    how: 'Click star 5 for the full cascade and back-layer impact burst.',
    html: '<sakuga-rating label="Rating"></sakuga-rating>',
    usageSnippet: `<script src="/sakuga-vfx/rating.js"></script>\n<sakuga-rating label="Rating" name="score"></sakuga-rating>`,
    attributes: [
      { name: 'label', description: 'Accessible name for the 1–5 star group.' },
      { name: 'name', description: 'Form field name when inside a <form>.' },
    ],
    events: [{ name: 'change', description: 'Fires on rating change; read el.value (0 to 5).' }],
    wireNotes: ['Clicking the currently lit star clears the rating back to 0.'],
  },
  {
    key: 'toast',
    id: 'toast',
    name: 'Toast',
    tag: 'sakuga-toast',
    source: 'upstream',
    category: 'feedback',
    sfxLabel: 'ズザッ',
    effectSummary: 'Speed-smear slide-in, skid dust landing with ズザッ, spring shrink exit',
    how: 'Press Save to launch the smear entry and dust skid.',
    html: '<div class="flex flex-col items-center gap-5"><sakuga-button variant="secondary" data-demo="save">Save</sakuga-button><sakuga-toast></sakuga-toast></div>',
    usageSnippet: `<script src="/sakuga-vfx/toast.js"></script>\n<sakuga-toast duration="2600"></sakuga-toast>\n<!-- Trigger via el.show("Saved successfully!") -->`,
    attributes: [
      { name: 'duration', description: 'Visible duration in milliseconds (default 2600).' },
    ],
    events: [
      { name: 'show() / hide()', description: 'Imperative methods on the element; exposes live status region.' },
    ],
    wireNotes: ['Position <sakuga-toast> fixed at a viewport corner for app-wide notifications.'],
  },
  {
    key: 'tooltip',
    id: 'tooltip',
    name: 'Tooltip',
    tag: 'sakuga-tooltip',
    source: 'upstream',
    category: 'feedback',
    sfxLabel: 'カチッ',
    effectSummary: 'Speech-bubble spring pop with twin puffs and crisp カチッ lettering',
    how: 'Hover, focus, or click the help trigger; press Escape to dismiss.',
    html: '<sakuga-tooltip text="Helpful hint!"></sakuga-tooltip>',
    usageSnippet: `<script src="/sakuga-vfx/tooltip.js"></script>\n<sakuga-tooltip text="Helpful hint!" label="More info"></sakuga-tooltip>`,
    attributes: [
      { name: 'text', description: 'Hint message rendered inside the speech bubble.' },
      { name: 'label', description: 'Accessible name for the trigger button (default "Help").' },
    ],
    events: [
      { name: 'hover / focus / click', description: 'Opens the bubble automatically; Escape closes it.' },
    ],
    wireNotes: ['Custom inner HTML replaces the default "?" button glyph.'],
  },
  // ───────── Studio Extensions built on window.SakugaFX ─────────
  {
    key: 'like',
    id: 'extras',
    name: 'Like button',
    tag: 'sakuga-like',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'ポン',
    effectSummary: 'Heart spring pop, back-layer burst, accent ticks, sparkle glint, hollow ポン',
    how: 'Click to like and pop the heart; click again for a quiet puff undo.',
    html: '<sakuga-like count="24" label="Like keyframe"></sakuga-like>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-like count="24" label="Like post"></sakuga-like>`,
    attributes: [
      { name: 'count', description: 'Initial tabular integer counter.' },
      { name: 'liked', description: 'Boolean pressed state attribute.' },
      { name: 'label', description: 'Accessible button name.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { liked, count }.' },
    ],
    wireNotes: [
      'Built on window.SakugaFX.Base in /sakuga-vfx/extras.js and inherits all --sk-* color tokens.',
    ],
  },
  {
    key: 'accordion',
    id: 'extras',
    name: 'Accordion',
    tag: 'sakuga-accordion',
    source: 'studio',
    category: 'feedback',
    sfxLabel: 'シュッ',
    effectSummary: 'Horizontal slash seam reveal, speed lines, corner puffs, spring chevron, シュッ',
    how: 'Click the header bar to slice open the disclosure panel.',
    html: '<sakuga-accordion summary="Keyframe breakdown">Anticipation on press, impact hit on frame 1, cel smoke follow-through, and damped spring settle.</sakuga-accordion>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-accordion summary="Keyframe notes">Details here.</sakuga-accordion>`,
    attributes: [
      { name: 'summary', description: 'Header text rendered inside the disclosure trigger button.' },
      { name: 'open', description: 'Boolean open state attribute.' },
      { name: '--sk-accordion-width', description: 'Optional CSS width override (default 280px).' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { open }.' },
    ],
    wireNotes: [
      'Slot any HTML inside <sakuga-accordion>; closing fires a subtle recoil wobble.',
    ],
  },
  {
    key: 'stepper',
    id: 'extras',
    name: 'Quantity stepper',
    tag: 'sakuga-stepper',
    source: 'studio',
    category: 'inputs',
    sfxLabel: 'カチッ',
    effectSummary: 'Spring-scaled tabular counter, directional tilt, カチッ ticks, wall-bump wobble at min/max',
    how: 'Click − or + (or use arrow keys); hit 0 or 5 to feel the bump stop.',
    html: '<sakuga-stepper value="2" min="0" max="5" label="Copies"></sakuga-stepper>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-stepper value="2" min="0" max="5" label="Copies" name="qty"></sakuga-stepper>`,
    attributes: [
      { name: 'value / min / max / step', description: 'Numeric bounds and increment step.' },
      { name: 'label', description: 'Accessible spinbutton label.' },
      { name: 'name', description: 'Form field name via ElementInternals.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { value }.' },
    ],
    wireNotes: [
      'Focus the center value and press ArrowUp / ArrowDown for keyboard stepping.',
    ],
  },
  {
    key: 'select',
    id: 'extras',
    name: 'Dropdown select',
    tag: 'sakuga-select',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'ズザッ',
    effectSummary: 'Spring-unfolded listbox menu, crystal shards, speed streaks, screentone ズザッ commit',
    how: 'Open the menu and pick another frame rate to fire the commit burst.',
    html: '<sakuga-select label="Cadence"><option value="12fps" selected>Sakuga 12fps</option><option value="24fps">Full 24fps</option><option value="8fps">Limited 8fps</option></sakuga-select>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-select label="Cadence" name="fps">\n  <option value="12fps" selected>Sakuga 12fps</option>\n  <option value="24fps">Full 24fps</option>\n</sakuga-select>`,
    attributes: [
      { name: 'label', description: 'Accessible name for trigger and listbox.' },
      { name: '<option> children', description: 'List of selectable choices.' },
      { name: '--sk-select-width', description: 'Custom trigger width (default 220px).' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { index, value, label }.' },
    ],
    wireNotes: [
      'Press Escape or click outside to close the menu cleanly.',
    ],
  },
  {
    key: 'copy',
    id: 'extras',
    name: 'Copy button',
    tag: 'sakuga-copy',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'カチッ',
    effectSummary: 'Icon spring flip to checkmark, crystal shards, kira sparkle, hollow カチッ',
    how: 'Click to copy the snippet and watch the icon spring-flip to a check.',
    html: '<sakuga-copy label="Copy CLI" value="npx shadcn add finktheartist/sakuga-vfx/button"></sakuga-copy>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-copy label="Copy CLI" value="npm install"></sakuga-copy>`,
    attributes: [
      { name: 'label', description: 'Default button label before copying.' },
      { name: 'value', description: 'Text string written to the clipboard on click.' },
    ],
    events: [
      { name: 'sakuga:copy', description: 'CustomEvent with e.detail = { value }.' },
    ],
    wireNotes: [
      'Automatically resets back to its resting label after 1.6s on the shared SakugaFX clock.',
    ],
  },
  {
    key: 'chip-group',
    id: 'extras',
    name: 'Multi-select chips',
    tag: 'sakuga-chip-group',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'ポン',
    effectSummary: 'Per-chip squash and pop, back-layer mini burst, accent ticks, hollow ポン',
    how: 'Toggle multiple animation tags on and off to chain spring pops.',
    html: '<sakuga-chip-group label="VFX tags"><option value="smear" selected>Smear</option><option value="impact">Impact</option><option value="cel">Cel Shade</option><option value="sfx">Manga SFX</option></sakuga-chip-group>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-chip-group label="Tags" name="tags">\n  <option value="smear" selected>Smear</option>\n  <option value="impact">Impact</option>\n</sakuga-chip-group>`,
    attributes: [
      { name: 'label', description: 'Accessible name for the chip toggle group.' },
      { name: '<option> children', description: 'Toggleable chip items; add selected for active state.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { values, toggled, selected }.' },
    ],
    wireNotes: [
      'Submits comma-separated active values inside native HTML forms.',
    ],
  },
  {
    key: 'segmented',
    id: 'extras',
    name: 'Segmented control',
    tag: 'sakuga-segmented',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'カチッ',
    effectSummary: 'Spring-gliding thumb with velocity stretch, directional speed lines, hollow カチッ',
    how: 'Switch modes by clicking or using Left / Right arrow keys.',
    html: '<sakuga-segmented label="Cadence mode"><option value="12fps" selected>12fps</option><option value="24fps">24fps</option><option value="smear">Smear</option></sakuga-segmented>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-segmented label="Mode" name="mode">\n  <option value="12fps" selected>12fps</option>\n  <option value="24fps">24fps</option>\n  <option value="smear">Smear</option>\n</sakuga-segmented>`,
    attributes: [
      { name: 'label', description: 'Accessible radiogroup label.' },
      { name: '<option> children', description: 'Segments to render; add selected for initial choice.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { index, value, label }.' },
    ],
    wireNotes: [
      'Participates in native forms via ElementInternals and supports roving tabindex arrow navigation.',
    ],
  },
  {
    key: 'otp',
    id: 'extras',
    name: 'Passcode / OTP',
    tag: 'sakuga-otp',
    source: 'studio',
    category: 'inputs',
    sfxLabel: 'ドン!',
    effectSummary: 'Per-digit spring pop, accent ticks, and 4-digit completion burst + kira + ドン!',
    how: 'Type 4 digits (or paste a 4-digit code) to trigger the completion burst.',
    html: '<sakuga-otp length="4" label="Verification code"></sakuga-otp>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-otp length="4" label="Verification code" name="otp"></sakuga-otp>`,
    attributes: [
      { name: 'length', description: 'Number of character boxes (3 to 6, default 4).' },
      { name: 'label', description: 'Accessible group name for the code cells.' },
    ],
    events: [
      { name: 'input', description: 'Fires on each character change with e.detail = { value }.' },
      { name: 'complete', description: 'Fires when all boxes are filled with e.detail = { value }.' },
    ],
    wireNotes: [
      'Auto-advances focus on entry, steps back on Backspace, and supports multi-digit paste.',
    ],
  },
  {
    key: 'hold',
    id: 'extras',
    name: 'Hold to confirm',
    tag: 'sakuga-hold',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'ゴゴゴゴ · ドン!',
    effectSummary: 'Rising charge bar, shake buildup, ゴゴゴゴ rumble, shockwave ring + shards + ドン!',
    how: 'Press and hold for ~0.85s to charge to 100%, or release early for a recoil snap.',
    html: '<sakuga-hold label="Hold to Purge" done-label="Purged!"></sakuga-hold>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-hold label="Hold to Purge" done-label="Purged!" duration="850"></sakuga-hold>`,
    attributes: [
      { name: 'label', description: 'Resting call-to-action text.' },
      { name: 'done-label', description: 'Confirmed state text displayed after full hold.' },
      { name: 'duration', description: 'Hold duration in milliseconds (default 850).' },
    ],
    events: [
      { name: 'confirm', description: 'Fires when charged to 100% with e.detail = { count }.' },
      { name: 'cancel', description: 'Fires if released early with e.detail = { progress }.' },
    ],
    wireNotes: [
      'Works with both pointer hold and holding Space or Enter when focused.',
    ],
  },
  {
    key: 'counter',
    id: 'extras',
    name: 'Combo counter',
    tag: 'sakuga-counter',
    source: 'studio',
    category: 'feedback',
    sfxLabel: 'ポン',
    effectSummary: 'Spring-scaled tabular counter, kira glint, smoke donut and ポン on +10 milestones',
    how: 'Click the number for +1, hit +10 for a milestone burst, or reset to 000.',
    html: '<sakuga-counter value="42"></sakuga-counter>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-counter value="42"></sakuga-counter>`,
    attributes: [
      { name: 'value', description: 'Initial non-negative integer count.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { value, delta }.' },
    ],
    wireNotes: [
      'Crossing any multiple of 10 triggers an impact burst, floating smoke donut, and hollow ポン.',
    ],
  },
  {
    key: 'bell',
    id: 'extras',
    name: 'Notification bell',
    tag: 'sakuga-bell',
    source: 'studio',
    category: 'feedback',
    sfxLabel: 'カチッ',
    effectSummary: 'Underdamped swinging bell, twin vibration arcs, badge spring pop, カチッ / ポン',
    how: 'Click to ring and clear unread alerts; click again to pop 3 fresh pings.',
    html: '<sakuga-bell count="3" label="Studio alerts"></sakuga-bell>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-bell count="3" label="Notifications"></sakuga-bell>`,
    attributes: [
      { name: 'count', description: 'Initial unread notification badge count.' },
      { name: 'label', description: 'Accessible button name.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { unread, action }.' },
    ],
    wireNotes: [
      'Automatically hides the badge at 0 and announces updated unread counts cleanly.',
    ],
  },
  {
    key: 'tags',
    id: 'extras',
    name: 'Dismissible tags',
    tag: 'sakuga-tags',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'シュッ',
    effectSummary: 'Crystal shard shatter, smoke puff, hollow シュッ on remove, and burst restore',
    how: 'Dismiss any tag with × to shatter it, then click + Restore to pop them back.',
    html: '<sakuga-tags label="Shot tags"><option value="keyframes">Keyframes</option><option value="smear">Smear</option><option value="sakuga">Sakuga</option></sakuga-tags>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-tags label="Shot tags" name="tags">\n  <option value="keyframes">Keyframes</option>\n  <option value="smear">Smear</option>\n</sakuga-tags>`,
    attributes: [
      { name: 'label', description: 'Accessible list label.' },
      { name: '<option> children', description: 'Initial list of removable tags.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { values, action, tag }.' },
    ],
    wireNotes: [
      'Reveals an inline + Restore pill whenever one or more tags have been dismissed.',
    ],
  },
  {
    key: 'meter',
    id: 'extras',
    name: 'Power level meter',
    tag: 'sakuga-meter',
    source: 'studio',
    category: 'inputs',
    sfxLabel: 'ゴゴゴゴ',
    effectSummary: 'Cascading bar springs, escalating ticks/lines, and LV 5 shockwave + ゴゴゴゴ overdrive',
    how: 'Click any bar from LV 1 to LV 5 — maxing LV 5 unleashes the overdrive burst.',
    html: '<sakuga-meter value="3" label="Sakuga energy"></sakuga-meter>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-meter value="3" label="Energy" name="level"></sakuga-meter>`,
    attributes: [
      { name: 'value', description: 'Initial active level from 1 to 5.' },
      { name: 'label', description: 'Accessible radiogroup name.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { level, max }.' },
    ],
    wireNotes: [
      'Switches active bar fills to --sk-acc when pushed to maximum LV 5.',
    ],
  },
  {
    key: 'card-toggle',
    id: 'extras',
    name: 'Feature toggle card',
    tag: 'sakuga-card-toggle',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'ズザッ',
    effectSummary: 'Full-card squashy bounce, diagonal anime slash, crystal shards, screentone ズザッ',
    how: 'Click the option card to toggle Impact Frames with a diagonal slash reveal.',
    html: '<sakuga-card-toggle title="Impact Frames" description="2-frame monochrome hit flash"></sakuga-card-toggle>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-card-toggle title="Impact Frames" description="2-frame hit flash" name="impact"></sakuga-card-toggle>`,
    attributes: [
      { name: 'title / description', description: 'Primary label and supporting description copy.' },
      { name: 'checked', description: 'Boolean initial active state.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { checked }.' },
    ],
    wireNotes: [
      'Submits "on" inside native forms when checked via ElementInternals.',
    ],
  },
  {
    key: 'fab',
    id: 'extras',
    name: 'Radial speed dial',
    tag: 'sakuga-fab',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'シュッ',
    effectSummary: 'Spring-spinning + trigger fanning 3 VFX actions (Slash, Spark, Shatter)',
    how: 'Click + to fan out quick actions, then pick Slash, Spark, or Shatter.',
    html: '<sakuga-fab></sakuga-fab>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-fab></sakuga-fab>`,
    attributes: [
      { name: 'aria-expanded', description: 'Managed automatically on the primary + trigger.' },
    ],
    events: [
      { name: 'action', description: 'CustomEvent with e.detail = { action } when a mini action fires.' },
    ],
    wireNotes: [
      'Each menu item triggers a distinct canvas primitive (slash, burst+kira, or shards+zuza).',
    ],
  },
  {
    key: 'swatches',
    id: 'extras',
    name: 'Cel swatch picker',
    tag: 'sakuga-swatches',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'ポン',
    effectSummary: 'Ink-rimmed cel paint dots with water splash, color-matched kira sparkle, hollow ポン',
    how: 'Pick any cel paint dot to splash ink and tint the sparkle star.',
    html: '<sakuga-swatches label="Cel paint"><option value="#8f8df7" selected>Lavender</option><option value="#ff5fa8">Sakura</option><option value="#3b82f6">Cobalt</option><option value="#22c55e">Genga Mint</option><option value="#f59e0b">Shonen Amber</option></sakuga-swatches>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-swatches label="Cel paint" name="color">\n  <option value="#8f8df7" selected>Lavender</option>\n  <option value="#ff5fa8">Sakura</option>\n</sakuga-swatches>`,
    attributes: [
      { name: 'label', description: 'Accessible radiogroup label.' },
      { name: '<option> children', description: 'Color hex value attribute + readable label text.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { value, label }.' },
    ],
    wireNotes: [
      'Tints the emitted kira sparkle to match the chosen swatch hex automatically.',
    ],
  },
  {
    key: 'timer',
    id: 'extras',
    name: 'Countdown ring',
    tag: 'sakuga-timer',
    source: 'studio',
    category: 'feedback',
    sfxLabel: 'ドン!',
    effectSummary: 'Circular SVG ring with per-second spring ticks and 00s shockwave burst + ドン!',
    how: 'Press Start to run a crisp 5-second countdown straight into the finisher burst.',
    html: '<sakuga-timer seconds="5"></sakuga-timer>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-timer seconds="5"></sakuga-timer>`,
    attributes: [
      { name: 'seconds', description: 'Countdown length in seconds (3 to 60, default 5).' },
    ],
    events: [
      { name: 'state', description: 'Fires on Start, Pause, or Reset with { running, remaining }.' },
      { name: 'tick', description: 'Fires on each whole second tick.' },
      { name: 'complete', description: 'Fires at 00s with the shockwave finisher.' },
    ],
    wireNotes: [
      'Runs on the shared window.SakugaFX clock, so hero slow-motion speed controls scale the countdown too.',
    ],
  },
  {
    key: 'split-button',
    id: 'extras',
    name: 'Split action button',
    tag: 'sakuga-split-button',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'ドン!',
    effectSummary: 'Primary impact burst + ドン! paired with a spring-unfolded action menu',
    how: 'Click the left label to fire the action, or click ▾ to switch the active command.',
    html: '<sakuga-split-button><option value="render" selected>Render Cut</option><option value="webm">Export WebM</option><option value="svg">Copy Keyframes</option></sakuga-split-button>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-split-button>\n  <option value="render" selected>Render Cut</option>\n  <option value="webm">Export WebM</option>\n</sakuga-split-button>`,
    attributes: [
      { name: '<option> children', description: 'Available primary actions for the split menu.' },
    ],
    events: [
      { name: 'action', description: 'Fires when the primary button executes: { action, label }.' },
      { name: 'change', description: 'Fires when a new action is selected from the menu.' },
    ],
    wireNotes: [
      'Press Escape or click outside to dismiss the unfolded menu cleanly.',
    ],
  },
  {
    key: 'action-button',
    id: 'extras',
    name: 'Compact action button',
    tag: 'sakuga-action-button',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'シュッ',
    effectSummary: 'Compact cel-shaded icon+label trigger with squash bounce, speed lines, kira & シュッ',
    how: 'Click Focus to launch the accent burst, speed lines, and icon spring pop.',
    html: '<sakuga-action-button icon="play" variant="accent">Focus</sakuga-action-button>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-action-button icon="play" variant="accent">Focus</sakuga-action-button>`,
    attributes: [
      { name: 'variant', description: '"default" (paper), "primary" (--sk-pri), or "accent" (--sk-acc).' },
      { name: 'icon', description: 'Built-in vector icon: play, pause, step, lock, plus, close, refresh, sparkles, book, trash.' },
      { name: 'size', description: '"sm" (34px), default (40px), or "md" (44px).' },
    ],
    events: [
      { name: 'click', description: 'Fires a standard composed click event for toolbar and row actions.' },
    ],
    wireNotes: [
      'Designed for compact row actions (like Focus, Lock, and header CTAs) where full-size <sakuga-button> is too large.',
    ],
  },
  {
    key: 'icon-button',
    id: 'extras',
    name: 'Icon action button',
    tag: 'sakuga-icon-button',
    source: 'studio',
    category: 'actions',
    sfxLabel: 'カチッ',
    effectSummary: 'Square cel-shaded icon trigger with icon tilt spring, danger shard shatter & シュッ / カチッ',
    how: 'Click the danger trash icon to fire crystal shards, smoke puff, and シュッ.',
    html: '<sakuga-icon-button icon="trash" tone="danger" label="Delete item"></sakuga-icon-button>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-icon-button icon="trash" tone="danger" label="Delete item"></sakuga-icon-button>`,
    attributes: [
      { name: 'icon', description: 'Built-in vector icon: trash, close, refresh, lock, play, pause, step, plus.' },
      { name: 'tone', description: '"default" (crisp カチッ) or "danger" (accent hover + crystal shard shatter).' },
      { name: 'label', description: 'Required accessible aria-label for icon-only controls.' },
    ],
    events: [
      { name: 'click', description: 'Fires standard DOM click event.' },
    ],
    wireNotes: [
      'Always supply a descriptive label attribute so screen readers announce the exact target item.',
    ],
  },
  {
    key: 'textarea',
    id: 'extras',
    name: 'Multiline textarea',
    tag: 'sakuga-textarea',
    source: 'studio',
    category: 'inputs',
    sfxLabel: 'Dust',
    effectSummary: 'Cel-shaded multiline field with focus spring pop, corner ticks, and keystroke dust puffs',
    how: 'Focus and type a few lines to emit cel dust puffs and track character count.',
    html: '<sakuga-textarea rows="3" maxlength="160" label="Sprint notes" placeholder="Acceptance criteria or keyframe notes..."></sakuga-textarea>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-textarea rows="3" maxlength="200" label="Notes" placeholder="Write notes..."></sakuga-textarea>`,
    attributes: [
      { name: 'rows / maxlength', description: 'Visible row height (2–14) and optional live character counter.' },
      { name: 'placeholder / label', description: 'Placeholder hint and accessible screen-reader label.' },
      { name: '--sk-textarea-width', description: 'CSS custom property controlling width (default 100%).' },
    ],
    events: [
      { name: 'input', description: 'Fires on keystroke with e.detail = { value }.' },
      { name: 'change', description: 'Fires on blur/commit with e.detail = { value }.' },
    ],
    wireNotes: [
      'Form-associated via ElementInternals and exposes a live .value property matching native <textarea>.',
    ],
  },
  {
    key: 'nav',
    id: 'extras',
    name: 'Ink underline nav',
    tag: 'sakuga-nav',
    source: 'studio',
    category: 'selection',
    sfxLabel: 'カチッ',
    effectSummary: 'Clean typographic navigation bar with velocity-stretched spring cel underline & ticks',
    how: 'Click links or press Left / Right arrows to glide the ink-rimmed underline.',
    html: '<sakuga-nav label="Demo navigation"><option value="tasks" selected>Tasks</option><option value="focus">Focus</option><option value="summary">Summary</option></sakuga-nav>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-nav label="Primary navigation">\n  <option value="tasks" selected>Tasks</option>\n  <option value="focus">Focus</option>\n</sakuga-nav>`,
    attributes: [
      { name: 'label', description: 'Accessible aria-label for the <nav> landmark.' },
      { name: 'value', description: 'Active section value; syncs underline programmatically.' },
      { name: '<option> children', description: 'Defines single-line navigation links.' },
    ],
    events: [
      { name: 'change', description: 'CustomEvent with e.detail = { index, value, label }.' },
    ],
    wireNotes: [
      'Keeps top navigation unboxed and single-line while matching the Anime VFX ink and spring language.',
    ],
  },
  {
    key: 'alert',
    id: 'extras',
    name: 'Impact alert banner',
    tag: 'sakuga-alert',
    source: 'studio',
    category: 'feedback',
    sfxLabel: 'シュッ',
    effectSummary: 'Cel-shaded notice banner with entry spring pop, accent ticks, and shard-shatter dismiss',
    how: 'Click the × button to trigger the shard shatter and dismiss event.',
    html: '<sakuga-alert tone="danger" title="Validation needed" dismissible>Enter at least 2 characters before adding a task.</sakuga-alert>',
    usageSnippet: `<script src="/sakuga-vfx/button.js"></script>\n<script src="/sakuga-vfx/extras.js"></script>\n<sakuga-alert tone="danger" title="Check input" dismissible>Enter a valid task title.</sakuga-alert>`,
    attributes: [
      { name: 'tone', description: '"info", "success", "warning", or "danger".' },
      { name: 'title', description: 'Optional bold heading inside the alert banner.' },
      { name: 'dismissible', description: 'Shows a cel-shaded close button that emits "dismiss".' },
    ],
    events: [
      { name: 'dismiss', description: 'CustomEvent with e.detail = { tone } when the close button is clicked.' },
    ],
    wireNotes: [
      'Exposes role="alert" automatically for accessible validation and workspace feedback.',
    ],
  },
];

export function filterCatalogItems(
  items: SakugaControlSpec[],
  category: ControlCategory,
  query = '',
  onlyStudio = false
): SakugaControlSpec[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (onlyStudio && item.source !== 'studio') return false;
    const matchesCategory = category === 'all' || item.category === category;
    if (!matchesCategory) return false;
    if (!normalized) return true;
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.tag.toLowerCase().includes(normalized) ||
      item.effectSummary.toLowerCase().includes(normalized) ||
      item.sfxLabel.toLowerCase().includes(normalized)
    );
  });
}

export function buildInstallCommand(componentId: string): string {
  return `npx shadcn add ${SAKUGA_REPO}/${componentId}`;
}

export function buildAgentPrompt(item: SakugaControlSpec, origin = 'https://sakuga-vfx.vercel.app'): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const fileUrl = `${cleanOrigin}/${item.id}/${item.id}.js`;
  return [
    `Add the Sakuga ${item.name.toLowerCase()} to my app. It is a single JavaScript file with no dependencies that defines a <${item.tag}> element.`,
    `1. Get the file from ${fileUrl} and save it in my project as ${item.id}.js. Do not rewrite it or split it up.`,
    `2. Load it with a plain script tag (not type="module").`,
    ...item.wireNotes.map((note, idx) => `${idx + 3}. ${note}`),
    `${item.wireNotes.length + 3}. Its effects are drawn on one fixed canvas over the page, switch off for prefers-reduced-motion, and inherit --sk-* CSS variables.`,
  ].join('\n');
}

export function getThemePresetById(id: string): SakugaThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}

export function buildThemeCssVariables(theme: SakugaThemePreset): Record<string, string> {
  return {
    '--sk-card': theme.card,
    '--sk-ink': theme.ink,
    '--sk-dim': theme.dim,
    '--sk-soft': theme.soft,
    '--sk-pri': theme.pri,
    '--sk-pri-ink': theme.priInk,
    '--sk-acc': theme.acc,
    '--sk-track': theme.track,
    '--sk-on-pri': theme.onPri,
  };
}

export function buildCanvasPalette(theme: SakugaThemePreset): SakugaCanvasPalette {
  return {
    fill: theme.card,
    shade: theme.soft,
    line: theme.line,
    accent: theme.acc,
    ink: theme.ink,
    sfx: [theme.ink, theme.card],
  };
}

export function generateThemeCssSnippet(theme: SakugaThemePreset): string {
  const vars = buildThemeCssVariables(theme);
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function isCustomClockMode(speed: number, paused: boolean): boolean {
  return paused || Math.abs(speed - 1) > 0.001;
}

export function computeScaledDelta(rawDtSeconds: number, speed: number, paused: boolean): number {
  if (paused || !(rawDtSeconds > 0)) return 0;
  const clampedDt = Math.min(0.034, Math.max(0, rawDtSeconds));
  const clampedSpeed = Math.min(2, Math.max(0.05, speed));
  return clampedDt * clampedSpeed;
}

export function clampProgressValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function validateRenderJobForm(input: RenderJobInput): FormValidationResult {
  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length < 2) {
    return {
      valid: false,
      errors: {
        title: 'Enter a shot title (at least 2 characters) before queuing a render.',
      },
    };
  }
  return { valid: true, errors: {} };
}
