import { useEffect, useRef, useState } from 'react';
import { validateRenderJobForm } from '../lib/sakugaStudio';
import type {
  RenderJobInput,
  RenderJobRecord,
  SakugaButtonElement,
  SakugaCheckboxElement,
  SakugaInputElement,
  SakugaProgressElement,
  SakugaRadioElement,
  SakugaRatingElement,
  SakugaSliderElement,
  SakugaToastElement,
  SakugaToggleElement,
} from '../types/sakuga';

const INITIAL_JOBS: RenderJobRecord[] = [
  {
    id: 'shot-014',
    title: 'Cut 014 — Impact Frame',
    preset: 'Sakuga 12fps',
    smearIntensity: 78,
    includeSfx: true,
    transparentCanvas: true,
    priority: 5,
    outputTarget: 'Web Bundle',
    completedAt: 'Ready',
  },
];

export function FormPlaygroundSection() {
  const inputMountRef = useRef<HTMLDivElement>(null);
  const radioMountRef = useRef<HTMLDivElement>(null);
  const sliderMountRef = useRef<HTMLDivElement>(null);
  const toggleMountRef = useRef<HTMLDivElement>(null);
  const checkboxMountRef = useRef<HTMLDivElement>(null);
  const ratingMountRef = useRef<HTMLDivElement>(null);
  const tabsMountRef = useRef<HTMLDivElement>(null);
  const progressMountRef = useRef<HTMLDivElement>(null);
  const actionsMountRef = useRef<HTMLDivElement>(null);
  const toastMountRef = useRef<HTMLDivElement>(null);

  const formStateRef = useRef<RenderJobInput>({
    title: 'Cut 042 — Counter Slash',
    preset: 'Sakuga 12fps',
    smearIntensity: 65,
    includeSfx: true,
    transparentCanvas: true,
    priority: 4,
    outputTarget: 'Web Bundle',
  });

  const [formPreview, setFormPreview] = useState<RenderJobInput>(formStateRef.current);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [jobs, setJobs] = useState<RenderJobRecord[]>(INITIAL_JOBS);

  const refs = useRef<{
    input: SakugaInputElement | null;
    progress: SakugaProgressElement | null;
    submitBtn: SakugaButtonElement | null;
    toast: SakugaToastElement | null;
  }>({
    input: null,
    progress: null,
    submitBtn: null,
    toast: null,
  });

  const renderTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (inputMountRef.current) {
      inputMountRef.current.innerHTML =
        '<sakuga-input label="Shot title" placeholder="e.g. Cut 042 — Counter Slash" style="--sk-input-width: 100%; display: block;"></sakuga-input>';
      const inputEl = inputMountRef.current.querySelector<SakugaInputElement>('sakuga-input');
      if (inputEl) {
        inputEl.value = formStateRef.current.title;
        refs.current.input = inputEl;
        const onInput = () => {
          formStateRef.current = { ...formStateRef.current, title: inputEl.value };
          setFormPreview({ ...formStateRef.current });
          if (inputEl.value.trim().length >= 2) setTitleError(null);
        };
        inputEl.addEventListener('input', onInput);
        inputEl.addEventListener('change', onInput);
        cleanups.push(() => {
          inputEl.removeEventListener('input', onInput);
          inputEl.removeEventListener('change', onInput);
        });
      }
    }

    if (radioMountRef.current) {
      radioMountRef.current.innerHTML = `
        <sakuga-radio label="Frame cadence">
          <option value="Sakuga 12fps" selected>Sakuga 12fps</option>
          <option value="Cel 24fps">Cel 24fps</option>
          <option value="Keyframe Sheet">Keyframe Sheet</option>
        </sakuga-radio>
      `;
      const radioEl = radioMountRef.current.querySelector<SakugaRadioElement>('sakuga-radio');
      if (radioEl) {
        const onChange = () => {
          formStateRef.current = { ...formStateRef.current, preset: radioEl.value };
          setFormPreview({ ...formStateRef.current });
        };
        radioEl.addEventListener('change', onChange);
        cleanups.push(() => radioEl.removeEventListener('change', onChange));
      }
    }

    if (sliderMountRef.current) {
      sliderMountRef.current.innerHTML =
        '<sakuga-slider value="65" min="0" max="100" unit="%" label="Motion smear intensity" style="--sk-slider-width: 240px;"></sakuga-slider>';
      const sliderEl = sliderMountRef.current.querySelector<SakugaSliderElement>('sakuga-slider');
      if (sliderEl) {
        const onChange = () => {
          formStateRef.current = {
            ...formStateRef.current,
            smearIntensity: Number(sliderEl.value),
          };
          setFormPreview({ ...formStateRef.current });
        };
        sliderEl.addEventListener('input', onChange);
        sliderEl.addEventListener('change', onChange);
        cleanups.push(() => {
          sliderEl.removeEventListener('input', onChange);
          sliderEl.removeEventListener('change', onChange);
        });
      }
    }

    if (toggleMountRef.current) {
      toggleMountRef.current.innerHTML =
        '<sakuga-toggle label="Include manga SFX lettering" checked></sakuga-toggle>';
      const toggleEl = toggleMountRef.current.querySelector<SakugaToggleElement>('sakuga-toggle');
      if (toggleEl) {
        const onChange = () => {
          formStateRef.current = { ...formStateRef.current, includeSfx: toggleEl.checked };
          setFormPreview({ ...formStateRef.current });
        };
        toggleEl.addEventListener('change', onChange);
        cleanups.push(() => toggleEl.removeEventListener('change', onChange));
      }
    }

    if (checkboxMountRef.current) {
      checkboxMountRef.current.innerHTML =
        '<sakuga-checkbox checked>Transparent overlay canvas</sakuga-checkbox>';
      const boxEl = checkboxMountRef.current.querySelector<SakugaCheckboxElement>('sakuga-checkbox');
      if (boxEl) {
        const onChange = () => {
          formStateRef.current = { ...formStateRef.current, transparentCanvas: boxEl.checked };
          setFormPreview({ ...formStateRef.current });
        };
        boxEl.addEventListener('change', onChange);
        cleanups.push(() => boxEl.removeEventListener('change', onChange));
      }
    }

    if (ratingMountRef.current) {
      ratingMountRef.current.innerHTML =
        '<sakuga-rating value="4" label="Shot priority"></sakuga-rating>';
      const ratingEl = ratingMountRef.current.querySelector<SakugaRatingElement>('sakuga-rating');
      if (ratingEl) {
        const onChange = () => {
          formStateRef.current = { ...formStateRef.current, priority: Number(ratingEl.value) };
          setFormPreview({ ...formStateRef.current });
        };
        ratingEl.addEventListener('change', onChange);
        cleanups.push(() => ratingEl.removeEventListener('change', onChange));
      }
    }

    if (tabsMountRef.current) {
      tabsMountRef.current.innerHTML = `
        <sakuga-tabs label="Output target">
          <option value="Web Bundle">Web Bundle</option>
          <option value="Sprite Sheet">Sprite Sheet</option>
          <option value="Raw SVG">Raw SVG</option>
        </sakuga-tabs>
      `;
      const tabsEl = tabsMountRef.current.querySelector('sakuga-tabs');
      if (tabsEl) {
        const onChange = (e: Event) => {
          const detail = (e as CustomEvent<{ label: string }>).detail;
          formStateRef.current = {
            ...formStateRef.current,
            outputTarget: detail?.label ?? 'Web Bundle',
          };
          setFormPreview({ ...formStateRef.current });
        };
        tabsEl.addEventListener('change', onChange);
        cleanups.push(() => tabsEl.removeEventListener('change', onChange));
      }
    }

    if (progressMountRef.current) {
      progressMountRef.current.innerHTML =
        '<sakuga-progress label="Shot render progress" style="--sk-progress-width: 260px;"></sakuga-progress>';
      const progEl = progressMountRef.current.querySelector<SakugaProgressElement>('sakuga-progress');
      refs.current.progress = progEl;
    }

    if (toastMountRef.current) {
      toastMountRef.current.innerHTML = '<sakuga-toast duration="3000"></sakuga-toast>';
      refs.current.toast = toastMountRef.current.querySelector<SakugaToastElement>('sakuga-toast');
    }

    return () => {
      renderTimersRef.current.forEach((id) => window.clearTimeout(id));
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const triggerQueueRender = () => {
    const current = { ...formStateRef.current };
    const validation = validateRenderJobForm(current);

    if (!validation.valid) {
      setTitleError(validation.errors.title ?? 'Please complete all required fields.');
      return;
    }

    setTitleError(null);
    setRendering(true);

    const prog = refs.current.progress;
    const submitBtn = refs.current.submitBtn;
    const toast = refs.current.toast;

    renderTimersRef.current.forEach((id) => window.clearTimeout(id));
    renderTimersRef.current = [];

    prog?.reset();

    const onDone = () => {
      prog?.removeEventListener('sakuga:done', onDone);
      submitBtn?.done();
      toast?.show(`Queued "${current.title.trim()}"`);
      setRendering(false);
      setJobs((prev) => [
        {
          ...current,
          title: current.title.trim(),
          id: `shot-${String(prev.length + 15).padStart(3, '0')}`,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    };

    if (prog) {
      prog.addEventListener('sakuga:done', onDone);
      renderTimersRef.current.push(window.setTimeout(() => prog.set(0.32), 120));
      renderTimersRef.current.push(window.setTimeout(() => prog.set(0.74), 520));
      renderTimersRef.current.push(window.setTimeout(() => prog.set(1), 980));
    } else {
      onDone();
    }
  };

  useEffect(() => {
    const host = actionsMountRef.current;
    if (!host) return;
    host.innerHTML = `
      <div class="flex flex-wrap items-center gap-4">
        <sakuga-button data-form="queue">Queue Shot</sakuga-button>
        <sakuga-button variant="secondary" data-form="clear">Clear Title</sakuga-button>
      </div>
    `;
    const queueBtn = host.querySelector<SakugaButtonElement>('[data-form="queue"]');
    const clearBtn = host.querySelector<SakugaButtonElement>('[data-form="clear"]');
    refs.current.submitBtn = queueBtn;

    const handleQueue = () => triggerQueueRender();
    const handleClear = () => {
      if (refs.current.input) refs.current.input.value = '';
      formStateRef.current = { ...formStateRef.current, title: '' };
      setFormPreview({ ...formStateRef.current });
      setTitleError(null);
    };

    queueBtn?.addEventListener('click', handleQueue);
    clearBtn?.addEventListener('click', handleClear);

    return () => {
      queueBtn?.removeEventListener('click', handleQueue);
      clearBtn?.removeEventListener('click', handleClear);
    };
  }, []);

  return (
    <section id="form-playground" className="scroll-mt-20 border-t border-[#dcdaf0] bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="max-w-[65ch]">
          <p className="text-xs font-semibold text-[#595488]">
            03. Live Composite Form Playground
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1d1a4a]">
            Ten Anime VFX controls wired in one working workflow.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#595488]">
            Value controls participate in forms via ElementInternals. Configure a keyframe shot
            below and click Queue Shot to watch validation, the storm-cloud progress bar, button
            done check, and skid toast chain together.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form card */}
          <div className="rounded-2xl border border-[#dcdaf0] bg-white p-6 lg:col-span-7">
            <div className="space-y-7">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">
                  Shot title <span className="text-[#ff5fa8]">*</span>
                </p>
                <div ref={inputMountRef} className="max-w-sm" />
                {titleError && (
                  <p
                    role="alert"
                    data-testid="form-title-error"
                    className="mt-2 text-xs font-semibold text-[#be123c]"
                  >
                    {titleError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Frame cadence</p>
                  <div ref={radioMountRef} />
                </div>

                <div>
                  <p className="mb-4 text-xs font-semibold text-[#1d1a4a]">
                    Motion smear intensity ({formPreview.smearIntensity}%)
                  </p>
                  <div ref={sliderMountRef} className="pt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-[#eceaf7] pt-6 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#1d1a4a]">Manga SFX lettering</p>
                    <p className="text-xs text-[#595488]">
                      {formPreview.includeSfx ? 'Enabled on confirm' : 'Silent springs only'}
                    </p>
                  </div>
                  <div ref={toggleMountRef} />
                </div>

                <div className="flex items-center">
                  <div ref={checkboxMountRef} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-[#eceaf7] pt-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Output target</p>
                  <div ref={tabsMountRef} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">
                    Shot priority ({formPreview.priority}/5)
                  </p>
                  <div ref={ratingMountRef} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eceaf7] pt-6">
                <div ref={actionsMountRef} />
                <p className="font-mono text-xs text-[#595488]">
                  {rendering ? 'Rendering shot...' : 'Ready to queue'}
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Progress monitor + toast + live queued shots */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-col items-center rounded-2xl border border-[#dcdaf0] bg-[#fafaff] px-6 py-6 text-center">
              <p className="text-xs font-semibold text-[#595488]">Live Render Monitor</p>
              <div ref={progressMountRef} className="mt-4 flex justify-center" />
              <div ref={toastMountRef} className="mt-2 min-h-[48px]" />
            </div>

            <div className="flex-1 rounded-2xl border border-[#dcdaf0] bg-white p-6">
              <div className="flex items-baseline justify-between gap-2 border-b border-[#eceaf7] pb-3">
                <h3 className="font-display text-base font-bold text-[#1d1a4a]">
                  Rendered Shots Queue
                </h3>
                <span className="font-mono text-xs text-[#595488] tabular-nums">
                  {jobs.length} {jobs.length === 1 ? 'shot' : 'shots'}
                </span>
              </div>

              <ul data-testid="rendered-jobs-list" className="mt-4 divide-y divide-[#eceaf7]">
                {jobs.map((job) => (
                  <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1d1a4a]">{job.title}</p>
                      <span className="font-mono text-xs text-[#595488] tabular-nums">
                        {job.completedAt}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#595488]">
                      <span>{job.preset}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">Smear {job.smearIntensity}%</span>
                      <span aria-hidden="true"> · </span>
                      <span>{job.outputTarget}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{job.includeSfx ? 'SFX On' : 'SFX Off'}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
