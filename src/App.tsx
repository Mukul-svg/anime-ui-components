import { useCallback, useEffect, useState } from 'react';
import { ControlDocsModal } from './components/ControlDocsModal';
import { FormPlaygroundSection } from './components/FormPlaygroundSection';
import { GallerySection } from './components/GallerySection';
import { Header } from './components/Header';
import { HeroSpotlight } from './components/HeroSpotlight';
import { QuickInstallModal } from './components/QuickInstallModal';
import { ThemeStudioSection } from './components/ThemeStudioSection';
import { VfxLabSection } from './components/VfxLabSection';
import {
  SAKUGA_GITHUB_URL,
  THEME_PRESETS,
  buildCanvasPalette,
  buildThemeCssVariables,
  computeScaledDelta,
  getThemePresetById,
  isCustomClockMode,
} from './lib/sakugaStudio';
import type { SakugaControlSpec, SakugaThemePreset } from './types/sakuga';

export default function App() {
  const [activeTheme, setActiveTheme] = useState<SakugaThemePreset>(THEME_PRESETS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [paused, setPaused] = useState<boolean>(false);
  const [inspectedControl, setInspectedControl] = useState<SakugaControlSpec | null>(null);
  const [installOpen, setInstallOpen] = useState<boolean>(false);

  // Sync CSS variables and window.SakugaFX.P canvas palette whenever activeTheme changes
  useEffect(() => {
    const vars = buildThemeCssVariables(activeTheme);
    const rootStyle = document.documentElement.style;
    for (const [key, value] of Object.entries(vars)) {
      rootStyle.setProperty(key, value);
    }

    const fx = window.SakugaFX;
    if (fx?.P) {
      const palette = buildCanvasPalette(activeTheme);
      fx.P.fill = palette.fill;
      fx.P.shade = palette.shade;
      fx.P.line = palette.line;
      fx.P.accent = palette.accent;
      fx.P.ink = palette.ink;
      fx.P.sfx = palette.sfx;
    }
  }, [activeTheme]);

  // Drive slow-motion or paused inspection cleanly via window.SakugaFX.paused + advance()
  useEffect(() => {
    const fx = window.SakugaFX;
    if (!fx) return;

    const customClock = isCustomClockMode(playbackSpeed, paused);
    fx.paused = customClock;

    if (!customClock || paused) {
      return () => {
        if (window.SakugaFX) window.SakugaFX.paused = false;
      };
    }

    let rafId = 0;
    let lastMs = performance.now();

    const stepLoop = (nowMs: number) => {
      const rawDt = (nowMs - lastMs) / 1000;
      lastMs = nowMs;
      const scaled = computeScaledDelta(rawDt, playbackSpeed, false);
      if (scaled > 0 && window.SakugaFX) {
        window.SakugaFX.advance(scaled);
      }
      rafId = requestAnimationFrame(stepLoop);
    };

    rafId = requestAnimationFrame(stepLoop);
    return () => {
      cancelAnimationFrame(rafId);
      if (window.SakugaFX) window.SakugaFX.paused = false;
    };
  }, [playbackSpeed, paused]);

  const handleChangeSpeed = useCallback((speed: number) => {
    setPaused(false);
    setPlaybackSpeed(speed);
  }, []);

  const handleTogglePause = useCallback(() => {
    setPaused((prev) => !prev);
  }, []);

  const handleStepFrame = useCallback(() => {
    setPaused(true);
    if (window.SakugaFX) {
      window.SakugaFX.paused = true;
      window.SakugaFX.advance(1 / 60);
    }
  }, []);

  const handleSelectPreset = useCallback((presetId: string) => {
    setActiveTheme(getThemePresetById(presetId));
  }, []);

  const handleUpdateColor = useCallback(
    (field: 'ink' | 'pri' | 'acc' | 'soft' | 'line', value: string) => {
      setActiveTheme((prev) => ({
        ...prev,
        id: 'custom',
        name: 'Custom Palette',
        [field]: value,
        ...(field === 'ink' ? { priInk: value } : {}),
      }));
    },
    []
  );

  const handleResetTheme = useCallback(() => {
    setActiveTheme(THEME_PRESETS[0]);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1d1a4a]">
      <Header onOpenInstall={() => setInstallOpen(true)} />

      <main>
        <HeroSpotlight
          playbackSpeed={playbackSpeed}
          paused={paused}
          onChangeSpeed={handleChangeSpeed}
          onTogglePause={handleTogglePause}
          onStepFrame={handleStepFrame}
          activeThemeName={activeTheme.name}
        />

        <GallerySection onInspectControl={setInspectedControl} />

        <VfxLabSection activeTheme={activeTheme} />

        <FormPlaygroundSection />

        <ThemeStudioSection
          activeTheme={activeTheme}
          onSelectPreset={handleSelectPreset}
          onUpdateColor={handleUpdateColor}
          onResetTheme={handleResetTheme}
        />
      </main>

      <footer className="border-t border-[#dcdaf0] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-extrabold italic text-[#1d1a4a]">
              Anime VFX
            </p>
            <p className="mt-1 text-xs text-[#595488]">
              Built on{' '}
              <a
                href={SAKUGA_GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#1d1a4a] underline decoration-[#dcdaf0] underline-offset-4 hover:decoration-[#ff5fa8]"
              >
                Sakuga VFX
              </a>{' '}
              by Justin Finkelman (MIT License) · Extended with 18 Anime VFX controls · Respects{' '}
              <code className="font-mono">prefers-reduced-motion</code>
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-[#1d1a4a]">
            <a
              href={SAKUGA_GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[#dcdaf0] underline-offset-4 hover:decoration-[#ff5fa8]"
            >
              Sakuga VFX (Upstream)
            </a>
            <button
              type="button"
              onClick={() => setInstallOpen(true)}
              className="underline decoration-[#dcdaf0] underline-offset-4 hover:decoration-[#ff5fa8] cursor-pointer"
            >
              Quick Install
            </button>
          </div>
        </div>
      </footer>

      <ControlDocsModal item={inspectedControl} onClose={() => setInspectedControl(null)} />
      <QuickInstallModal open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}
