import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SWATCH_TO_THEME_ID,
  TASK_CATEGORIES,
  TASK_TAG_OPTIONS,
  THEME_ID_TO_SWATCH,
  filterAndSortTasks,
  validateNewTask,
} from '../lib/workspaceStore';
import type {
  SakugaButtonElement,
  SakugaInputElement,
  SakugaProgressElement,
} from '../types/sakuga';
import type {
  ActivityEntry,
  NewTaskDraft,
  TaskCategory,
  TaskItem,
  TaskSortMode,
  TaskStatusFilter,
  WorkspaceMetrics,
} from '../types/workspace';
import { TaskRow } from './TaskRow';

interface TasksWorkspaceProps {
  tasks: TaskItem[];
  metrics: WorkspaceMetrics;
  comboStreak: number;
  unreadAlerts: number;
  activities: ActivityEntry[];
  activeThemeId: string;
  composerFocusSignal: number;
  onAddTask: (draft: NewTaskDraft) => void;
  onToggleComplete: (id: string, nextCompleted: boolean) => void;
  onToggleLike: (id: string, liked: boolean, count: number) => void;
  onUpdateEstimate: (id: string, nextEstimate: number) => void;
  onDeleteTask: (id: string) => void;
  onStartFocus: (taskId: string) => void;
  onComboChange: (nextValue: number) => void;
  onClearAlerts: () => void;
  onSelectTheme: (themeId: string) => void;
  onRestoreSamples: () => void;
}

type CounterEl = HTMLElement & { setValue?: (v: number) => void };
type BellEl = HTMLElement & { setCount?: (n: number, ping?: boolean) => void };

