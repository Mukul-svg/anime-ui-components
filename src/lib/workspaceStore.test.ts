import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlainTextSummary,
  buildStandupMarkdown,
  buildWorkspaceJson,
  computeWorkspaceMetrics,
  createSeedWorkspaceState,
  createTaskFromDraft,
  filterAndSortTasks,
  validateNewTask,
  verifyScratchpadPin,
} from './workspaceStore';

test('validateNewTask rejects blank or overly long titles and accepts valid titles', () => {
  assert.equal(validateNewTask({ title: '' }).valid, false);
  assert.equal(validateNewTask({ title: ' a ' }).valid, false);
  assert.equal(validateNewTask({ title: 'x'.repeat(141) }).valid, false);
  assert.equal(validateNewTask({ title: 'Ship static site' }).valid, true);
});

test('createTaskFromDraft normalizes fields, clamps bounds, and assigns next order', () => {
  const seed = createSeedWorkspaceState();
  const created = createTaskFromDraft(
    {
      title: '  Audit keyboard traps  ',
      category: 'Engineering',
      priority: 9,
      estimatedSprints: 0,
      tags: ['Review', 'Review', ''],
      notes: '  Tab through modal  ',
    },
    seed.tasks
  );
  assert.equal(created.title, 'Audit keyboard traps');
  assert.equal(created.priority, 5);
  assert.equal(created.estimatedSprints, 1);
  assert.deepEqual(created.tags, ['Review']);
  assert.equal(created.notes, 'Tab through modal');
  assert.equal(created.completed, false);
  assert.ok(created.createdOrder > Math.max(...seed.tasks.map((t) => t.createdOrder)));
});

test('filterAndSortTasks filters by status, search query, tags, and sorts deterministically', () => {
  const seed = createSeedWorkspaceState();
  const doneOnly = filterAndSortTasks(seed.tasks, 'done', 'priority', '');
  assert.equal(doneOnly.length, 1);
  assert.equal(doneOnly[0].id, 'task-104');

  const activeByPriority = filterAndSortTasks(seed.tasks, 'active', 'priority', '');
  assert.equal(activeByPriority.length, 3);
  assert.equal(activeByPriority[0].priority, 5);
  assert.equal(activeByPriority[2].priority, 3);

  const bugOnly = filterAndSortTasks(seed.tasks, 'all', 'newest', '', ['Bug']);
  assert.equal(bugOnly.length, 1);
  assert.equal(bugOnly[0].id, 'task-103');

  const searchMatch = filterAndSortTasks(seed.tasks, 'all', 'estimate', 'changelog');
  assert.equal(searchMatch.length, 1);
  assert.equal(searchMatch[0].id, 'task-102');
});

test('computeWorkspaceMetrics computes progress ratio, focus minutes, and average rating', () => {
  const seed = createSeedWorkspaceState();
  const metrics = computeWorkspaceMetrics(seed.tasks, [
    ...seed.sessions,
    {
      id: 's2',
      taskId: 'task-101',
      taskTitle: 'Test',
      durationSeconds: 900,
      rating: 4,
      completedAt: '11:00',
    },
  ]);
  assert.equal(metrics.totalTasks, 4);
  assert.equal(metrics.completedTasks, 1);
  assert.equal(metrics.activeTasks, 3);
  assert.equal(metrics.completionPercent, 25);
  assert.equal(metrics.totalFocusMinutes, 40);
  assert.equal(metrics.averageRating, 4.5);
});

test('verifyScratchpadPin matches exact 4-digit PIN cleanly', () => {
  assert.equal(verifyScratchpadPin('2026', '2026'), true);
  assert.equal(verifyScratchpadPin('2025', '2026'), false);
  assert.equal(verifyScratchpadPin('202', '2026'), false);
});

test('standup markdown, plain text, and JSON exporters include real workspace tasks', () => {
  const seed = createSeedWorkspaceState();
  const md = buildStandupMarkdown(seed, 'Nov 25, 2026');
  assert.ok(md.includes('# Daily Standup — Nov 25, 2026'));
  assert.ok(md.includes('- [x] Deploy static build pipeline to GitHub Pages'));
  assert.ok(md.includes('- [ ] Finalize onboarding micro-interactions & focus ring audit'));

  const plain = buildPlainTextSummary(seed);
  assert.ok(plain.includes('1/4 done, 25m focus'));

  const json = JSON.parse(buildWorkspaceJson(seed)) as { tasks: unknown[]; app: string };
  assert.equal(json.tasks.length, 4);
  assert.ok(json.app.includes('Koma Desk'));
});
