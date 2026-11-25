import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SAKUGA_CATALOG,
  THEME_PRESETS,
  buildAgentPrompt,
  buildCanvasPalette,
  buildInstallCommand,
  buildThemeCssVariables,
  clampProgressValue,
  computeScaledDelta,
  filterCatalogItems,
  generateThemeCssSnippet,
  getThemePresetById,
  isCustomClockMode,
  validateRenderJobForm,
} from './sakugaStudio';

test('catalog contains all thirty-five Anime VFX controls (12 upstream + 23 studio)', () => {
  assert.equal(SAKUGA_CATALOG.length, 35);
  const tags = new Set(SAKUGA_CATALOG.map((item) => item.tag));
  assert.equal(tags.size, 34);
  assert.equal(SAKUGA_CATALOG.filter((item) => item.source === 'upstream').length, 12);
  assert.equal(SAKUGA_CATALOG.filter((item) => item.source === 'studio').length, 23);
  for (const tag of [
    'sakuga-button',
    'sakuga-like',
    'sakuga-accordion',
    'sakuga-stepper',
    'sakuga-select',
    'sakuga-copy',
    'sakuga-chip-group',
    'sakuga-segmented',
    'sakuga-otp',
    'sakuga-hold',
    'sakuga-counter',
    'sakuga-bell',
    'sakuga-tags',
    'sakuga-meter',
    'sakuga-card-toggle',
    'sakuga-fab',
    'sakuga-swatches',
    'sakuga-timer',
    'sakuga-split-button',
    'sakuga-action-button',
    'sakuga-icon-button',
    'sakuga-textarea',
    'sakuga-nav',
    'sakuga-alert',
  ]) {
    assert.ok(tags.has(tag), `Expected tag ${tag}`);
  }
});

test('filterCatalogItems filters by category, studio pack, and text query accurately', () => {
  const selectionOnly = filterCatalogItems(SAKUGA_CATALOG, 'selection');
  assert.equal(selectionOnly.length, 12);
  assert.ok(selectionOnly.every((item) => item.category === 'selection'));

  const studioOnly = filterCatalogItems(SAKUGA_CATALOG, 'all', '', true);
  assert.equal(studioOnly.length, 23);
  assert.ok(studioOnly.every((item) => item.source === 'studio'));

  const sfxMatch = filterCatalogItems(SAKUGA_CATALOG, 'all', 'ズザッ');
  assert.equal(sfxMatch.length, 4);
  assert.deepEqual(
    sfxMatch.map((item) => item.key),
    ['checkbox', 'toast', 'select', 'card-toggle']
  );

  const combined = filterCatalogItems(SAKUGA_CATALOG, 'feedback', 'timer');
  assert.equal(combined.length, 1);
  assert.equal(combined[0].key, 'timer');
});

test('install command and agent prompt reference exact component file', () => {
  assert.equal(buildInstallCommand('toggle'), 'npx shadcn add finktheartist/sakuga-vfx/toggle');
  const slider = SAKUGA_CATALOG.find((item) => item.key === 'slider')!;
  const prompt = buildAgentPrompt(slider, 'https://example.com/');
  assert.ok(prompt.includes('https://example.com/slider/slider.js'));
  assert.ok(prompt.includes('<sakuga-slider>'));
  assert.ok(prompt.includes('prefers-reduced-motion'));
});

test('theme helpers map CSS variables, canvas palette, and snippet cleanly', () => {
  const shonen = getThemePresetById('shonen');
  assert.equal(shonen.id, 'shonen');
  assert.equal(getThemePresetById('nonexistent').id, THEME_PRESETS[0].id);

  const vars = buildThemeCssVariables(shonen);
  assert.equal(vars['--sk-acc'], '#e11d48');
  assert.equal(vars['--sk-ink'], '#221824');

  const canvas = buildCanvasPalette(shonen);
  assert.equal(canvas.accent, '#e11d48');
  assert.deepEqual(canvas.sfx, ['#221824', '#ffffff']);

  const css = generateThemeCssSnippet(shonen);
  assert.ok(css.startsWith(':root {'));
  assert.ok(css.includes('--sk-acc: #e11d48;'));
});

test('clock helpers scale slow motion, clamp spikes, and halt when paused', () => {
  assert.equal(isCustomClockMode(1, false), false);
  assert.equal(isCustomClockMode(0.35, false), true);
  assert.equal(isCustomClockMode(1, true), true);

  assert.equal(computeScaledDelta(0.016, 1, true), 0);
  assert.equal(computeScaledDelta(-0.01, 0.35, false), 0);
  // Clamps raw frame spike above 34ms to 0.034 before scaling
  assert.ok(Math.abs(computeScaledDelta(0.2, 0.5, false) - 0.017) < 1e-9);
  assert.ok(Math.abs(computeScaledDelta(0.02, 0.35, false) - 0.007) < 1e-9);
});

test('clampProgressValue bounds values into [0, 1]', () => {
  assert.equal(clampProgressValue(-0.5), 0);
  assert.equal(clampProgressValue(0.65), 0.65);
  assert.equal(clampProgressValue(1.4), 1);
  assert.equal(clampProgressValue(Number.NaN), 0);
});

test('validateRenderJobForm rejects empty/short titles and accepts valid jobs', () => {
  const empty = validateRenderJobForm({
    title: '   ',
    preset: 'sakuga-12',
    smearIntensity: 68,
    includeSfx: true,
    transparentCanvas: true,
    priority: 4,
    outputTarget: 'web',
  });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.title);

  const valid = validateRenderJobForm({
    title: 'Cut 042 Impact Frame',
    preset: 'sakuga-12',
    smearIntensity: 68,
    includeSfx: true,
    transparentCanvas: true,
    priority: 4,
    outputTarget: 'web',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.title, undefined);
});
