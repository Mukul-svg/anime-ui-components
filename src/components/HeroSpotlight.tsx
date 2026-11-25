import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { PLAYBACK_MODES, SAKUGA_GITHUB_URL } from '../lib/sakugaStudio';
import type {
  SakugaButtonElement,
  SakugaRatingElement,
  SakugaToggleElement,
} from '../types/sakuga';

interface HeroSpotlightProps {
  playbackSpeed: number;
  paused: boolean;
  onChangeSpeed: (speed: number) => void;
  onTogglePause: () => void;
  onStepFrame: () => void;
  activeThemeName: string;
}

export function HeroSpotlight({
  playbackSpeed,
  paused,
  onChangeSpeed,
  onTogglePause,
  onStepFrame,
  activeThemeName,
}: HeroSpotlightProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pauseBtnHostRef = useRef<HTMLDivElement>(null);
  const stepBtnHostRef = useRef<HTMLDivElement>(null);
  const playbackCbRef = useRef({ onTogglePause, onStepFrame });
  playbackCbRef.current = { onTogglePause, onStepFrame };

  const [lastInteraction, setLastInteraction] = useState(
    'Click any control above to trigger spring overshoot and canvas effects'
  );

  useEffect(() => {
    const host = pauseBtnHostRef.current;
    if (!host) return;
    host.innerHTML = `<sakuga-action-button size="sm" icon="${paused ? 'play' : 'pause'}" label="${paused ? 'Resume animation clock' : 'Pause animation clock'}">${paused ? 'Resume' : 'Pause'}</sakuga-action-button>`;
    const el = host.querySelector('sakuga-action-button');
    const onClick = () => playbackCbRef.current.onTogglePause();
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [paused]);

  useEffect(() => {
    const host = stepBtnHostRef.current;
    if (!host) return;
    host.innerHTML =
      '<sakuga-action-button size="sm" icon="step" label="Step forward one animation frame">+1 Frame</sakuga-action-button>';
    const el = host.querySelector('sakuga-action-button');
    const onClick = () => playbackCbRef.current.onStepFrame();
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;

    host.innerHTML = `
      <div class="flex flex-wrap items-center justify-center gap-7">
        <sakuga-button data-hero="strike">Strike Frame</sakuga-button>
        <sakuga-toggle label="Hero anime splash toggle"></sakuga-toggle>
        <sakuga-rating label="Hero anime star rating"></sakuga-rating>
      </div>
    `;

    const button = host.querySelector<SakugaButtonElement>('sakuga-button');
    const toggle = host.querySelector<SakugaToggleElement>('sakuga-toggle');
    const rating = host.querySelector<SakugaRatingElement>('sakuga-rating');

    let timer: number | undefined;

    const handleButton = () => {
      setLastInteraction('Button impact fired — ドン! landing check queued');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button?.done();
        setLastInteraction('Button done() settled — checkmark locked');
      }, 760);
    };

    const handleToggle = () => {
      setLastInteraction(
        toggle?.checked
          ? 'Toggle flipped on — 43-frame splash animation playing'
          : 'Toggle flipped off — reverse smear settled'
      );
    };

    const handleRating = () => {
      const value = rating?.value ?? 0;
      setLastInteraction(
        value === 5
          ? 'Rating 5/5 — full cascade + back-layer impact burst'
          : value === 0
            ? 'Rating cleared to 0/5'
            : `Rating set to ${value}/5 — spring cascade popped`
      );
    };

    button?.addEventListener('click', handleButton);
    toggle?.addEventListener('change', handleToggle);
    rating?.addEventListener('change', handleRating);

    return () => {
      window.clearTimeout(timer);
      button?.removeEventListener('click', handleButton);
      toggle?.removeEventListener('change', handleToggle);
      rating?.removeEventListener('change', handleRating);
    };
  }, []);

  return (
    <section id="top" className="border-b border-[#e2e0f2] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left column: Editorial typographic proposition */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#595488]">
                Anime VFX · Built on{' '}
                <a
                  href={SAKUGA_GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1d1a4a] underline decoration-[#b8b3ff] underline-offset-3 hover:decoration-[#ff5fa8]"
                >
                  Sakuga VFX
                </a>{' '}
                (MIT) · Zero Dependencies
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.35rem,4vw,3.55rem)] font-extrabold leading-[1.06] tracking-tight text-[#1d1a4a]">
                Ordinary UI controls that hit like key animation.
              </h1>
              <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-[#595488]">
                At rest they read like clean paper interface primitives. Interact with any control
                and it squashes on damped springs, overshoots, and throws cel-shaded smoke puffs,
                impact bursts, crystal shards, splashes, and traced manga lettering onto one shared
                canvas layer.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff5fa8] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#e54b93] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1d1a4a]"
              >
                <span>Explore All 35 Controls</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#vfx-lab"
                className="text-sm font-semibold text-[#1d1a4a] underline decoration-[#b8b3ff] decoration-2 underline-offset-4 transition-colors duration-150 hover:decoration-[#ff5fa8] whitespace-nowrap shrink-0"
              >
                Launch Canvas VFX Lab
              </a>
            </div>
          </div>

          {/* Right column: Interactive live spotlight stage + slow-motion keyframe deck */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#dcdaf0] bg-[#fafaff] p-6 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e6f6] pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#1d1a4a]">
                  Live Keyframe Stage
                </h2>
                <p className="text-xs text-[#595488]">
                  Theme: {activeThemeName} · Shared overlay canvas
                </p>
              </div>
              <span className="text-xs font-semibold text-[#595488] tabular-nums">
                {paused ? 'Paused' : `${playbackSpeed}× clock`}
              </span>
            </div>

            <div
              ref={stageRef}
              data-testid="hero-live-stage"
              className="flex min-h-[190px] items-center justify-center py-8"
            />

            <div className="space-y-4 border-t border-[#e8e6f6] pt-4">
              <p
                aria-live="polite"
                className="min-h-[1.25rem] text-center text-xs font-medium text-[#595488]"
              >
                {lastInteraction}
              </p>

              {/* Real time-scale playback bar wired to window.SakugaFX */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Animation playback speed"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#efedfa] p-1"
                >
                  {PLAYBACK_MODES.map((mode) => {
                    const active = !paused && Math.abs(playbackSpeed - mode.speed) < 0.001;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => onChangeSpeed(mode.speed)}
                        aria-pressed={active}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-[#1d1a4a] shadow-xs'
                            : 'text-[#595488] hover:text-[#1d1a4a]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div ref={pauseBtnHostRef} />
                  <div ref={stepBtnHostRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width architectural metric strip below the hero split */}
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-[#dcdaf0] pt-8 md:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-[#595488]">Interactive Controls</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-[#1d1a4a] tabular-nums">
              35
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#595488]">Painted Toggle Frames</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-[#1d1a4a] tabular-nums">
              43
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#595488]">Traced Manga SFX</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-[#1d1a4a] tabular-nums">
              6
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#595488]">Runtime Dependencies</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-[#1d1a4a] tabular-nums">
              0
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
