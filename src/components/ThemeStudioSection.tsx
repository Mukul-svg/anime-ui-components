import { useEffect, useRef, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { THEME_PRESETS, generateThemeCssSnippet } from '../lib/sakugaStudio';
import type { SakugaButtonElement, SakugaThemePreset } from '../types/sakuga';
import { copyToClipboard } from '../utils/clipboard';

interface ThemeStudioSectionProps {
  activeTheme: SakugaThemePreset;
  onSelectPreset: (presetId: string) => void;
  onUpdateColor: (field: 'ink' | 'pri' | 'acc' | 'soft' | 'line', value: string) => void;
  onResetTheme: () => void;
}

export function ThemeStudioSection({
  activeTheme,
  onSelectPreset,
  onUpdateColor,
  onResetTheme,
}: ThemeStudioSectionProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    host.innerHTML = `
      <div class="flex flex-wrap items-center justify-center gap-6">
        <sakuga-button data-theme-preview="btn">Test Palette</sakuga-button>
        <sakuga-checkbox checked>Sync Canvas Ink</sakuga-checkbox>
      </div>
    `;
    const btn = host.querySelector<SakugaButtonElement>('[data-theme-preview="btn"]');
    let timer: number | undefined;
    const onClick = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => btn?.done(), 720);
    };
    btn?.addEventListener('click', onClick);
    return () => {
      window.clearTimeout(timer);
      btn?.removeEventListener('click', onClick);
    };
  }, []);

  const cssSnippet = generateThemeCssSnippet(activeTheme);

  const handleCopyCss = async () => {
    const ok = await copyToClipboard(cssSnippet);
    if (ok) {
      setCopiedCss(true);
      window.setTimeout(() => setCopiedCss(false), 1800);
    }
  };

  return (
    <section id="themes" className="scroll-mt-20 border-t border-[#dcdaf0] bg-[#fafaff]">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#595488]">
              04. Live Token & Canvas Palette Studio
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1d1a4a]">
              Override every <code className="font-mono text-2xl">--sk-*</code> variable live.
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#595488]">
              Anime VFX and Sakuga core styles sit inside{' '}
              <code className="font-mono text-xs text-[#1d1a4a]">:where(:root)</code> with zero
              specificity. Switching presets below updates both the CSS control tokens and the
              canvas cel-shading palette across the entire page.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetTheme}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#dcdaf0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1d1a4a] transition-colors duration-150 hover:border-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset to Classic</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Preset selector + live swatch editors */}
          <div className="space-y-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {THEME_PRESETS.map((preset) => {
                const selected = activeTheme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    aria-pressed={selected}
                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors duration-150 cursor-pointer ${
                      selected
                        ? 'border-[#1d1a4a] bg-white'
                        : 'border-[#dcdaf0] bg-white/70 hover:border-[#b8b3ff] hover:bg-white'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-display text-sm font-bold text-[#1d1a4a]">
                        {preset.name}
                      </span>
                      <span className="flex items-center gap-1.5" aria-hidden="true">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: preset.ink }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: preset.pri }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: preset.acc }}
                        />
                      </span>
                    </div>
                    <span className="mt-1.5 text-xs leading-relaxed text-[#595488]">
                      {preset.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#dcdaf0] bg-white p-5">
              <h3 className="font-display text-sm font-bold text-[#1d1a4a]">
                Fine-Tune Live Colors
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {(
                  [
                    { key: 'ink', label: 'Ink (--sk-ink)' },
                    { key: 'pri', label: 'Primary (--sk-pri)' },
                    { key: 'acc', label: 'Accent (--sk-acc)' },
                    { key: 'soft', label: 'Shade (--sk-soft)' },
                    { key: 'line', label: 'VFX Line' },
                  ] as const
                ).map((field) => (
                  <label
                    key={field.key}
                    className="flex flex-col gap-1.5 text-xs font-medium text-[#595488]"
                  >
                    <span>{field.label}</span>
                    <div className="flex items-center gap-2 rounded-lg border border-[#dcdaf0] px-2 py-1.5">
                      <input
                        type="color"
                        value={activeTheme[field.key]}
                        onChange={(e) => onUpdateColor(field.key, e.target.value)}
                        aria-label={`Choose color for ${field.label}`}
                        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-[11px] text-[#1d1a4a] uppercase">
                        {activeTheme[field.key]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview + copyable CSS snippet */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="rounded-2xl border border-[#dcdaf0] bg-white p-6">
              <p className="text-xs font-semibold text-[#595488]">Instant Verification Stage</p>
              <div ref={previewRef} className="mt-4 flex min-h-[110px] items-center justify-center" />
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border border-[#dcdaf0] bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#1d1a4a]">
                  CSS Override Snippet
                </h3>
                <button
                  type="button"
                  onClick={handleCopyCss}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdaf0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1a4a] transition-colors duration-150 hover:border-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedCss ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
                      <span>Copied CSS</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#595488]" aria-hidden="true" />
                      <span>Copy CSS</span>
                    </>
                  )}
                </button>
              </div>
              <pre
                data-testid="theme-css-snippet"
                className="mt-3 flex-1 overflow-x-auto rounded-xl bg-[#f7f6fd] p-4 font-mono text-xs leading-relaxed text-[#1d1a4a]"
              >
                <code>{cssSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
