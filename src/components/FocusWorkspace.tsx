import { useEffect, useRef, useState } from 'react';
import { playCompletionChime } from '../lib/workspaceStore';
import type {
  SakugaButtonElement,
  SakugaRadioElement,
  SakugaRatingElement,
  SakugaSliderElement,
  SakugaToggleElement,
} from '../types/sakuga';
import type { FocusSession, TaskItem } from '../types/workspace';

interface FocusWorkspaceProps {
  tasks: TaskItem[];
  selectedTaskId: string | null;
  sessions: FocusSession[];
  onSelectTaskId: (id: string | null) => void;
  onLogSession: (input: {
    taskId: string | null;
    taskTitle: string;
    durationSeconds: number;
    rating: number;
    autoCompleteTask: boolean;
  }) => void;
  onQuickAddTask: () => void;
}

type TimerEl = HTMLElement & { setDuration?: (sec: number) => void };

const PRESET_SECONDS: Record<string, number> = {
  demo: 10,
  micro: 300,
  pomodoro: 1500,
  deep: 2700,
};

export function FocusWorkspace({
  tasks,
  selectedTaskId,
  sessions,
  onSelectTaskId,
  onLogSession,
  onQuickAddTask,
}: FocusWorkspaceProps) {
  const [durationSeconds, setDurationSeconds] = useState<number>(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [autoCompleteTask, setAutoCompleteTask] = useState(false);
  const [deepFocusMode, setDeepFocusMode] = useState(false);
  const [sessionRating, setSessionRating] = useState<number>(4);
  const [statusMessage, setStatusMessage] = useState('Pick a task and start your sprint.');

  const activeTasks = tasks.filter((t) => !t.completed);
  const resolvedTask =
    tasks.find((t) => t.id === selectedTaskId) ?? activeTasks[0] ?? tasks[0] ?? null;

  // Refs for latest values inside custom element listeners
  const stateRef = useRef({
    resolvedTask,
    durationSeconds,
    chimeEnabled,
    autoCompleteTask,
    sessionRating,
    onLogSession,
    onSelectTaskId,
    onQuickAddTask,
  });
  stateRef.current = {
    resolvedTask,
    durationSeconds,
    chimeEnabled,
    autoCompleteTask,
    sessionRating,
    onLogSession,
    onSelectTaskId,
    onQuickAddTask,
  };

  const taskSelectHostRef = useRef<HTMLDivElement>(null);
  const timerHostRef = useRef<HTMLDivElement>(null);
  const timerElRef = useRef<TimerEl | null>(null);
  const presetHostRef = useRef<HTMLDivElement>(null);
  const sliderHostRef = useRef<HTMLDivElement>(null);
  const chimeHostRef = useRef<HTMLDivElement>(null);
  const autoDoneHostRef = useRef<HTMLDivElement>(null);
  const deepFocusHostRef = useRef<HTMLDivElement>(null);
  const ratingHostRef = useRef<HTMLDivElement>(null);
  const logBtnHostRef = useRef<HTMLDivElement>(null);
  const tooltipHostRef = useRef<HTMLDivElement>(null);
  const fabHostRef = useRef<HTMLDivElement>(null);

  // Mount target task <sakuga-select> whenever task list changes
  const taskListSignature = tasks.map((t) => `${t.id}:${t.title}:${t.completed}`).join('|');
  useEffect(() => {
    const host = taskSelectHostRef.current;
    if (!host) return;
    if (tasks.length === 0) {
      host.innerHTML =
        '<sakuga-select label="Focus task" style="--sk-select-width: 100%; display: block;"><option value="" selected>Open Focus Block (No task)</option></sakuga-select>';
      return;
    }
    const chosenId = resolvedTask?.id ?? tasks[0].id;
    host.innerHTML = `
      <sakuga-select label="Focus task" style="--sk-select-width: 100%; display: block;">
        ${tasks
          .map((t) => {
            const safe = t.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<option value="${t.id}"${t.id === chosenId ? ' selected' : ''}>${safe}</option>`;
          })
          .join('')}
      </sakuga-select>
    `;
    const el = host.querySelector('sakuga-select');
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ value: string }>).detail;
      stateRef.current.onSelectTaskId(d?.value || null);
    };
    el?.addEventListener('change', onChange);
    return () => el?.removeEventListener('change', onChange);
  }, [taskListSignature, resolvedTask?.id]);

  // Mount <sakuga-timer> once
  useEffect(() => {
    const host = timerHostRef.current;
    if (!host) return;
    host.innerHTML = `<sakuga-timer seconds="${durationSeconds}"></sakuga-timer>`;
    const el = host.querySelector<TimerEl>('sakuga-timer');
    timerElRef.current = el;

    const onState = (e: Event) => {
      const d = (e as CustomEvent<{ running: boolean; remaining: number }>).detail;
      setTimerRunning(Boolean(d?.running));
      setStatusMessage(
        d?.running ? 'Sprint in progress — stay locked in.' : 'Timer paused or reset.'
      );
    };

    const onComplete = (e: Event) => {
      const d = (e as CustomEvent<{ seconds: number }>).detail;
      const cur = stateRef.current;
      setTimerRunning(false);
      if (cur.chimeEnabled) playCompletionChime();
      const targetTitle = cur.resolvedTask?.title ?? 'Open Focus Block';
      cur.onLogSession({
        taskId: cur.resolvedTask?.id ?? null,
        taskTitle: targetTitle,
        durationSeconds: d?.seconds ?? cur.durationSeconds,
        rating: cur.sessionRating,
        autoCompleteTask: cur.autoCompleteTask,
      });
      setStatusMessage(`Sprint complete! Logged "${targetTitle}".`);
    };

    el?.addEventListener('state', onState);
    el?.addEventListener('complete', onComplete);
    return () => {
      el?.removeEventListener('state', onState);
      el?.removeEventListener('complete', onComplete);
    };
  }, []);

  // Mount preset radio, duration slider, toggles, card-toggle, rating, log button, tooltip, and FAB
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (presetHostRef.current) {
      presetHostRef.current.innerHTML = `
        <sakuga-radio label="Sprint duration preset">
          <option value="demo">Quick Demo (10s)</option>
          <option value="micro">Micro (5m)</option>
          <option value="pomodoro" selected>Pomodoro (25m)</option>
          <option value="deep">Deep Block (45m)</option>
        </sakuga-radio>
      `;
      const el = presetHostRef.current.querySelector<SakugaRadioElement>('sakuga-radio');
      const onChange = () => {
        const secs = PRESET_SECONDS[el?.value ?? 'pomodoro'] ?? 1500;
        setDurationSeconds(secs);
        timerElRef.current?.setDuration?.(secs);
        setStatusMessage(
          secs < 60
            ? `Timer set to ${secs}s quick demo — press Start to test the finisher.`
            : `Timer set to ${Math.round(secs / 60)}m sprint.`
        );
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (sliderHostRef.current) {
      sliderHostRef.current.innerHTML =
        '<sakuga-slider value="25" min="1" max="60" unit="m" label="Custom sprint minutes" style="--sk-slider-width: 240px;"></sakuga-slider>';
      const el = sliderHostRef.current.querySelector<SakugaSliderElement>('sakuga-slider');
      const onChange = () => {
        const mins = Math.max(1, Math.min(60, Number(el?.value ?? 25)));
        const secs = mins * 60;
        setDurationSeconds(secs);
        timerElRef.current?.setDuration?.(secs);
        setStatusMessage(`Custom sprint set to ${mins} minutes.`);
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (chimeHostRef.current) {
      chimeHostRef.current.innerHTML =
        '<sakuga-toggle label="Play completion chime" checked></sakuga-toggle>';
      const el = chimeHostRef.current.querySelector<SakugaToggleElement>('sakuga-toggle');
      const onChange = () => setChimeEnabled(Boolean(el?.checked));
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (autoDoneHostRef.current) {
      autoDoneHostRef.current.innerHTML =
        '<sakuga-toggle label="Auto-complete task when timer finishes"></sakuga-toggle>';
      const el = autoDoneHostRef.current.querySelector<SakugaToggleElement>('sakuga-toggle');
      const onChange = () => setAutoCompleteTask(Boolean(el?.checked));
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (deepFocusHostRef.current) {
      deepFocusHostRef.current.innerHTML =
        '<sakuga-card-toggle title="Deep Focus Mode" description="Dim secondary panels while your sprint timer runs"></sakuga-card-toggle>';
      const el = deepFocusHostRef.current.querySelector('sakuga-card-toggle');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ checked: boolean }>).detail;
        setDeepFocusMode(Boolean(d?.checked));
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (ratingHostRef.current) {
      ratingHostRef.current.innerHTML =
        '<sakuga-rating value="4" label="Session focus quality"></sakuga-rating>';
      const el = ratingHostRef.current.querySelector<SakugaRatingElement>('sakuga-rating');
      const onChange = () => setSessionRating(Number(el?.value ?? 4));
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (logBtnHostRef.current) {
      logBtnHostRef.current.innerHTML =
        '<sakuga-button data-action="log-session">Log Session Now</sakuga-button>';
      const el = logBtnHostRef.current.querySelector<SakugaButtonElement>('sakuga-button');
      const onClick = () => {
        const cur = stateRef.current;
        const targetTitle = cur.resolvedTask?.title ?? 'Open Focus Block';
        cur.onLogSession({
          taskId: cur.resolvedTask?.id ?? null,
          taskTitle: targetTitle,
          durationSeconds: Math.max(60, cur.durationSeconds),
          rating: cur.sessionRating,
          autoCompleteTask: cur.autoCompleteTask,
        });
        el?.done();
        setStatusMessage(`Logged session for "${targetTitle}".`);
      };
      el?.addEventListener('click', onClick);
      if (el) cleanups.push(() => el.removeEventListener('click', onClick));
    }

    if (tooltipHostRef.current) {
      tooltipHostRef.current.innerHTML =
        '<sakuga-tooltip label="Focus tip" text="Try Quick Demo (10s) to experience the timer completion burst and harmonic chime right away."></sakuga-tooltip>';
    }

    if (fabHostRef.current) {
      fabHostRef.current.innerHTML = '<sakuga-fab></sakuga-fab>';
      const el = fabHostRef.current.querySelector('sakuga-fab');
      const onAction = (e: Event) => {
        const d = (e as CustomEvent<{ action: string }>).detail;
        const cur = stateRef.current;
        if (d?.action === 'Slash') {
          setDurationSeconds(10);
          timerElRef.current?.setDuration?.(10);
          setStatusMessage('Quick Action: Switched timer to 10s sprint demo.');
        } else if (d?.action === 'Spark') {
          if (cur.chimeEnabled) playCompletionChime();
          const targetTitle = cur.resolvedTask?.title ?? 'Quick 5m Focus Boost';
          cur.onLogSession({
            taskId: cur.resolvedTask?.id ?? null,
            taskTitle: targetTitle,
            durationSeconds: 300,
            rating: cur.sessionRating,
            autoCompleteTask: false,
          });
          setStatusMessage('Quick Action: Logged +5m focus boost.');
        } else if (d?.action === 'Shatter') {
          cur.onQuickAddTask();
        }
      };
      el?.addEventListener('action', onAction);
      if (el) cleanups.push(() => el.removeEventListener('action', onAction));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const dimSecondary = deepFocusMode && timerRunning;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#1d1a4a]">
            Focus Studio
          </h1>
          <p className="mt-1 text-sm text-[#595488]">
            Live countdown sprints with Web Audio completion chime and session logging
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#595488]">Sprint tip</span>
          <div ref={tooltipHostRef} />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
        {/* Left: Primary Timer Stage */}
        <section
          aria-label="Focus timer"
          className="rounded-2xl border border-[#e2e0f2] bg-white p-7 lg:col-span-7"
        >
          <div>
            <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Active Task</p>
            <div ref={taskSelectHostRef} className="max-w-lg" />
          </div>

          <div className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-[#eceaf7] bg-[#f8f8fd] px-6 py-10 text-center">
            <p className="text-xs font-semibold text-[#595488]">
              {resolvedTask ? resolvedTask.title : 'Open Focus Block'}
            </p>
            <div ref={timerHostRef} data-testid="focus-timer-host" className="mt-6" />
            <p
              aria-live="polite"
              data-testid="focus-status"
              className="mt-5 text-xs font-medium text-[#595488]"
            >
              {statusMessage}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 border-t border-[#eceaf7] pt-6 sm:grid-cols-2">
            <div>
              <p className="mb-2.5 text-xs font-semibold text-[#1d1a4a]">Sprint Preset</p>
              <div ref={presetHostRef} />
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold text-[#1d1a4a]">
                Custom Duration ({durationSeconds < 60 ? `${durationSeconds}s` : `${Math.round(durationSeconds / 60)}m`})
              </p>
              <div ref={sliderHostRef} className="pt-5" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 border-t border-[#eceaf7] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">
                Session Focus Quality ({sessionRating}/5)
              </p>
              <div ref={ratingHostRef} />
            </div>
            <div ref={logBtnHostRef} />
          </div>
        </section>

        {/* Right: Focus Environment + Quick Actions + Session Log */}
        <aside
          className={`space-y-6 transition-opacity duration-200 lg:col-span-5 ${
            dimSecondary ? 'opacity-25' : 'opacity-100'
          }`}
        >
          <section
            aria-label="Focus settings"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6 space-y-5"
          >
            <div className="border-b border-[#eceaf7] pb-3.5">
              <h2 className="font-display text-base font-bold text-[#1d1a4a]">
                Environment Controls
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1d1a4a]">Completion chime</p>
                <p className="mt-0.5 text-xs text-[#595488]">Harmonic Web Audio triad at 00:00</p>
              </div>
              <div ref={chimeHostRef} />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#eceaf7] pt-4">
              <div>
                <p className="text-sm font-semibold text-[#1d1a4a]">Auto-complete task</p>
                <p className="mt-0.5 text-xs text-[#595488]">Check off active task when sprint finishes</p>
              </div>
              <div ref={autoDoneHostRef} />
            </div>

            <div className="border-t border-[#eceaf7] pt-4">
              <div ref={deepFocusHostRef} />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#eceaf7] pt-4">
              <div>
                <p className="text-sm font-semibold text-[#1d1a4a]">Quick Actions Dial</p>
                <p className="mt-0.5 text-xs text-[#595488]">
                  Slash: 10s demo · Spark: +5m boost · Shatter: new task
                </p>
              </div>
              <div ref={fabHostRef} />
            </div>
          </section>

          <section
            aria-label="Recent focus sessions"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-[#eceaf7] pb-3.5">
              <h2 className="font-display text-base font-bold text-[#1d1a4a]">
                Logged Focus Sessions
              </h2>
              <span className="text-xs font-medium text-[#595488] tabular-nums">
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            {sessions.length === 0 ? (
              <p className="mt-4 text-sm text-[#595488]">
                Finish a sprint or click Log Session Now to record your first focus block.
              </p>
            ) : (
              <ul data-testid="focus-sessions-list" className="mt-4 divide-y divide-[#eceaf7]">
                {sessions.slice(0, 8).map((sess) => {
                  const durLabel =
                    sess.durationSeconds < 60
                      ? `${sess.durationSeconds}s`
                      : `${Math.round(sess.durationSeconds / 60)}m`;
                  return (
                    <li key={sess.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-[#1d1a4a]">{sess.taskTitle}</p>
                        <span className="font-mono text-xs text-[#595488] tabular-nums shrink-0">
                          {sess.completedAt}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#595488] tabular-nums">
                        <span>{durLabel} logged</span>
                        <span aria-hidden="true"> · </span>
                        <span>Quality {sess.rating}/5</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
