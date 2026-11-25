import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { SAKUGA_REPO } from '../lib/sakugaStudio';
import { copyToClipboard } from '../utils/clipboard';

interface QuickInstallModalProps {
  open: boolean;
  onClose: () => void;
}

const CLI_SNIPPET = `npx shadcn add ${SAKUGA_REPO}/button
npx shadcn add ${SAKUGA_REPO}/toggle
npx shadcn add ${SAKUGA_REPO}/slider`;

const SKILL_SNIPPET = `npx skills add ${SAKUGA_REPO}`;

export function QuickInstallModal({ open, onClose }: QuickInstallModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<'cli' | 'skill' | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  const handleCopy = async (kind: 'cli' | 'skill', text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="quick-install-title"
      className="m-auto w-[min(600px,calc(100vw-2rem))] rounded-2xl border border-[#dcdaf0] bg-white p-0 text-[#1d1a4a] shadow-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#eceaf7] px-6 py-5">
        <div>
          <p className="text-xs font-semibold text-[#595488]">
            Anime VFX · Built on Sakuga VFX (MIT)
          </p>
          <h2 id="quick-install-title" className="mt-1 font-display text-2xl font-bold text-[#1d1a4a]">
            Install Anime VFX &amp; Sakuga Core
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick install modal"
          className="rounded-lg border border-[#dcdaf0] p-2 text-[#595488] transition-colors duration-150 hover:border-[#1d1a4a] hover:text-[#1d1a4a] cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">
              Add Core Components via Upstream Sakuga VFX Registry
            </h3>
            <button
              type="button"
              onClick={() => handleCopy('cli', CLI_SNIPPET)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#dcdaf0] px-2.5 py-1 text-xs font-semibold text-[#1d1a4a] hover:border-[#1d1a4a] cursor-pointer"
            >
              {copied === 'cli' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#595488]" aria-hidden="true" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#595488]">
            Installs Justin Finkelman&apos;s standalone core controls in{' '}
            <code className="font-mono">public/sakuga-vfx/</code>. Then include{' '}
            <code className="font-mono">/sakuga-vfx/extras.js</code> to load all 23 Anime VFX
            Studio Pack extensions on the same <code className="font-mono">window.SakugaFX</code>{' '}
            canvas loop.
          </p>
          <pre className="mt-2.5 overflow-x-auto rounded-xl bg-[#f7f6fd] p-4 font-mono text-xs leading-relaxed text-[#1d1a4a]">
            <code>{CLI_SNIPPET}</code>
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">
              Install the Authoring Skill
            </h3>
            <button
              type="button"
              onClick={() => handleCopy('skill', SKILL_SNIPPET)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#dcdaf0] px-2.5 py-1 text-xs font-semibold text-[#1d1a4a] hover:border-[#1d1a4a] cursor-pointer"
            >
              {copied === 'skill' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#595488]" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#595488]">
            Includes <code className="font-mono">SKILL.md</code>, <code className="font-mono">core.js</code>,
            starter template, and frame-stepping inspector for crafting custom controls.
          </p>
          <pre className="mt-2.5 overflow-x-auto rounded-xl bg-[#f7f6fd] px-4 py-3 font-mono text-xs text-[#1d1a4a]">
            <code>{SKILL_SNIPPET}</code>
          </pre>
        </div>
      </div>
    </dialog>
  );
}
