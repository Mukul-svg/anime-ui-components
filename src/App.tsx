import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ControlDocsModal } from './components/ControlDocsModal';
import { FocusWorkspace } from './components/FocusWorkspace';
import { FormPlaygroundSection } from './components/FormPlaygroundSection';
import { GallerySection } from './components/GallerySection';
import { HeroSpotlight } from './components/HeroSpotlight';
import { QuickInstallModal } from './components/QuickInstallModal';
import { SummaryWorkspace } from './components/SummaryWorkspace';
import { TasksWorkspace } from './components/TasksWorkspace';
import { ThemeStudioSection } from './components/ThemeStudioSection';
import { VfxLabSection } from './components/VfxLabSection';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import {
  SAKUGA_GITHUB_URL,
  THEME_PRESETS,
  buildCanvasPalette,
  buildThemeCssVariables,
  computeScaledDelta,
  getThemePresetById,
  isCustomClockMode,
} from './lib/sakugaStudio';
import {
  appendActivity,
  computeWorkspaceMetrics,
  createSeedWorkspaceState,
  createTaskFromDraft,
  formatClockNow,
  loadWorkspaceState,
  saveWorkspaceState,
} from './lib/workspaceStore';
import type {
  SakugaControlSpec,
  SakugaThemePreset,
  SakugaToastElement,
} from './types/sakuga';
import type { AppSection, NewTaskDraft, WorkspaceState } from './types/workspace';

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadWorkspaceState());
  const [activeSection, setActiveSection] = useState<AppSection>('tasks');
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [composerFocusSignal, setComposerFocusSignal] = useState<number>(0);

  const [activeTheme, setActiveTheme] = useState<SakugaThemePreset>(() =>
    getThemePresetById(loadWorkspaceState().themeId)
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [paused, setPaused] = useState<boolean>(false);
  const [inspectedControl, setInspectedControl] = useState<SakugaControlSpec | null>(null);
  const [installOpen, setInstallOpen] = useState<boolean>(false);

  const globalToastHostRef = useRef<HTMLDivElement>(null);
  const globalToastElRef = useRef<SakugaToastElement | null>(null);

  // Persist workspace to localStorage on every state update
  useEffect(() => {
    saveWorkspaceState(workspace);
  }, [workspace]);

  // Mount global <sakuga-toast> once for real app notifications
  useEffect(() => {
    const host = globalToastHostRef.current;
    if (!host) return;
    host.innerHTML = '<sakuga-toast duration="2800"></sakuga-toast>';
    globalToastElRef.current = host.querySelector<SakugaToastElement>('sakuga-toast');
  }, []);

  const notify = useCallback((message: string) => {
    globalToastElRef.current?.show(message);
  }, []);

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

  const metrics = useMemo(
    () => computeWorkspaceMetrics(workspace.tasks, workspace.sessions),
    [workspace.tasks, workspace.sessions]
  );

  // ── Real Workspace Mutations ──
  const handleAddTask = useCallback(
    (draft: NewTaskDraft) => {
      setWorkspace((prev) => {
        const created = createTaskFromDraft(draft, prev.tasks);
        return {
          ...prev,
          tasks: [created, ...prev.tasks],
          activities: appendActivity(prev.activities, `Added task "${created.title}"`, 'task'),
          unreadAlerts: prev.unreadAlerts + 1,
        };
      });
      notify(`Added "${draft.title.trim()}"`);
    },
    [notify]
  );

  const handleToggleComplete = useCallback(
    (id: string, nextCompleted: boolean) => {
      let toggledTitle = '';
      setWorkspace((prev) => {
        const target = prev.tasks.find((t) => t.id === id);
        if (!target) return prev;
        toggledTitle = target.title;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)),
          comboStreak: nextCompleted ? prev.comboStreak + 1 : Math.max(0, prev.comboStreak - 1),
          activities: appendActivity(
            prev.activities,
            nextCompleted ? `Completed "${target.title}"` : `Reopened "${target.title}"`,
            'task'
          ),
          unreadAlerts: nextCompleted ? prev.unreadAlerts + 1 : prev.unreadAlerts,
        };
      });
      if (toggledTitle) {
        notify(nextCompleted ? `Completed "${toggledTitle}"` : `Reopened "${toggledTitle}"`);
      }
    },
    [notify]
  );

  const handleToggleLike = useCallback((id: string, liked: boolean, count: number) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, liked, kudos: count } : t)),
    }));
  }, []);

  const handleUpdateEstimate = useCallback((id: string, nextEstimate: number) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, estimatedSprints: nextEstimate } : t
      ),
    }));
  }, []);

  const handleDeleteTask = useCallback(
    (id: string) => {
      let deletedTitle = '';
      setWorkspace((prev) => {
        const target = prev.tasks.find((t) => t.id === id);
        if (!target) return prev;
        deletedTitle = target.title;
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== id),
          activities: appendActivity(prev.activities, `Deleted "${target.title}"`, 'task'),
        };
      });
      if (deletedTitle) notify(`Removed "${deletedTitle}"`);
    },
    [notify]
  );

  const handleStartFocusForTask = useCallback((taskId: string) => {
    setFocusedTaskId(taskId);
    setActiveSection('focus');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogFocusSession = useCallback(
    (input: {
      taskId: string | null;
      taskTitle: string;
      durationSeconds: number;
      rating: number;
      autoCompleteTask: boolean;
    }) => {
      const minsLabel =
        input.durationSeconds < 60
          ? `${input.durationSeconds}s`
          : `${Math.round(input.durationSeconds / 60)}m`;

      setWorkspace((prev) => {
        const nextTasks =
          input.autoCompleteTask && input.taskId
            ? prev.tasks.map((t) => (t.id === input.taskId ? { ...t, completed: true } : t))
            : prev.tasks;

        return {
          ...prev,
          tasks: nextTasks,
          sessions: [
            {
              id: `sess-${Date.now()}`,
              taskId: input.taskId,
              taskTitle: input.taskTitle,
              durationSeconds: input.durationSeconds,
              rating: input.rating,
              completedAt: formatClockNow(),
            },
            ...prev.sessions,
          ],
          comboStreak: prev.comboStreak + 1,
          unreadAlerts: prev.unreadAlerts + 1,
          activities: appendActivity(
            prev.activities,
            `Logged ${minsLabel} focus sprint on "${input.taskTitle}" (${input.rating}/5)`,
            'focus'
          ),
        };
      });
      notify(`Logged ${minsLabel} sprint!`);
    },
    [notify]
  );

  const handleClearCompleted = useCallback(() => {
    let removed = 0;
    setWorkspace((prev) => {
      removed = prev.tasks.filter((t) => t.completed).length;
      if (removed === 0) return prev;
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => !t.completed),
        activities: appendActivity(
          prev.activities,
          `Cleared ${removed} completed ${removed === 1 ? 'task' : 'tasks'}`,
          'system'
        ),
      };
    });
    notify(removed > 0 ? `Cleared ${removed} completed tasks` : 'No completed tasks to clear');
  }, [notify]);

  const handleRestoreSamples = useCallback(() => {
    const fresh = createSeedWorkspaceState();
    setWorkspace((prev) => ({
      ...fresh,
      themeId: prev.themeId,
    }));
    notify('Starter tasks restored');
  }, [notify]);

  const handleComboChange = useCallback((nextValue: number) => {
    setWorkspace((prev) => ({ ...prev, comboStreak: nextValue }));
  }, []);

  const handleClearAlerts = useCallback(() => {
    setWorkspace((prev) => (prev.unreadAlerts === 0 ? prev : { ...prev, unreadAlerts: 0 }));
  }, []);

  const handleUpdateScratchpad = useCallback((note: string) => {
    setWorkspace((prev) => ({ ...prev, scratchpadNote: note }));
  }, []);

  // ── Theme & Showcase Clock Handlers ──
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = getThemePresetById(presetId);
    setActiveTheme(preset);
    setWorkspace((prev) => ({ ...prev, themeId: preset.id }));
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
    setWorkspace((prev) => ({ ...prev, themeId: THEME_PRESETS[0].id }));
  }, []);

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

  const handleHeaderAction = useCallback(() => {
    if (activeSection === 'components') {
      setInstallOpen(true);
      return;
    }
    setActiveSection('tasks');
    setComposerFocusSignal((n) => n + 1);
  }, [activeSection]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f6fb] text-[#1d1a4a]">
      <WorkspaceHeader
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onQuickAction={handleHeaderAction}
      />

      <main className="flex-1">
        {activeSection === 'tasks' && (
          <TasksWorkspace
            tasks={workspace.tasks}
            metrics={metrics}
            comboStreak={workspace.comboStreak}
            unreadAlerts={workspace.unreadAlerts}
            activities={workspace.activities}
            activeThemeId={activeTheme.id}
            composerFocusSignal={composerFocusSignal}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleComplete}
            onToggleLike={handleToggleLike}
            onUpdateEstimate={handleUpdateEstimate}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocusForTask}
            onComboChange={handleComboChange}
            onClearAlerts={handleClearAlerts}
            onSelectTheme={handleSelectPreset}
            onRestoreSamples={handleRestoreSamples}
          />
        )}

        {activeSection === 'focus' && (
          <FocusWorkspace
            tasks={workspace.tasks}
            selectedTaskId={focusedTaskId}
            sessions={workspace.sessions}
            onSelectTaskId={setFocusedTaskId}
            onLogSession={handleLogFocusSession}
            onQuickAddTask={() => {
              setActiveSection('tasks');
              setComposerFocusSignal((n) => n + 1);
            }}
          />
        )}

        {activeSection === 'summary' && (
          <SummaryWorkspace
            workspace={workspace}
            onUpdateScratchpad={handleUpdateScratchpad}
            onClearCompleted={handleClearCompleted}
            onRestoreSamples={handleRestoreSamples}
            onNotify={notify}
          />
        )}

        {activeSection === 'components' && (
          <>
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
          </>
        )}
      </main>

      <footer className="mt-16 border-t border-[#e2e0f2] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-display text-base font-extrabold text-[#1d1a4a]">
              Koma Desk · Powered by Anime VFX
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
              by Justin Finkelman (MIT License) · 35 anime-physics Web Components · Local-first &amp;
              respects <code className="font-mono">prefers-reduced-motion</code>
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-[#1d1a4a]">
            <button
              type="button"
              onClick={() => {
                setActiveSection('components');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="underline decoration-[#dcdaf0] underline-offset-4 hover:decoration-[#ff5fa8] cursor-pointer"
            >
              35-Control Library
            </button>
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

      {/* Global app-wide toast host */}
      <div
        ref={globalToastHostRef}
        className="pointer-events-none fixed right-6 bottom-6 z-40"
      />

      <ControlDocsModal item={inspectedControl} onClose={() => setInspectedControl(null)} />
      <QuickInstallModal open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}
