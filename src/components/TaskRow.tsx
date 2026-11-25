import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SakugaCheckboxElement } from '../types/sakuga';
import type { TaskItem } from '../types/workspace';

interface TaskRowProps {
  task: TaskItem;
  onToggleComplete: (id: string, nextCompleted: boolean) => void;
  onToggleLike: (id: string, liked: boolean, count: number) => void;
  onUpdateEstimate: (id: string, nextEstimate: number) => void;
  onStartFocus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskRow({
  task,
  onToggleComplete,
  onToggleLike,
  onUpdateEstimate,
  onStartFocus,
  onDelete,
}: TaskRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const checkboxHostRef = useRef<HTMLDivElement>(null);
  const likeHostRef = useRef<HTMLDivElement>(null);
  const focusBtnHostRef = useRef<HTMLDivElement>(null);
  const deleteBtnHostRef = useRef<HTMLDivElement>(null);
  const accordionHostRef = useRef<HTMLDivElement>(null);
  const stepperHostRef = useRef<HTMLDivElement>(null);

  const callbacksRef = useRef({
    onToggleComplete,
    onToggleLike,
    onUpdateEstimate,
    onStartFocus,
    onDelete,
  });
  callbacksRef.current = {
    onToggleComplete,
    onToggleLike,
    onUpdateEstimate,
    onStartFocus,
    onDelete,
  };

  const taskMetaRef = useRef(task);
  taskMetaRef.current = task;

  // Mount <sakuga-checkbox> once per task id
  useEffect(() => {
    const host = checkboxHostRef.current;
    if (!host) return;
    const t = taskMetaRef.current;
    host.innerHTML = `<sakuga-checkbox${t.completed ? ' checked' : ''} aria-label="Mark ${t.title.replace(/"/g, '&quot;')} complete"></sakuga-checkbox>`;
    const el = host.querySelector<SakugaCheckboxElement>('sakuga-checkbox');
    if (!el) return;
    const onChange = () => {
      callbacksRef.current.onToggleComplete(t.id, Boolean(el.checked));
    };
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [task.id]);

  // Mount <sakuga-like> once per task id
  useEffect(() => {
    const host = likeHostRef.current;
    if (!host) return;
    const t = taskMetaRef.current;
    host.innerHTML = `<sakuga-like count="${t.kudos}"${t.liked ? ' liked' : ''} label="Boost priority for ${t.title.replace(/"/g, '&quot;')}"></sakuga-like>`;
    const el = host.querySelector('sakuga-like');
    if (!el) return;
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ liked: boolean; count: number }>).detail;
      if (detail) {
        callbacksRef.current.onToggleLike(t.id, detail.liked, detail.count);
      }
    };
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [task.id]);

  // Mount <sakuga-action-button> for Focus launch
  useEffect(() => {
    const host = focusBtnHostRef.current;
    if (!host) return;
    const t = taskMetaRef.current;
    const safeTitle = t.title.replace(/"/g, '&quot;');
    host.innerHTML = `<sakuga-action-button icon="play" variant="accent" label="Start focus sprint for ${safeTitle}">Focus</sakuga-action-button>`;
    const el = host.querySelector('sakuga-action-button');
    if (!el) return;
    const onClick = () => callbacksRef.current.onStartFocus(t.id);
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [task.id]);

  // Mount <sakuga-icon-button> for Delete task
  useEffect(() => {
    const host = deleteBtnHostRef.current;
    if (!host) return;
    const t = taskMetaRef.current;
    const safeTitle = t.title.replace(/"/g, '&quot;');
    host.innerHTML = `<sakuga-icon-button icon="trash" tone="danger" label="Delete task ${safeTitle}"></sakuga-icon-button>`;
    const el = host.querySelector('sakuga-icon-button');
    if (!el) return;
    const onClick = () => callbacksRef.current.onDelete(t.id);
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [task.id]);

  // Mount <sakuga-accordion> and <sakuga-stepper> only when details drawer is expanded (progressive disclosure)
  useEffect(() => {
    if (!detailsOpen) return;
    const cleanups: Array<() => void> = [];
    const t = taskMetaRef.current;

    if (accordionHostRef.current) {
      const safeNotes = (t.notes || 'No extra notes attached to this task yet.')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      accordionHostRef.current.innerHTML = `<sakuga-accordion open summary="Notes & context" style="--sk-accordion-width: 100%; display: block;">${safeNotes}</sakuga-accordion>`;
    }

    if (stepperHostRef.current) {
      stepperHostRef.current.innerHTML = `<sakuga-stepper value="${t.estimatedSprints}" min="1" max="8" label="Estimated sprints for ${t.title.replace(/"/g, '&quot;')}"></sakuga-stepper>`;
      const el = stepperHostRef.current.querySelector('sakuga-stepper');
      if (el) {
        const onChange = (e: Event) => {
          const detail = (e as CustomEvent<{ value: number }>).detail;
          if (typeof detail?.value === 'number') {
            callbacksRef.current.onUpdateEstimate(t.id, detail.value);
          }
        };
        el.addEventListener('change', onChange);
        cleanups.push(() => el.removeEventListener('change', onChange));
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [detailsOpen, task.id, task.notes]);

  return (
    <li
      data-testid={`task-row-${task.id}`}
      className="px-6 py-4 transition-colors duration-150 hover:bg-[#fafafe]"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div ref={checkboxHostRef} className="pt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              aria-expanded={detailsOpen}
              className={`block w-full text-left text-[15px] font-semibold leading-snug transition-colors hover:text-[#5a4fd8] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5fa8] ${
                task.completed ? 'text-[#7b76a3] line-through' : 'text-[#1d1a4a]'
              }`}
            >
              {task.title}
            </button>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#595488] tabular-nums">
              <span className="font-semibold text-[#1d1a4a]">{task.category}</span>
              <span aria-hidden="true">·</span>
              <span className={task.priority >= 5 ? 'font-semibold text-[#be123c]' : ''}>
                LV {task.priority}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {task.estimatedSprints} {task.estimatedSprints === 1 ? 'sprint' : 'sprints'}
              </span>
              {task.tags.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{task.tags.join(' / ')}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">{task.createdAt}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setDetailsOpen((prev) => !prev)}
                aria-expanded={detailsOpen}
                className="inline-flex items-center gap-1 font-semibold text-[#5a4fd8] transition-colors hover:text-[#1d1a4a] cursor-pointer"
              >
                <span>{detailsOpen ? 'Hide details' : 'Details'}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    detailsOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pl-10 sm:pl-0 sm:shrink-0">
          <div ref={likeHostRef} />
          <div ref={focusBtnHostRef} data-testid={`task-focus-${task.id}`} />
          <div ref={deleteBtnHostRef} data-testid={`task-delete-${task.id}`} />
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-4 ml-0 rounded-xl border border-[#e6e4f4] bg-[#f8f8fd] p-4 sm:ml-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div ref={accordionHostRef} className="w-full sm:max-w-md" />
            <div className="flex items-center gap-3 shrink-0 pt-1">
              <span className="text-xs font-semibold text-[#595488]">Sprints</span>
              <div ref={stepperHostRef} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