export function TasksWorkspace({
  tasks,
  metrics,
  comboStreak,
  unreadAlerts,
  activities,
  activeThemeId,
  composerFocusSignal,
  onAddTask,
  onToggleComplete,
  onToggleLike,
  onUpdateEstimate,
  onDeleteTask,
  onStartFocus,
  onComboChange,
  onClearAlerts,
  onSelectTheme,
  onRestoreSamples,
}: TasksWorkspaceProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSortMode>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([...TASK_TAG_OPTIONS]);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);

  // Composer form state
  const [composerKey, setComposerKey] = useState(0);
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const draftRef = useRef<NewTaskDraft>({
    title: '',
    category: 'Engineering',
    priority: 3,
    estimatedSprints: 2,
    tags: ['Deep Work'],
    notes: '',
  });

  // Custom element hosts
  const progressHostRef = useRef<HTMLDivElement>(null);
  const progressElRef = useRef<SakugaProgressElement | null>(null);
  const counterHostRef = useRef<HTMLDivElement>(null);
  const counterElRef = useRef<CounterEl | null>(null);
  const bellHostRef = useRef<HTMLDivElement>(null);
  const bellElRef = useRef<BellEl | null>(null);

  const tabsHostRef = useRef<HTMLDivElement>(null);
  const segHostRef = useRef<HTMLDivElement>(null);
  const searchHostRef = useRef<HTMLDivElement>(null);
  const tagsHostRef = useRef<HTMLDivElement>(null);

  const composerSectionRef = useRef<HTMLElement>(null);
  const titleInputHostRef = useRef<HTMLDivElement>(null);
  const titleInputElRef = useRef<SakugaInputElement | null>(null);
  const categoryHostRef = useRef<HTMLDivElement>(null);
  const meterHostRef = useRef<HTMLDivElement>(null);
  const stepperHostRef = useRef<HTMLDivElement>(null);
  const chipsHostRef = useRef<HTMLDivElement>(null);
  const notesHostRef = useRef<HTMLDivElement>(null);
  const addBtnHostRef = useRef<HTMLDivElement>(null);
  const addBtnElRef = useRef<SakugaButtonElement | null>(null);
  const swatchHostRef = useRef<HTMLDivElement>(null);
  const closeAlertsBtnHostRef = useRef<HTMLDivElement>(null);
  const emptyActionHostRef = useRef<HTMLDivElement>(null);
  const titleErrorHostRef = useRef<HTMLDivElement>(null);

  const callbacksRef = useRef({
    onAddTask,
    onComboChange,
    onClearAlerts,
    onSelectTheme,
    onRestoreSamples,
  });
  callbacksRef.current = {
    onAddTask,
    onComboChange,
    onClearAlerts,
    onSelectTheme,
    onRestoreSamples,
  };

  // Focus/scroll to composer when header "New Task" button is clicked
  useEffect(() => {
    if (composerFocusSignal === 0) return;
    composerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInputElRef.current?.focus();
  }, [composerFocusSignal]);

  // Mount top KPI controls (<sakuga-progress>, <sakuga-counter>, <sakuga-bell>)
  useEffect(() => {
    if (progressHostRef.current) {
      progressHostRef.current.innerHTML =
        '<sakuga-progress compact label="Daily task completion" style="--sk-progress-width: 100%;"></sakuga-progress>';
      const el = progressHostRef.current.querySelector<SakugaProgressElement>('sakuga-progress');
      progressElRef.current = el;
      el?.set(metrics.completionRatio, true);
    }

    if (counterHostRef.current) {
      counterHostRef.current.innerHTML = `<sakuga-counter value="${comboStreak}"></sakuga-counter>`;
      const el = counterHostRef.current.querySelector<CounterEl>('sakuga-counter');
      counterElRef.current = el;
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: number }>).detail;
        if (typeof d?.value === 'number') callbacksRef.current.onComboChange(d.value);
      };
      el?.addEventListener('change', onChange);
      return () => el?.removeEventListener('change', onChange);
    }
  }, []);

  // Keep progress bar synced with real completionRatio
  const prevRatioRef = useRef<number>(metrics.completionRatio);
  useEffect(() => {
    const prog = progressElRef.current;
    if (!prog) return;
    if (Math.abs(prevRatioRef.current - metrics.completionRatio) > 0.001) {
      if (metrics.completionRatio === 0) prog.reset();
      else prog.set(metrics.completionRatio);
      prevRatioRef.current = metrics.completionRatio;
    }
  }, [metrics.completionRatio]);

  // Keep combo counter synced when updated externally (e.g. completing a task)
  useEffect(() => {
    counterElRef.current?.setValue?.(comboStreak);
  }, [comboStreak]);

  // Mount <sakuga-bell manual>
  useEffect(() => {
    const host = bellHostRef.current;
    if (!host) return;
    host.innerHTML = `<sakuga-bell manual count="${unreadAlerts}" label="Workspace notifications"></sakuga-bell>`;
    const el = host.querySelector<BellEl>('sakuga-bell');
    bellElRef.current = el;
    const onChange = () => {
      setAlertsDrawerOpen((prev) => !prev);
      callbacksRef.current.onClearAlerts();
    };
    el?.addEventListener('change', onChange);
    return () => el?.removeEventListener('change', onChange);
  }, []);

  const prevAlertsRef = useRef(unreadAlerts);
  useEffect(() => {
    const increased = unreadAlerts > prevAlertsRef.current;
    bellElRef.current?.setCount?.(unreadAlerts, increased);
    prevAlertsRef.current = unreadAlerts;
  }, [unreadAlerts]);

  // Mount Filter Toolbar controls (<sakuga-tabs>, <sakuga-segmented>, <sakuga-input>, <sakuga-tags>)
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (tabsHostRef.current) {
      tabsHostRef.current.innerHTML = `
        <sakuga-tabs label="Filter tasks by status">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="done">Done</option>
        </sakuga-tabs>
      `;
      const el = tabsHostRef.current.querySelector('sakuga-tabs');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        const val = d?.value as TaskStatusFilter | undefined;
        if (val === 'all' || val === 'active' || val === 'done') setStatusFilter(val);
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (segHostRef.current) {
      segHostRef.current.innerHTML = `
        <sakuga-segmented label="Sort tasks">
          <option value="priority" selected>Priority</option>
          <option value="newest">Newest</option>
          <option value="estimate">Estimate</option>
        </sakuga-segmented>
      `;
      const el = segHostRef.current.querySelector('sakuga-segmented');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        const val = d?.value as TaskSortMode | undefined;
        if (val === 'priority' || val === 'newest' || val === 'estimate') setSortBy(val);
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (searchHostRef.current) {
      searchHostRef.current.innerHTML =
        '<sakuga-input label="Search tasks" placeholder="Search tasks..." style="--sk-input-width: 100%; display: block;"></sakuga-input>';
      const el = searchHostRef.current.querySelector<SakugaInputElement>('sakuga-input');
      const onInput = () => setSearchQuery(el?.value ?? '');
      el?.addEventListener('input', onInput);
      el?.addEventListener('change', onInput);
      if (el) {
        cleanups.push(() => {
          el.removeEventListener('input', onInput);
          el.removeEventListener('change', onInput);
        });
      }
    }

    if (tagsHostRef.current) {
      tagsHostRef.current.innerHTML = `
        <sakuga-tags label="Active tag filters">
          ${TASK_TAG_OPTIONS.map((tag) => `<option value="${tag}">${tag}</option>`).join('')}
        </sakuga-tags>
      `;
      const el = tagsHostRef.current.querySelector('sakuga-tags');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ values: string[] }>).detail;
        if (Array.isArray(d?.values)) setActiveTags(d.values);
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Mount Add Task Composer controls (re-mounts cleanly after submit via composerKey)
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    draftRef.current = {
      title: '',
      category: 'Engineering',
      priority: 3,
      estimatedSprints: 2,
      tags: ['Deep Work'],
      notes: '',
    };

    if (titleInputHostRef.current) {
      titleInputHostRef.current.innerHTML =
        '<sakuga-input label="Task title" placeholder="e.g. Ship v2 release notes" style="--sk-input-width: 100%; display: block;"></sakuga-input>';
      const el = titleInputHostRef.current.querySelector<SakugaInputElement>('sakuga-input');
      titleInputElRef.current = el;
      const onInput = () => {
        draftRef.current.title = el?.value ?? '';
        if ((el?.value ?? '').trim().length >= 2) setTitleError(null);
      };
      el?.addEventListener('input', onInput);
      el?.addEventListener('change', onInput);
      if (el) {
        cleanups.push(() => {
          el.removeEventListener('input', onInput);
          el.removeEventListener('change', onInput);
        });
      }
    }

    if (categoryHostRef.current) {
      categoryHostRef.current.innerHTML = `
        <sakuga-select label="Task category" style="--sk-select-width: 100%; display: block;">
          ${TASK_CATEGORIES.map(
            (cat, i) => `<option value="${cat}"${i === 0 ? ' selected' : ''}>${cat}</option>`
          ).join('')}
        </sakuga-select>
      `;
      const el = categoryHostRef.current.querySelector('sakuga-select');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: string }>).detail;
        if (d?.value) draftRef.current.category = d.value as TaskCategory;
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (meterHostRef.current) {
      meterHostRef.current.innerHTML =
        '<sakuga-meter value="3" label="Task priority level"></sakuga-meter>';
      const el = meterHostRef.current.querySelector('sakuga-meter');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ level: number }>).detail;
        if (typeof d?.level === 'number') draftRef.current.priority = d.level;
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (stepperHostRef.current) {
      stepperHostRef.current.innerHTML =
        '<sakuga-stepper value="2" min="1" max="8" label="Estimated sprints"></sakuga-stepper>';
      const el = stepperHostRef.current.querySelector('sakuga-stepper');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ value: number }>).detail;
        if (typeof d?.value === 'number') draftRef.current.estimatedSprints = d.value;
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (chipsHostRef.current) {
      chipsHostRef.current.innerHTML = `
        <sakuga-chip-group label="Task tags">
          ${TASK_TAG_OPTIONS.map(
            (tag, idx) => `<option value="${tag}"${idx === 0 ? ' selected' : ''}>${tag}</option>`
          ).join('')}
        </sakuga-chip-group>
      `;
      const el = chipsHostRef.current.querySelector('sakuga-chip-group');
      const onChange = (e: Event) => {
        const d = (e as CustomEvent<{ values: string[] }>).detail;
        if (Array.isArray(d?.values)) draftRef.current.tags = d.values;
      };
      el?.addEventListener('change', onChange);
      if (el) cleanups.push(() => el.removeEventListener('change', onChange));
    }

    if (notesHostRef.current) {
      notesHostRef.current.innerHTML =
        '<sakuga-textarea rows="2" label="Task notes" placeholder="Key acceptance criteria or links..."></sakuga-textarea>';
      const el = notesHostRef.current.querySelector<HTMLElement & { value: string }>('sakuga-textarea');
      const onInput = () => {
        const val = el?.value ?? '';
        draftRef.current.notes = val;
        setNotes(val);
      };
      el?.addEventListener('input', onInput);
      el?.addEventListener('change', onInput);
      if (el) {
        cleanups.push(() => {
          el.removeEventListener('input', onInput);
          el.removeEventListener('change', onInput);
        });
      }
    }

    if (addBtnHostRef.current) {
      addBtnHostRef.current.innerHTML = '<sakuga-button data-action="add-task">Add Task</sakuga-button>';
      const el = addBtnHostRef.current.querySelector<SakugaButtonElement>('sakuga-button');
      addBtnElRef.current = el;
      const onClick = () => {
        const currentTitle = titleInputElRef.current?.value ?? draftRef.current.title;
        draftRef.current.title = currentTitle;
        const check = validateNewTask({ title: currentTitle });
        if (!check.valid) {
          setTitleError(check.error);
          return;
        }
        setTitleError(null);
        const snapshot: NewTaskDraft = {
          ...draftRef.current,
          notes: notesRef.current,
        };
        el?.done();
        callbacksRef.current.onAddTask(snapshot);
        window.setTimeout(() => {
          setNotes('');
          setComposerKey((k) => k + 1);
        }, 420);
      };
      el?.addEventListener('click', onClick);
      if (el) cleanups.push(() => el.removeEventListener('click', onClick));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [composerKey]);

  const notesRef = useRef(notes);
  notesRef.current = notes;

  // Mount <sakuga-alert> when validation error appears
  useEffect(() => {
    const host = titleErrorHostRef.current;
    if (!host) return;
    if (!titleError) {
      host.innerHTML = '';
      return;
    }
    const safeErr = titleError
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    host.innerHTML = `<sakuga-alert tone="danger" dismissible>${safeErr}</sakuga-alert>`;
    const el = host.querySelector('sakuga-alert');
    const onDismiss = () => setTitleError(null);
    el?.addEventListener('dismiss', onDismiss);
    return () => el?.removeEventListener('dismiss', onDismiss);
  }, [titleError]);

  // Mount <sakuga-icon-button> to close alerts drawer
  useEffect(() => {
    const host = closeAlertsBtnHostRef.current;
    if (!host || !alertsDrawerOpen) return;
    host.innerHTML =
      '<sakuga-icon-button icon="close" size="sm" label="Close activity panel"></sakuga-icon-button>';
    const el = host.querySelector('sakuga-icon-button');
    const onClick = () => setAlertsDrawerOpen(false);
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [alertsDrawerOpen]);

  // Mount Live Theme Accent Swatches (<sakuga-swatches>)
  useEffect(() => {
    const host = swatchHostRef.current;
    if (!host) return;
    const currentHex = THEME_ID_TO_SWATCH[activeThemeId] ?? '#8f8df7';
    const items = [
      { hex: '#8f8df7', label: 'Classic' },
      { hex: '#ff5fa8', label: 'Crimson' },
      { hex: '#3b82f6', label: 'Cobalt' },
      { hex: '#22c55e', label: 'Genga' },
      { hex: '#121214', label: 'Manga Ink' },
    ];
    host.innerHTML = `
      <sakuga-swatches label="Workspace palette">
        ${items
          .map(
            (it) =>
              `<option value="${it.hex}"${it.hex === currentHex ? ' selected' : ''}>${it.label}</option>`
          )
          .join('')}
      </sakuga-swatches>
    `;
    const el = host.querySelector('sakuga-swatches');
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ value: string }>).detail;
      const themeId = d?.value ? SWATCH_TO_THEME_ID[d.value] : undefined;
      if (themeId) callbacksRef.current.onSelectTheme(themeId);
    };
    el?.addEventListener('change', onChange);
    return () => el?.removeEventListener('change', onChange);
  }, []);

  const visibleTasks = useMemo(() => {
    const filterTags = activeTags.length < TASK_TAG_OPTIONS.length ? activeTags : null;
    return filterAndSortTasks(tasks, statusFilter, sortBy, searchQuery, filterTags);
  }, [tasks, statusFilter, sortBy, searchQuery, activeTags]);

  // Mount empty-state <sakuga-action-button>
  const showEmpty = visibleTasks.length === 0;
  const noTasksAtAll = tasks.length === 0;
  useEffect(() => {
    const host = emptyActionHostRef.current;
    if (!host || !showEmpty) return;
    const label = noTasksAtAll ? 'Load Sample Tasks' : 'Show All Tasks';
    host.innerHTML = `<sakuga-action-button variant="primary" icon="refresh">${label}</sakuga-action-button>`;
    const el = host.querySelector('sakuga-action-button');
    const onClick = () => {
      if (noTasksAtAll) {
        callbacksRef.current.onRestoreSamples();
      } else {
        setStatusFilter('all');
        setSearchQuery('');
        setActiveTags([...TASK_TAG_OPTIONS]);
      }
    };
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [showEmpty, noTasksAtAll]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
      {/* Compact Workspace Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#1d1a4a]">
            Today&apos;s Tasks
          </h1>
          <p className="mt-1 text-sm text-[#595488]">
            Daily focus planner and sprint queue · Saved locally in your browser
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-end gap-5 shrink-0">
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-xs font-semibold text-[#595488]">Streak Combo</span>
            <div ref={counterHostRef} />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-xs font-semibold text-[#595488]">Activity</span>
            <div ref={bellHostRef} />
          </div>
        </div>
      </div>

      {/* Collapsible Recent Alerts Panel when Bell is clicked */}
      {alertsDrawerOpen && (
        <section
          aria-label="Recent workspace activity"
          className="mt-6 rounded-2xl border border-[#e2e0f2] bg-white p-6"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#eceaf7] pb-3.5">
            <h2 className="font-display text-sm font-bold text-[#1d1a4a]">
              Recent Workspace Activity
            </h2>
            <div ref={closeAlertsBtnHostRef} />
          </div>
          {activities.length === 0 ? (
            <p className="mt-3.5 text-sm text-[#595488]">No activity recorded yet today.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#eceaf7]">
              {activities.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0 text-sm"
                >
                  <span className="text-[#1d1a4a]">{entry.message}</span>
                  <span className="font-mono text-xs text-[#595488] tabular-nums shrink-0">
                    {entry.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Unified Single-Row Daily Overview & KPI Bar */}
      <section
        aria-label="Daily overview"
        className="mt-6 rounded-2xl border border-[#e2e0f2] bg-white px-6 py-5"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold text-[#595488]">Daily Goal Progress</p>
              <span className="text-xs font-medium text-[#595488] tabular-nums">
                {metrics.completedTasks} of {metrics.totalTasks} completed
              </span>
            </div>
            <div ref={progressHostRef} className="mt-2.5" />
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[#eceaf7] lg:col-span-7 lg:border-l lg:border-[#eceaf7] lg:pl-6">
            <div className="pr-4">
              <dt className="text-xs font-medium text-[#595488]">Remaining</dt>
              <dd
                data-testid="metric-active-tasks"
                className="mt-1 font-display text-2xl font-extrabold text-[#1d1a4a] tabular-nums"
              >
                {metrics.activeTasks}
              </dd>
            </div>
            <div className="px-4 sm:px-6">
              <dt className="text-xs font-medium text-[#595488]">Focus Logged</dt>
              <dd
                data-testid="metric-focus-minutes"
                className="mt-1 font-display text-2xl font-extrabold text-[#1d1a4a] tabular-nums"
              >
                {metrics.totalFocusMinutes}m
              </dd>
            </div>
            <div className="pl-4 sm:pl-6">
              <dt className="text-xs font-medium text-[#595488]">Avg Focus Rating</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold text-[#1d1a4a] tabular-nums">
                {metrics.averageRating > 0 ? `${metrics.averageRating}/5` : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Main 2-Column Workspace */}
      <div className="mt-7 grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
        {/* Left Column: Task Queue + Structured Filters */}
        <section aria-label="Task list" className="lg:col-span-8">
          <div className="rounded-2xl border border-[#e2e0f2] bg-white">
            {/* Calm Structured Filter Header */}
            <div className="space-y-4 border-b border-[#eceaf7] bg-[#fcfcff] px-6 py-5 rounded-t-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div ref={tabsHostRef} />
                <div ref={segHostRef} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div ref={searchHostRef} className="w-full sm:max-w-sm" />
                <p
                  data-testid="task-count-summary"
                  className="text-xs font-medium text-[#595488] tabular-nums shrink-0"
                >
                  Showing {visibleTasks.length} of {tasks.length} tasks
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[#f0eef8] pt-3.5">
                <span className="text-xs font-semibold text-[#595488]">Tags</span>
                <div ref={tagsHostRef} />
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="font-display text-lg font-bold text-[#1d1a4a]">
                  {tasks.length === 0 ? 'Your task list is clear' : 'No tasks match your filters'}
                </p>
                <p className="mt-1.5 text-sm text-[#595488]">
                  {tasks.length === 0
                    ? 'Add a new task on the right or load starter tasks to try the full workflow.'
                    : 'Try switching back to All or clearing your search query.'}
                </p>
                <div ref={emptyActionHostRef} className="mt-6 flex items-center justify-center" />
              </div>
            ) : (
              <ul data-testid="task-list" className="divide-y divide-[#eceaf7] py-1">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onToggleLike={onToggleLike}
                    onUpdateEstimate={onUpdateEstimate}
                    onStartFocus={onStartFocus}
                    onDelete={onDeleteTask}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Right Column: Sticky Composer + Live Palette Rail */}
        <aside className="space-y-6 lg:sticky lg:top-[88px] lg:col-span-4">
          <section
            ref={composerSectionRef}
            aria-label="Add new task"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6"
          >
            <div className="border-b border-[#eceaf7] pb-4">
              <h2 className="font-display text-lg font-bold text-[#1d1a4a]">New Task</h2>
              <p className="mt-1 text-xs text-[#595488]">
                Creates a task immediately on your local board.
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">
                  Task title <span className="text-[#ff5fa8]">*</span>
                </p>
                <div ref={titleInputHostRef} />
                <div
                  ref={titleErrorHostRef}
                  data-testid="new-task-error"
                  className={titleError ? 'mt-3' : ''}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Category</p>
                <div ref={categoryHostRef} />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Priority Level</p>
                  <div ref={meterHostRef} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Estimated Sprints</p>
                  <div ref={stepperHostRef} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Tags</p>
                <div ref={chipsHostRef} />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#1d1a4a]">Notes (optional)</p>
                <div ref={notesHostRef} />
              </div>

              <div className="border-t border-[#eceaf7] pt-4">
                <div ref={addBtnHostRef} />
              </div>
            </div>
          </section>

          <section
            aria-label="Workspace palette"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6"
          >
            <h2 className="font-display text-sm font-bold text-[#1d1a4a]">Workspace Palette</h2>
            <p className="mt-1 text-xs text-[#595488]">
              Updates every control and cel-shaded canvas effect live.
            </p>
            <div ref={swatchHostRef} className="mt-4" />
          </section>
        </aside>
      </div>
    </div>
  );
}
