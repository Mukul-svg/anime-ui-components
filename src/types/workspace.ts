export type AppSection = 'tasks' | 'focus' | 'summary' | 'components';

export type TaskCategory = 'Engineering' | 'Design' | 'Writing' | 'Ops' | 'Personal';

export type TaskStatusFilter = 'all' | 'active' | 'done';

export type TaskSortMode = 'priority' | 'newest' | 'estimate';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  priority: number; // 1..5
  estimatedSprints: number; // 1..8
  completed: boolean;
  tags: string[];
  notes: string;
  kudos: number;
  liked: boolean;
  createdAt: string; // HH:MM display stamp
  createdOrder: number;
}

export interface NewTaskDraft {
  title: string;
  category: TaskCategory;
  priority: number;
  estimatedSprints: number;
  tags: string[];
  notes: string;
}

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  durationSeconds: number;
  rating: number; // 0..5
  completedAt: string;
}

export interface ActivityEntry {
  id: string;
  message: string;
  timestamp: string;
  kind: 'task' | 'focus' | 'export' | 'system';
}

export interface WorkspaceState {
  tasks: TaskItem[];
  sessions: FocusSession[];
  activities: ActivityEntry[];
  unreadAlerts: number;
  comboStreak: number;
  themeId: string;
  scratchpadNote: string;
  scratchpadPin: string;
}

export interface WorkspaceMetrics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRatio: number;
  completionPercent: number;
  totalFocusMinutes: number;
  totalSessions: number;
  averageRating: number;
}
