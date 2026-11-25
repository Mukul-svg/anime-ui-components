import type {
  ActivityEntry,
  FocusSession,
  NewTaskDraft,
  TaskCategory,
  TaskItem,
  TaskSortMode,
  TaskStatusFilter,
  WorkspaceMetrics,
  WorkspaceState,
} from '../types/workspace';

export const WORKSPACE_STORAGE_KEY = 'koma-desk-workspace-v1';

export const TASK_CATEGORIES: TaskCategory[] = [
  'Engineering',
  'Design',
  'Writing',
  'Ops',
  'Personal',
];

export const TASK_TAG_OPTIONS = ['Deep Work', 'Launch', 'Bug', 'Review'] as const;

export const SWATCH_TO_THEME_ID: Record<string, string> = {
  '#8f8df7': 'classic',
  '#ff5fa8': 'shonen',
  '#3b82f6': 'cobalt',
  '#22c55e': 'matcha',
  '#121214': 'monochrome',
};

export const THEME_ID_TO_SWATCH: Record<string, string> = {
  classic: '#8f8df7',
  shonen: '#ff5fa8',
  cobalt: '#3b82f6',
  matcha: '#22c55e',
  monochrome: '#121214',
};

export function createSeedWorkspaceState(): WorkspaceState {
  return {
    tasks: [
      {
        id: 'task-101',
        title: 'Finalize onboarding micro-interactions & focus ring audit',
        category: 'Design',
        priority: 5,
        estimatedSprints: 2,
        completed: false,
        tags: ['Deep Work', 'Launch'],
        notes: 'Verify keyboard focus order across all form controls and check contrast on mobile viewports.',
        kudos: 4,
        liked: true,
        createdAt: '09:10',
        createdOrder: 4,
      },
      {
        id: 'task-102',
        title: 'Write release changelog and migration notes for v2.4',
        category: 'Writing',
        priority: 4,
        estimatedSprints: 2,
        completed: false,
        tags: ['Launch', 'Review'],
        notes: 'Include before/after benchmarks, relative base path note for GitHub Pages, and credit links.',
        kudos: 2,
        liked: false,
        createdAt: '09:35',
        createdOrder: 3,
      },
      {
        id: 'task-103',
        title: 'Fix Safari scroll jitter on sticky filter toolbar',
        category: 'Engineering',
        priority: 3,
        estimatedSprints: 1,
        completed: false,
        tags: ['Bug'],
        notes: 'Reproduce with trackpad momentum scroll and ensure zero layout writes inside requestAnimationFrame.',
        kudos: 1,
        liked: false,
        createdAt: '10:05',
        createdOrder: 2,
      },
      {
        id: 'task-104',
        title: 'Deploy static build pipeline to GitHub Pages',
        category: 'Ops',
        priority: 4,
        estimatedSprints: 1,
        completed: true,
        tags: ['Launch'],
        notes: 'Verified relative ./assets paths, .nojekyll marker, and automated GitHub Actions deploy.',
        kudos: 5,
        liked: true,
        createdAt: '08:40',
        createdOrder: 1,
      },
    ],
    sessions: [
      {
        id: 'sess-201',
        taskId: 'task-104',
        taskTitle: 'Deploy static build pipeline to GitHub Pages',
        durationSeconds: 1500,
        rating: 5,
        completedAt: '09:05',
      },
    ],
    activities: [
      {
        id: 'act-301',
        message: 'Completed 25m focus sprint on "Deploy static build pipeline to GitHub Pages"',
        timestamp: '09:05',
        kind: 'focus',
      },
      {
        id: 'act-302',
        message: 'Checked off "Deploy static build pipeline to GitHub Pages"',
        timestamp: '09:06',
        kind: 'task',
      },
    ],
    unreadAlerts: 2,
    comboStreak: 4,
    themeId: 'classic',
    scratchpadNote:
      'Daily priorities:\n- Protect one uninterrupted 25-minute block before noon.\n- Keep the shipped UI crisp, keyboard-accessible, and fast.',
    scratchpadPin: '2026',
  };
}

export function formatClockNow(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function validateNewTask(draft: Pick<NewTaskDraft, 'title'>): {
  valid: boolean;
  error: string | null;
} {
  const trimmed = draft.title.trim();
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'Enter a task title (at least 2 characters) before adding it to your board.',
    };
  }
  if (trimmed.length > 140) {
    return {
      valid: false,
      error: 'Keep task titles concise (140 characters or fewer).',
    };
  }
  return { valid: true, error: null };
}

export function createTaskFromDraft(
  draft: NewTaskDraft,
  existingTasks: TaskItem[],
  now = new Date()
): TaskItem {
  const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.createdOrder), 0);
  const cleanTags = Array.from(new Set(draft.tags.map((t) => t.trim()).filter(Boolean)));
  return {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: draft.title.trim(),
    category: draft.category,
    priority: Math.min(5, Math.max(1, Math.round(draft.priority) || 3)),
    estimatedSprints: Math.min(8, Math.max(1, Math.round(draft.estimatedSprints) || 1)),
    completed: false,
    tags: cleanTags.length > 0 ? cleanTags : ['Deep Work'],
    notes: draft.notes.trim(),
    kudos: 0,
    liked: false,
    createdAt: formatClockNow(now),
    createdOrder: maxOrder + 1,
  };
}

