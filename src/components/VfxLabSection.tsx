import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { SFX_WORDS } from '../lib/sakugaStudio';
import type { SakugaSfxStyle, SakugaSfxWord, SakugaThemePreset } from '../types/sakuga';

interface VfxLabSectionProps {
  activeTheme: SakugaThemePreset;
}

type PrimitiveId =
  | 'burst'
  | 'puff'
  | 'shards'
  | 'splash'
  | 'slash'
  | 'ring'
  | 'donut'
  | 'lines'
  | 'ticks'
  | 'wob'
  | 'kira';

type ComboId = 'confirm' | 'blade' | 'dash' | 'surge';

const PRIMITIVES: Array<{ id: PrimitiveId; label: string; note: string }> = [
  { id: 'burst', label: 'Impact Burst', note: 'Needles + star' },
  { id: 'puff', label: 'Cumulus Puff', note: 'Cel smoke lobes' },
  { id: 'shards', label: 'Crystal Shards', note: 'Gravity facets' },
  { id: 'splash', label: 'Water Splash', note: 'Cel wave crown' },
  { id: 'slash', label: 'Anime Slash', note: 'Crescent arc' },
  { id: 'ring', label: 'Shockwave Ring', note: 'Ground ellipse' },
  { id: 'donut', label: 'Smoke Donut', note: 'Drifting ring' },
  { id: 'lines', label: 'Speed Lines', note: 'Motion streaks' },
  { id: 'ticks', label: 'Emphasis Ticks', note: 'Wedge fan' },
  { id: 'wob', label: 'Motion Wobble', note: 'Curved recoil' },
  { id: 'kira', label: 'Kira Sparkle', note: '4-point star' },
];

const COMBOS: Array<{ id: ComboId; label: string; summary: string }> = [
  { id: 'confirm', label: 'Impact Confirm', summary: 'Burst + twin smoke puffs + ドン!' },
  { id: 'blade', label: 'Blade Cut', summary: 'Crescent slash + crystal shards + シュッ' },
  { id: 'dash', label: 'Skid Landing', summary: 'Shockwave ring + speed lines + ズザッ' },
  { id: 'surge', label: 'Power Surge', summary: 'Water splash + kira sparkles + ゴゴゴゴ' },
];

const SFX_STYLES: Array<{ id: SakugaSfxStyle; label: string }> = [
  { id: 'solid', label: 'Solid Ink' },
  { id: 'hollow', label: 'Hollow' },
  { id: 'dotted', label: 'Screentone' },
];

