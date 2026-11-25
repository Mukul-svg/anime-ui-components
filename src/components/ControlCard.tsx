import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, Copy, RotateCcw } from 'lucide-react';
import { buildInstallCommand, clampProgressValue } from '../lib/sakugaStudio';
import type {
  SakugaButtonElement,
  SakugaCheckboxElement,
  SakugaControlSpec,
  SakugaInputElement,
  SakugaProgressElement,
  SakugaRadioElement,
  SakugaRatingElement,
  SakugaSliderElement,
  SakugaToastElement,
  SakugaToggleElement,
} from '../types/sakuga';
import { copyToClipboard } from '../utils/clipboard';

interface ControlCardProps {
  item: SakugaControlSpec;
  onInspect: (item: SakugaControlSpec) => void;
}

export function ControlCard({ item, onInspect }: ControlCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SakugaProgressElement | null>(null);
  const [eventLog, setEventLog] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;

    host.innerHTML = item.html;
    const el = host.querySelector(item.tag);
    if (!el) return;

    let doneTimer: number | undefined;
    const cleanups: Array<() => void> = [];

    if (item.key === 'button-primary') {
      const btn = el as SakugaButtonElement;
      const onClick = () => {
        setEventLog('click fired — waiting for done()');
        window.clearTimeout(doneTimer);
        doneTimer = window.setTimeout(() => {
          btn.done();
          setEventLog('done() landed check');
        }, 760);
      };
      btn.addEventListener('click', onClick);
      cleanups.push(() => btn.removeEventListener('click', onClick));
    } else if (item.key === 'button-secondary') {
      const btn = el as SakugaButtonElement;
      const onClick = () => setEventLog('click fired');
      btn.addEventListener('click', onClick);
      cleanups.push(() => btn.removeEventListener('click', onClick));
    } else if (item.key === 'toggle') {
      const toggle = el as SakugaToggleElement;
      const onChange = () => setEventLog(`change: ${toggle.checked ? 'on' : 'off'}`);
      toggle.addEventListener('change', onChange);
      cleanups.push(() => toggle.removeEventListener('change', onChange));
    } else if (item.key === 'checkbox') {
      const box = el as SakugaCheckboxElement;
      const onChange = () => setEventLog(`change: ${box.checked ? 'checked' : 'unchecked'}`);
      box.addEventListener('change', onChange);
      cleanups.push(() => box.removeEventListener('change', onChange));
    } else if (item.key === 'slider') {
      const slider = el as SakugaSliderElement;
      const onInput = () => setEventLog(`input: ${slider.value}%`);
      const onChange = () => setEventLog(`change: ${slider.value}%`);
      slider.addEventListener('input', onInput);
      slider.addEventListener('change', onChange);
      cleanups.push(() => {
        slider.removeEventListener('input', onInput);
        slider.removeEventListener('change', onChange);
      });
    } else if (item.key === 'radio') {
      const radio = el as SakugaRadioElement;
      const onChange = () => setEventLog(`change: ${radio.value}`);
      radio.addEventListener('change', onChange);
      cleanups.push(() => radio.removeEventListener('change', onChange));
    } else if (item.key === 'input') {
      const input = el as SakugaInputElement;
      const onInput = () =>
        setEventLog(input.value ? `input: "${input.value}"` : 'input: (empty)');
      const onChange = () =>
        setEventLog(input.value ? `change: "${input.value}"` : 'change: (empty)');
      input.addEventListener('input', onInput);
      input.addEventListener('change', onChange);
      cleanups.push(() => {
        input.removeEventListener('input', onInput);
        input.removeEventListener('change', onChange);
      });
    } else if (item.key === 'tabs') {
      const onChange = (e: Event) => {
        const detail = (e as CustomEvent<{ index: number; value: string; label: string }>).detail;
        setEventLog(`change: ${detail?.label ?? 'Tab switched'}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'progress') {
      const prog = el as SakugaProgressElement;
      progressRef.current = prog;
      const surgeTimers: number[] = [];

      const runSurge = () => {
        surgeTimers.forEach((id) => window.clearTimeout(id));
        surgeTimers.length = 0;
        prog.reset();
        setEventLog('Surging load...');
        surgeTimers.push(window.setTimeout(() => prog.set(0.28), 140));
        surgeTimers.push(window.setTimeout(() => prog.set(0.68), 640));
        surgeTimers.push(window.setTimeout(() => prog.set(1), 1180));
      };

      const onDone = () => setEventLog('sakuga:done — 100% impact landed');
      const onClickBar = () => runSurge();
      prog.addEventListener('sakuga:done', onDone);
      prog.addEventListener('click', onClickBar);

      // Show a crisp initial 42% settled state until the user surges or drives it
      prog.set(0.42, true);

      cleanups.push(() => {
        surgeTimers.forEach((id) => window.clearTimeout(id));
        prog.removeEventListener('sakuga:done', onDone);
        prog.removeEventListener('click', onClickBar);
        progressRef.current = null;
      });
    } else if (item.key === 'rating') {
      const rating = el as SakugaRatingElement;
      const onChange = () => setEventLog(`change: ${rating.value} / 5 stars`);
      rating.addEventListener('change', onChange);
      cleanups.push(() => rating.removeEventListener('change', onChange));
    } else if (item.key === 'toast') {
      const toast = el as SakugaToastElement;
      const saveBtn = host.querySelector('[data-demo="save"]');
      const onSave = () => {
        toast.show('Saved successfully!');
        setEventLog('show("Saved successfully!")');
      };
      saveBtn?.addEventListener('click', onSave);
      cleanups.push(() => saveBtn?.removeEventListener('click', onSave));
    } else if (item.key === 'like') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ liked: boolean; count: number }>).detail;
        setEventLog(`change: ${d?.liked ? 'liked' : 'unliked'} (${d?.count ?? 0})`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'accordion') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ open: boolean }>).detail;
        setEventLog(`change: ${d?.open ? 'expanded' : 'collapsed'}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'stepper') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: number }>).detail;
        setEventLog(`change: ${d?.value ?? 0}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'select') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ label: string; value: string }>).detail;
        setEventLog(`change: ${d?.label ?? d?.value ?? ''}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'copy') {
      const onCopy = () => setEventLog('sakuga:copy — snippet copied');
      el.addEventListener('sakuga:copy', onCopy);
      cleanups.push(() => el.removeEventListener('sakuga:copy', onCopy));
    } else if (item.key === 'chip-group') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ values: string[] }>).detail;
        const list = d?.values?.length ? d.values.join(', ') : 'none';
        setEventLog(`change: [${list}]`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'segmented') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ label: string; value: string }>).detail;
        setEventLog(`change: ${d?.label ?? d?.value ?? ''}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'otp') {
      const onInput = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        setEventLog(d?.value ? `input: "${d.value}"` : 'input: (empty)');
      };
      const onComplete = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        setEventLog(`complete: "${d?.value ?? ''}" — ドン!`);
      };
      el.addEventListener('input', onInput);
      el.addEventListener('complete', onComplete);
      cleanups.push(() => {
        el.removeEventListener('input', onInput);
        el.removeEventListener('complete', onComplete);
      });
    } else if (item.key === 'hold') {
      const onConfirm = (e: Event) => {
        const d = (e as CustomEvent<{ count: number }>).detail;
        setEventLog(`confirm: purged (#${d?.count ?? 1})`);
      };
      const onCancel = (e: Event) => {
        const d = (e as CustomEvent<{ progress: number }>).detail;
        setEventLog(`cancel: released at ${Math.round((d?.progress ?? 0) * 100)}%`);
      };
      el.addEventListener('confirm', onConfirm);
      el.addEventListener('cancel', onCancel);
      cleanups.push(() => {
        el.removeEventListener('confirm', onConfirm);
        el.removeEventListener('cancel', onCancel);
      });
    } else if (item.key === 'counter') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: number; delta: number }>).detail;
        const tag = d?.delta ? `(+${d.delta})` : '(reset)';
        setEventLog(`change: ${String(d?.value ?? 0).padStart(3, '0')} ${tag}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'bell') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ unread: number; action: string }>).detail;
        setEventLog(`change: ${d?.action ?? 'updated'} (${d?.unread ?? 0} unread)`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'tags') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ values: string[]; action: string }>).detail;
        setEventLog(`${d?.action ?? 'change'}: ${d?.values?.length ?? 0} active`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'meter') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ level: number; max: number }>).detail;
        setEventLog(
          d?.level === d?.max ? `change: LV ${d?.level} OVERDRIVE!` : `change: LV ${d?.level ?? 1} / ${d?.max ?? 5}`
        );
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'card-toggle') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ checked: boolean }>).detail;
        setEventLog(`change: ${d?.checked ? 'enabled' : 'disabled'}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'fab') {
      const onAction = (e: Event) => {
        const d = (e as CustomEvent<{ action: string }>).detail;
        setEventLog(`action: ${d?.action ?? 'triggered'}`);
      };
      el.addEventListener('action', onAction);
      cleanups.push(() => el.removeEventListener('action', onAction));
    } else if (item.key === 'swatches') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: string; label: string }>).detail;
        setEventLog(`change: ${d?.label ?? ''} (${d?.value ?? ''})`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'timer') {
      const onState = (e: Event) => {
        const d = (e as CustomEvent<{ running: boolean; remaining: number }>).detail;
        setEventLog(`${d?.running ? 'running' : 'paused'}: ${d?.remaining ?? 0}s`);
      };
      const onTick = (e: Event) => {
        const d = (e as CustomEvent<{ remaining: number }>).detail;
        setEventLog(`tick: ${d?.remaining ?? 0}s remaining`);
      };
      const onComplete = () => setEventLog('complete: 00s — ドン!');
      el.addEventListener('state', onState);
      el.addEventListener('tick', onTick);
      el.addEventListener('complete', onComplete);
      cleanups.push(() => {
        el.removeEventListener('state', onState);
        el.removeEventListener('tick', onTick);
        el.removeEventListener('complete', onComplete);
      });
    } else if (item.key === 'split-button') {
      const onAction = (e: Event) => {
        const d = (e as CustomEvent<{ label: string }>).detail;
        setEventLog(`action: ${d?.label ?? ''}`);
      };
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ label: string }>).detail;
        setEventLog(`mode switched -> ${d?.label ?? ''}`);
      };
      el.addEventListener('action', onAction);
      el.addEventListener('change', onChange);
      cleanups.push(() => {
        el.removeEventListener('action', onAction);
        el.removeEventListener('change', onChange);
      });
    } else if (item.key === 'action-button') {
      const onClick = () => setEventLog('click: Focus action fired — シュッ');
      el.addEventListener('click', onClick);
      cleanups.push(() => el.removeEventListener('click', onClick));
    } else if (item.key === 'icon-button') {
      const onClick = () => setEventLog('click: danger shatter fired — シュッ');
      el.addEventListener('click', onClick);
      cleanups.push(() => el.removeEventListener('click', onClick));
    } else if (item.key === 'textarea') {
      const onInput = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        const len = d?.value?.length ?? 0;
        setEventLog(len > 0 ? `input: ${len} chars` : 'input: (empty)');
      };
      el.addEventListener('input', onInput);
      cleanups.push(() => el.removeEventListener('input', onInput));
    } else if (item.key === 'nav') {
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ label: string }>).detail;
        setEventLog(`change: ${d?.label ?? ''}`);
      };
      el.addEventListener('change', onChange);
      cleanups.push(() => el.removeEventListener('change', onChange));
    } else if (item.key === 'alert') {
      const onDismiss = (e: Event) => {
        const d = (e as CustomEvent<{ tone: string }>).detail;
        setEventLog(`dismiss: ${d?.tone ?? 'info'} alert closed`);
      };
      el.addEventListener('dismiss', onDismiss);
      cleanups.push(() => el.removeEventListener('dismiss', onDismiss));
    }

    return () => {
      window.clearTimeout(doneTimer);
      cleanups.forEach((fn) => fn());
    };
  }, [item.html, item.key, item.tag]);

  const handleCopyAction = async () => {
    const payload =
      item.source === 'studio' ? item.usageSnippet : buildInstallCommand(item.id);
    const ok = await copyToClipboard(payload);
    if (ok) {
      setCopiedCmd(true);
      setEventLog(
        item.source === 'studio'
          ? 'Usage snippet copied to clipboard'
          : 'Install command copied to clipboard'
      );
      window.setTimeout(() => setCopiedCmd(false), 1800);
    }
  };

  const handleSetProgress = (target: number) => {
    const prog = progressRef.current;
    if (!prog) return;
    const bounded = clampProgressValue(target);
    if (bounded === 0) {
      prog.reset();
      setEventLog('reset() -> 0%');
    } else {
      prog.set(bounded);
      setEventLog(`set(${bounded}) -> ${Math.round(bounded * 100)}%`);
    }
  };

  const handleReplayProgressDemo = () => {
    const prog = progressRef.current;
    if (!prog) return;
    prog.click();
  };

  return (
    <article
      data-testid={`control-card-${item.key}`}
      className={`flex flex-col rounded-2xl border border-[#dcdaf0] bg-white transition-colors duration-150 hover:border-[#b8b3ff] ${
        item.wide ? 'md:col-span-2' : ''
      }`}
    >
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-bold text-[#1d1a4a]">{item.name}</h3>
          <p className="font-mono text-xs text-[#595488]">
            <span>&lt;{item.tag}&gt;</span>
            <span aria-hidden="true"> · </span>
            <span>{item.sfxLabel}</span>
            {item.source === 'studio' && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="font-semibold text-[#5a4fd8]">Studio</span>
              </>
            )}
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#595488]">{item.how}</p>
      </div>

      <div
        ref={stageRef}
        className="flex min-h-[210px] flex-1 items-center justify-center px-4 py-6"
      />

      {item.key === 'progress' && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-5 pb-3">
          {[0, 0.35, 0.72, 1].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => handleSetProgress(step)}
              className="rounded-md border border-[#dcdaf0] bg-[#fafaff] px-2.5 py-1 font-mono text-xs font-medium text-[#1d1a4a] tabular-nums transition-colors duration-150 hover:border-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {Math.round(step * 100)}%
            </button>
          ))}
          <button
            type="button"
            onClick={handleReplayProgressDemo}
            className="inline-flex items-center gap-1 rounded-md border border-[#dcdaf0] bg-white px-2.5 py-1 text-xs font-semibold text-[#1d1a4a] transition-colors duration-150 hover:border-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Replay Surge</span>
          </button>
        </div>
      )}

      <p
        aria-live="polite"
        data-testid={`event-log-${item.key}`}
        className="min-h-[1.35rem] px-5 pb-3 text-center font-mono text-xs text-[#595488] tabular-nums"
      >
        {eventLog}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#eceaf7] px-5 py-3">
        <button
          type="button"
          onClick={() => onInspect(item)}
          aria-label={`Inspect docs for ${item.name}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1d1a4a] transition-colors duration-150 hover:bg-[#f4f3fc] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
          <span>Inspect Docs</span>
        </button>

        <button
          type="button"
          onClick={handleCopyAction}
          aria-label={
            item.source === 'studio'
              ? `Copy usage snippet for ${item.name}`
              : `Copy install command for ${item.name}`
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdaf0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1a4a] transition-colors duration-150 hover:border-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copiedCmd ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-[#595488]" aria-hidden="true" />
              <span>{item.source === 'studio' ? 'Copy Snippet' : 'Copy Install'}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