export function filterAndSortTasks(
  tasks: TaskItem[],
  status: TaskStatusFilter,
  sortBy: TaskSortMode,
  query: string,
  allowedTags: string[] | null = null
): TaskItem[] {
  const q = query.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (status === 'active' && task.completed) return false;
    if (status === 'done' && !task.completed) return false;

    if (allowedTags && allowedTags.length > 0) {
      const hasAnyTag = task.tags.some((t) => allowedTags.includes(t));
      if (!hasAnyTag) return false;
    }

    if (!q) return true;
    return (
      task.title.toLowerCase().includes(q) ||
      task.category.toLowerCase().includes(q) ||
      task.notes.toLowerCase().includes(q) ||
      task.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.createdOrder - a.createdOrder;
    }
    if (sortBy === 'estimate') {
      if (a.estimatedSprints !== b.estimatedSprints) {
        return a.estimatedSprints - b.estimatedSprints;
      }
      return b.priority - a.priority;
    }
    return b.createdOrder - a.createdOrder;
  });
}

export function computeWorkspaceMetrics(
  tasks: TaskItem[],
  sessions: FocusSession[]
): WorkspaceMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRatio = totalTasks === 0 ? 0 : completedTasks / totalTasks;
  const completionPercent = Math.round(completionRatio * 100);

  const totalSeconds = sessions.reduce((sum, s) => sum + Math.max(0, s.durationSeconds), 0);
  const totalFocusMinutes = Math.round(totalSeconds / 60);

  const ratedSessions = sessions.filter((s) => s.rating > 0);
  const averageRating =
    ratedSessions.length === 0
      ? 0
      : Number(
          (ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length).toFixed(1)
        );

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    completionRatio,
    completionPercent,
    totalFocusMinutes,
    totalSessions: sessions.length,
    averageRating,
  };
}

export function verifyScratchpadPin(entered: string, expectedPin: string): boolean {
  const cleanEntered = entered.trim();
  const cleanExpected = expectedPin.trim();
  return cleanEntered.length === cleanExpected.length && cleanEntered === cleanExpected;
}

export function buildStandupMarkdown(state: WorkspaceState, dateLabel?: string): string {
  const metrics = computeWorkspaceMetrics(state.tasks, state.sessions);
  const completed = state.tasks.filter((t) => t.completed);
  const active = state.tasks.filter((t) => !t.completed);
  const headingDate =
    dateLabel ?? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const lines: string[] = [
    `# Daily Standup — ${headingDate}`,
    '',
    `- **Progress:** ${metrics.completedTasks}/${metrics.totalTasks} tasks (${metrics.completionPercent}%)`,
    `- **Focus Logged:** ${metrics.totalFocusMinutes} min across ${metrics.totalSessions} ${metrics.totalSessions === 1 ? 'session' : 'sessions'}`,
    `- **Streak Combo:** ${String(state.comboStreak).padStart(3, '0')}`,
    '',
    '## Completed',
  ];

  if (completed.length === 0) {
    lines.push('- _No tasks completed yet today._');
  } else {
    for (const task of completed) {
      lines.push(`- [x] ${task.title} (${task.category} · LV ${task.priority})`);
    }
  }

  lines.push('', '## Up Next');
  if (active.length === 0) {
    lines.push('- _All tasks cleared!_');
  } else {
    for (const task of active) {
      lines.push(
        `- [ ] ${task.title} (${task.category} · LV ${task.priority} · ${task.estimatedSprints} ${task.estimatedSprints === 1 ? 'sprint' : 'sprints'})`
      );
    }
  }

  return lines.join('\n');
}

export function buildPlainTextSummary(state: WorkspaceState): string {
  const metrics = computeWorkspaceMetrics(state.tasks, state.sessions);
  const doneTitles = state.tasks.filter((t) => t.completed).map((t) => `• ${t.title}`);
  const activeTitles = state.tasks.filter((t) => !t.completed).map((t) => `• ${t.title}`);
  return [
    `Koma Desk Summary (${metrics.completedTasks}/${metrics.totalTasks} done, ${metrics.totalFocusMinutes}m focus)`,
    '',
    'Done:',
    doneTitles.length ? doneTitles.join('\n') : '• None yet',
    '',
    'In Progress:',
    activeTitles.length ? activeTitles.join('\n') : '• All clear',
  ].join('\n');
}

export function buildWorkspaceJson(state: WorkspaceState): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'Koma Desk (Powered by Anime VFX)',
      ...state,
    },
    null,
    2
  );
}

export function appendActivity(
  activities: ActivityEntry[],
  message: string,
  kind: ActivityEntry['kind'],
  now = new Date()
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    message,
    timestamp: formatClockNow(now),
    kind,
  };
  return [entry, ...activities].slice(0, 24);
}

export function loadWorkspaceState(): WorkspaceState {
  if (typeof window === 'undefined') return createSeedWorkspaceState();
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return createSeedWorkspaceState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const seed = createSeedWorkspaceState();
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seed.tasks,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : seed.sessions,
      activities: Array.isArray(parsed.activities) ? parsed.activities : seed.activities,
      unreadAlerts: typeof parsed.unreadAlerts === 'number' ? Math.max(0, parsed.unreadAlerts) : 0,
      comboStreak: typeof parsed.comboStreak === 'number' ? Math.max(0, parsed.comboStreak) : seed.comboStreak,
      themeId: typeof parsed.themeId === 'string' ? parsed.themeId : seed.themeId,
      scratchpadNote:
        typeof parsed.scratchpadNote === 'string' ? parsed.scratchpadNote : seed.scratchpadNote,
      scratchpadPin:
        typeof parsed.scratchpadPin === 'string' && parsed.scratchpadPin.length === 4
          ? parsed.scratchpadPin
          : seed.scratchpadPin,
    };
  } catch {
    return createSeedWorkspaceState();
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function playCompletionChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 crisp harmonic chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.48);
    });
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch {
    // Ignore audio context autoplay restrictions cleanly
  }
}