export function VfxLabSection({ activeTheme }: VfxLabSectionProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboId>('confirm');
  const [sfxStyle, setSfxStyle] = useState<SakugaSfxStyle>('solid');
  const [lastFired, setLastFired] = useState('Click anywhere on the keyframe sheet or pick an effect');
  const [fireCount, setFireCount] = useState(0);

  const getStageCenter = () => {
    const rect = sheetRef.current?.getBoundingClientRect();
    if (!rect) return { x: window.innerWidth / 2, y: window.scrollY + window.innerHeight / 2 };
    return {
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY + rect.height / 2,
    };
  };

  const getSfxStyleOptions = () => {
    if (sfxStyle === 'hollow') {
      return { col: activeTheme.card, edge: activeTheme.ink, dots: false };
    }
    if (sfxStyle === 'dotted') {
      return { dots: true, edge: activeTheme.ink };
    }
    return { col: activeTheme.ink, edge: activeTheme.card, dots: false };
  };

  const firePrimitive = (id: PrimitiveId, x?: number, y?: number) => {
    const fx = window.SakugaFX;
    if (!fx) return;
    const pos = x !== undefined && y !== undefined ? { x, y } : getStageCenter();

    switch (id) {
      case 'burst':
        fx.burst(pos.x, pos.y, { r: 62, spikes: 14, life: 0.42 });
        break;
      case 'puff':
        fx.puff(pos.x, pos.y, { n: 6, size: 18, vx: 0, vy: -26, life: 0.9, spread: 1.2 });
        break;
      case 'shards':
        fx.shards(pos.x, pos.y, { n: 10, speed: 240, size: 6.5, life: 0.85 });
        break;
      case 'splash':
        fx.splash(pos.x, pos.y + 12, { w: 48, h: 36, life: 0.75 });
        break;
      case 'slash':
        fx.slash(pos.x, pos.y, { len: 165, ang: -0.45, life: 0.48, thick: 18 });
        break;
      case 'ring':
        fx.ring(pos.x, pos.y + 18, { rx: 66, ry: 18, life: 0.56, w: 6 });
        break;
      case 'donut':
        fx.donut(pos.x, pos.y, { r: 28, vx: 38, vy: -58, life: 1.05, tilt: -0.22 });
        break;
      case 'lines':
        fx.lines(pos.x, pos.y, { n: 10, dir: Math.PI, len: 74, spread: 40, life: 0.38 });
        break;
      case 'ticks':
        fx.ticks(pos.x, pos.y, { n: 5, r: 26, len: 16, dir: -0.8, life: 0.48, fan: 0.55 });
        break;
      case 'wob':
        fx.wob(pos.x, pos.y, { dir: 1, r: 24, life: 0.5 });
        break;
      case 'kira':
        fx.kira(pos.x, pos.y, { r: 16, life: 0.72, col: activeTheme.acc });
        fx.kira(pos.x + 28, pos.y - 20, { r: 10, life: 0.65, col: activeTheme.pri });
        break;
    }

    setFireCount((c) => c + 1);
    setLastFired(`Fired fx.${id}() at (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
  };

  const fireWord = (wordId: SakugaSfxWord, label: string, x?: number, y?: number) => {
    const fx = window.SakugaFX;
    if (!fx) return;
    const pos = x !== undefined && y !== undefined ? { x, y } : getStageCenter();
    fx.sfx(wordId, pos.x, pos.y, {
      size: 76,
      rot: -0.12 + (Math.random() - 0.5) * 0.14,
      life: 1.05,
      ...getSfxStyleOptions(),
    });
    setFireCount((c) => c + 1);
    setLastFired(`Fired fx.sfx("${wordId}") · ${label} (${sfxStyle})`);
  };

  const fireComboAt = (combo: ComboId, x: number, y: number) => {
    const fx = window.SakugaFX;
    if (!fx) return;
    const styleOpts = getSfxStyleOptions();

    if (combo === 'confirm') {
      fx.burst(x, y, { r: 64, spikes: 14, life: 0.4 });
      fx.puff(x - 36, y + 12, { n: 5, size: 15, vx: -42, vy: -18, life: 0.85 });
      fx.puff(x + 36, y + 12, { n: 5, size: 15, vx: 42, vy: -18, life: 0.85 });
      fx.sfx('don', x + 56, y - 34, { size: 70, rot: -0.14, life: 0.98, ...styleOpts });
    } else if (combo === 'blade') {
      fx.slash(x, y, { len: 180, ang: -0.52, life: 0.45, thick: 18 });
      fx.shards(x, y, { n: 9, speed: 240, size: 6, life: 0.82 });
      fx.sfx('shu', x + 52, y - 36, { size: 66, rot: -0.18, life: 0.9, ...styleOpts });
    } else if (combo === 'dash') {
      fx.ring(x, y + 14, { rx: 64, ry: 16, life: 0.52, w: 6 });
      fx.lines(x - 24, y, { n: 9, dir: Math.PI, len: 76, spread: 34, life: 0.36 });
      fx.puff(x - 18, y + 10, { n: 6, size: 15, vx: -50, vy: -14, life: 0.85 });
      fx.sfx('zuza', x + 48, y - 32, { size: 66, rot: -0.1, life: 0.95, ...styleOpts });
    } else if (combo === 'surge') {
      fx.splash(x, y + 14, { w: 54, h: 38, life: 0.72 });
      fx.kira(x - 36, y - 24, { r: 14, life: 0.7, col: activeTheme.acc });
      fx.kira(x + 38, y - 16, { r: 11, life: 0.68, col: activeTheme.pri });
      fx.sfx('gogo', x, y - 44, { size: 68, rot: -0.06, life: 1.05, ...styleOpts });
    }

    setFireCount((c) => c + 1);
    const meta = COMBOS.find((c) => c.id === combo);
    setLastFired(`Combo "${meta?.label}" struck at (${Math.round(x)}, ${Math.round(y)})`);
  };

  const handleSheetClick = (e: MouseEvent<HTMLDivElement>) => {
    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;
    fireComboAt(selectedCombo, x, y);
  };

  return (
    <section id="vfx-lab" className="scroll-mt-20 border-t border-[#dcdaf0] bg-[#fafaff]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#595488]">02. Direct Canvas VFX Lab</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1d1a4a]">
              Trigger SakugaFX primitives directly.
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#595488]">
              Every component shares the same <code className="font-mono text-xs text-[#1d1a4a]">window.SakugaFX</code>{' '}
              renderer. Click anywhere on the keyframe sheet below to fire a combo, or test
              individual primitives and traced manga sound effects.
            </p>
          </div>
          <p className="font-mono text-xs text-[#595488] tabular-nums">
            Effects triggered: {fireCount}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Interactive Keyframe Sheet */}
          <div className="flex flex-col rounded-2xl border border-[#dcdaf0] bg-white lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceaf7] px-5 py-3.5">
              <div
                role="group"
                aria-label="Click-to-fire combo preset"
                className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#f4f3fc] p-1"
              >
                {COMBOS.map((combo) => {
                  const active = selectedCombo === combo.id;
                  return (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => setSelectedCombo(combo.id)}
                      aria-pressed={active}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-white text-[#1d1a4a] shadow-xs'
                          : 'text-[#595488] hover:text-[#1d1a4a]'
                      }`}
                    >
                      {combo.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const center = getStageCenter();
                  fireComboAt(selectedCombo, center.x, center.y);
                }}
                className="rounded-lg bg-[#1d1a4a] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#312c70] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Fire at Center
              </button>
            </div>

            <div
              ref={sheetRef}
              onClick={handleSheetClick}
              data-testid="vfx-keyframe-sheet"
              className="animation-sheet-grid relative flex min-h-[300px] flex-1 cursor-crosshair flex-col items-center justify-center p-8 text-center select-none"
            >
              <p className="font-display text-lg font-bold text-[#1d1a4a]">
                Click anywhere on this keyframe sheet
              </p>
              <p className="mt-1 text-xs text-[#595488]">
                Active combo: {COMBOS.find((c) => c.id === selectedCombo)?.summary}
              </p>
            </div>

            <div className="border-t border-[#eceaf7] px-5 py-3">
              <p
                aria-live="polite"
                data-testid="vfx-lab-status"
                className="font-mono text-xs text-[#595488] tabular-nums"
              >
                {lastFired}
              </p>
            </div>
          </div>

          {/* Primitives + Traced SFX Panel */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="rounded-2xl border border-[#dcdaf0] bg-white p-5">
              <h3 className="font-display text-base font-bold text-[#1d1a4a]">
                Canvas Primitives
              </h3>
              <p className="mt-1 text-xs text-[#595488]">
                Two-tone cel-shaded vector geometry drawn on the overlay canvas.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {PRIMITIVES.map((prim) => (
                  <button
                    key={prim.id}
                    type="button"
                    onClick={() => firePrimitive(prim.id)}
                    className="flex flex-col items-start rounded-lg border border-[#dcdaf0] bg-white px-3 py-2 text-left transition-colors duration-150 hover:border-[#5a4fd8] hover:bg-[#fafaff] cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-[#1d1a4a]">{prim.label}</span>
                    <span className="text-[11px] text-[#595488]">{prim.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dcdaf0] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#1d1a4a]">
                  Traced Manga SFX
                </h3>
                <div
                  role="group"
                  aria-label="Manga lettering ink style"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#f4f3fc] p-1"
                >
                  {SFX_STYLES.map((style) => {
                    const active = sfxStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSfxStyle(style.id)}
                        aria-pressed={active}
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-[#1d1a4a] shadow-xs'
                            : 'text-[#595488] hover:text-[#1d1a4a]'
                        }`}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SFX_WORDS.map((word) => (
                  <button
                    key={word.id}
                    type="button"
                    onClick={() => fireWord(word.id, word.kana)}
                    className="flex flex-col items-start rounded-lg border border-[#dcdaf0] bg-white px-3 py-2 text-left transition-colors duration-150 hover:border-[#ff5fa8] hover:bg-[#fff7fb] cursor-pointer"
                  >
                    <span className="font-display text-base font-extrabold text-[#1d1a4a]">
                      {word.kana}
                    </span>
                    <span className="text-[11px] text-[#595488]">{word.feel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
