import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPlainTextSummary,
  buildStandupMarkdown,
  buildWorkspaceJson,
  triggerFileDownload,
  verifyScratchpadPin,
} from '../lib/workspaceStore';
import { copyToClipboard } from '../utils/clipboard';
import type { WorkspaceState } from '../types/workspace';

interface SummaryWorkspaceProps {
  workspace: WorkspaceState;
  onUpdateScratchpad: (note: string) => void;
  onClearCompleted: () => void;
  onRestoreSamples: () => void;
  onNotify: (message: string) => void;
}

export function SummaryWorkspace({
  workspace,
  onUpdateScratchpad,
  onClearCompleted,
  onRestoreSamples,
  onNotify,
}: SummaryWorkspaceProps) {
  const [scratchpadUnlocked, setScratchpadUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [otpKey, setOtpKey] = useState(0);

  const standupMarkdown = useMemo(() => buildStandupMarkdown(workspace), [workspace]);

  const latestRef = useRef({
    workspace,
    standupMarkdown,
    onClearCompleted,
    onRestoreSamples,
    onNotify,
  });
  latestRef.current = {
    workspace,
    standupMarkdown,
    onClearCompleted,
    onRestoreSamples,
    onNotify,
  };

  const copyHostRef = useRef<HTMLDivElement>(null);
  const splitHostRef = useRef<HTMLDivElement>(null);
  const otpHostRef = useRef<HTMLDivElement>(null);
  const pinHintHostRef = useRef<HTMLDivElement>(null);
  const lockBtnHostRef = useRef<HTMLDivElement>(null);
  const scratchpadHostRef = useRef<HTMLDivElement>(null);
  const pinErrorHostRef = useRef<HTMLDivElement>(null);
  const holdHostRef = useRef<HTMLDivElement>(null);
  const restoreHostRef = useRef<HTMLDivElement>(null);

  // Mount <sakuga-copy> and keep value attribute synced with latest markdown
  useEffect(() => {
    const host = copyHostRef.current;
    if (!host) return;
    host.innerHTML = '<sakuga-copy label="Copy Standup"></sakuga-copy>';
    const el = host.querySelector('sakuga-copy');
    if (el) el.setAttribute('value', latestRef.current.standupMarkdown);
    const onCopy = () => latestRef.current.onNotify('Standup Markdown copied to clipboard');
    el?.addEventListener('sakuga:copy', onCopy);
    return () => el?.removeEventListener('sakuga:copy', onCopy);
  }, []);

  useEffect(() => {
    const el = copyHostRef.current?.querySelector('sakuga-copy');
    if (el) el.setAttribute('value', standupMarkdown);
  }, [standupMarkdown]);

  // Mount <sakuga-split-button>, <sakuga-hold>, <sakuga-button variant="secondary">, and <sakuga-tooltip>
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (splitHostRef.current) {
      splitHostRef.current.innerHTML = `
        <sakuga-split-button>
          <option value="md" selected>Download Markdown</option>
          <option value="json">Download JSON Backup</option>
          <option value="text">Copy Plain Text</option>
        </sakuga-split-button>
      `;
      const el = splitHostRef.current.querySelector('sakuga-split-button');
      const onAction = async (e: Event) => {
        const d = (e as CustomEvent<{ action: string }>).detail;
        const cur = latestRef.current;
        const stamp = new Date().toISOString().slice(0, 10);
        if (d?.action === 'md') {
          triggerFileDownload(`koma-standup-${stamp}.md`, cur.standupMarkdown, 'text/markdown;charset=utf-8');
          cur.onNotify(`Downloaded koma-standup-${stamp}.md`);
        } else if (d?.action === 'json') {
          triggerFileDownload(
            `koma-backup-${stamp}.json`,
            buildWorkspaceJson(cur.workspace),
            'application/json;charset=utf-8'
          );
          cur.onNotify(`Downloaded koma-backup-${stamp}.json`);
        } else if (d?.action === 'text') {
          await copyToClipboard(buildPlainTextSummary(cur.workspace));
          cur.onNotify('Plain text summary copied to clipboard');
        }
      };
      el?.addEventListener('action', onAction);
      if (el) cleanups.push(() => el.removeEventListener('action', onAction));
    }

    if (pinHintHostRef.current) {
      pinHintHostRef.current.innerHTML = `<sakuga-tooltip label="Scratchpad PIN hint" text="Default local PIN is ${latestRef.current.workspace.scratchpadPin}."></sakuga-tooltip>`;
    }

    if (holdHostRef.current) {
      holdHostRef.current.innerHTML =
        '<sakuga-hold label="Hold to Clear Done" done-label="Cleared!"></sakuga-hold>';
      const el = holdHostRef.current.querySelector('sakuga-hold');
      const onConfirm = () => latestRef.current.onClearCompleted();
      el?.addEventListener('confirm', onConfirm);
      if (el) cleanups.push(() => el.removeEventListener('confirm', onConfirm));
    }

    if (restoreHostRef.current) {
      restoreHostRef.current.innerHTML =
        '<sakuga-button variant="secondary">Restore Sample Data</sakuga-button>';
      const el = restoreHostRef.current.querySelector('sakuga-button');
      const onClick = () => latestRef.current.onRestoreSamples();
      el?.addEventListener('click', onClick);
      if (el) cleanups.push(() => el.removeEventListener('click', onClick));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Mount <sakuga-otp> whenever locked
  useEffect(() => {
    if (scratchpadUnlocked) return;
    const host = otpHostRef.current;
    if (!host) return;
    host.innerHTML = '<sakuga-otp length="4" label="Scratchpad PIN"></sakuga-otp>';
    const el = host.querySelector('sakuga-otp');
    const onComplete = (e: Event) => {
      const d = (e as CustomEvent<{ value: string }>).detail;
      const entered = d?.value ?? '';
      if (verifyScratchpadPin(entered, latestRef.current.workspace.scratchpadPin)) {
        setPinError(null);
        setScratchpadUnlocked(true);
        latestRef.current.onNotify('Private scratchpad unlocked');
      } else {
        setPinError(`Incorrect PIN "${entered}". Hint: use ${latestRef.current.workspace.scratchpadPin}.`);
      }
    };
    const onInput = () => setPinError(null);
    el?.addEventListener('complete', onComplete);
    el?.addEventListener('input', onInput);
    return () => {
      el?.removeEventListener('complete', onComplete);
      el?.removeEventListener('input', onInput);
    };
  }, [scratchpadUnlocked, otpKey]);

  // Mount <sakuga-alert> for PIN error
  useEffect(() => {
    const host = pinErrorHostRef.current;
    if (!host) return;
    if (!pinError) {
      host.innerHTML = '';
      return;
    }
    const safeErr = pinError.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    host.innerHTML = `<sakuga-alert tone="danger" dismissible>${safeErr}</sakuga-alert>`;
    const el = host.querySelector('sakuga-alert');
    const onDismiss = () => setPinError(null);
    el?.addEventListener('dismiss', onDismiss);
    return () => el?.removeEventListener('dismiss', onDismiss);
  }, [pinError]);

  // Mount <sakuga-action-button> Lock and <sakuga-textarea> Scratchpad when unlocked
  useEffect(() => {
    if (!scratchpadUnlocked) return;
    const cleanups: Array<() => void> = [];

    if (lockBtnHostRef.current) {
      lockBtnHostRef.current.innerHTML =
        '<sakuga-action-button icon="lock" size="sm" label="Lock scratchpad">Lock</sakuga-action-button>';
      const el = lockBtnHostRef.current.querySelector('sakuga-action-button');
      const onClick = () => {
        setScratchpadUnlocked(false);
        setOtpKey((k) => k + 1);
      };
      el?.addEventListener('click', onClick);
      if (el) cleanups.push(() => el.removeEventListener('click', onClick));
    }

    if (scratchpadHostRef.current) {
      scratchpadHostRef.current.innerHTML =
        '<sakuga-textarea rows="6" label="Private daily notes" placeholder="Write private end-of-day reflections..."></sakuga-textarea>';
      const el = scratchpadHostRef.current.querySelector<HTMLElement & { value: string }>('sakuga-textarea');
      if (el) {
        el.value = latestRef.current.workspace.scratchpadNote;
        const onInput = () => onUpdateScratchpad(el.value);
        el.addEventListener('input', onInput);
        el.addEventListener('change', onInput);
        cleanups.push(() => {
          el.removeEventListener('input', onInput);
          el.removeEventListener('change', onInput);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [scratchpadUnlocked, onUpdateScratchpad]);

  const completedCount = workspace.tasks.filter((t) => t.completed).length;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
      <div>
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#1d1a4a]">
          Daily Summary
        </h1>
        <p className="mt-1 text-sm text-[#595488]">
          Standup Markdown export, PIN-protected scratchpad, and board maintenance
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
        {/* Left: Auto-generated Standup Report + Real Export Actions */}
        <section
          aria-label="Daily standup report"
          className="rounded-2xl border border-[#e2e0f2] bg-white p-7 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eceaf7] pb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1d1a4a]">
                Live Standup Markdown
              </h2>
              <p className="mt-0.5 text-xs text-[#595488]">
                Generated directly from your current tasks and focus sessions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div ref={copyHostRef} />
              <div ref={splitHostRef} />
            </div>
          </div>

          <pre
            data-testid="standup-markdown-preview"
            className="mt-5 overflow-x-auto rounded-xl border border-[#eceaf7] bg-[#f8f8fd] p-5 font-mono text-xs leading-relaxed text-[#1d1a4a] whitespace-pre-wrap"
          >
            <code>{standupMarkdown}</code>
          </pre>

          <div className="mt-7 border-t border-[#eceaf7] pt-6">
            <h2 className="font-display text-base font-bold text-[#1d1a4a]">
              Board Maintenance
            </h2>
            <p className="mt-1 text-xs text-[#595488]">
              Safely purge your {completedCount} completed{' '}
              {completedCount === 1 ? 'task' : 'tasks'} with a press-and-hold guard, or restore the
              default starter board.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div ref={holdHostRef} />
              <div ref={restoreHostRef} />
            </div>
          </div>
        </section>

        {/* Right: PIN-Protected Private Scratchpad + Activity Log */}
        <aside className="space-y-6 lg:col-span-5">
          <section
            aria-label="Private reflection scratchpad"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#eceaf7] pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#1d1a4a]">
                  Private Daily Scratchpad
                </h2>
                <p className="mt-0.5 text-xs text-[#595488]">
                  Protected by a local 4-digit PIN ({workspace.scratchpadPin}).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {scratchpadUnlocked ? (
                  <div ref={lockBtnHostRef} data-testid="lock-scratchpad-btn" />
                ) : (
                  <div ref={pinHintHostRef} />
                )}
              </div>
            </div>

            {scratchpadUnlocked ? (
              <div className="mt-5">
                <div ref={scratchpadHostRef} data-testid="private-scratchpad-textarea" />
                <p className="mt-2.5 text-xs text-[#595488]">
                  Autosaves locally in your browser on every edit.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex flex-col items-center rounded-xl border border-[#eceaf7] bg-[#f8f8fd] px-5 py-7 text-center">
                <p className="text-xs font-semibold text-[#595488]">
                  Enter 4-digit PIN to unlock your scratchpad
                </p>
                <div ref={otpHostRef} data-testid="scratchpad-otp-host" className="mt-4" />
                <div ref={pinErrorHostRef} className={pinError ? 'mt-4 w-full text-left' : ''} />
              </div>
            )}
          </section>

          <section
            aria-label="Chronological activity log"
            className="rounded-2xl border border-[#e2e0f2] bg-white p-6"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-[#eceaf7] pb-3.5">
              <h2 className="font-display text-base font-bold text-[#1d1a4a]">
                Workspace Activity
              </h2>
              <span className="text-xs font-medium text-[#595488] tabular-nums">
                {workspace.activities.length} entries
              </span>
            </div>

            {workspace.activities.length === 0 ? (
              <p className="mt-4 text-sm text-[#595488]">No recorded events yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[#eceaf7]">
                {workspace.activities.slice(0, 10).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-xs"
                  >
                    <span className="text-[#1d1a4a]">{entry.message}</span>
                    <span className="font-mono text-[#595488] tabular-nums shrink-0">
                      {entry.timestamp}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
