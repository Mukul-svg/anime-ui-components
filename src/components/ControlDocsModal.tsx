import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { buildAgentPrompt, buildInstallCommand } from '../lib/sakugaStudio';
import type { SakugaControlSpec } from '../types/sakuga';
import { copyToClipboard } from '../utils/clipboard';

interface ControlDocsModalProps {
  item: SakugaControlSpec | null;
  onClose: () => void;
}

export function ControlDocsModal({ item, onClose }: ControlDocsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copiedKey, setCopiedKey] = useState<'cmd' | 'snippet' | 'prompt' | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) {
      dialog.showModal();
    } else if (!item && dialog.open) {
      dialog.close();
    }
  }, [item]);

  if (!item) return null;

  const installCmd = buildInstallCommand(item.id);
  const agentPrompt = buildAgentPrompt(item);

  const handleCopy = async (key: 'cmd' | 'snippet' | 'prompt', text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="control-docs-title"
      className="m-auto w-[min(680px,calc(100vw-2rem))] rounded-2xl border border-[#dcdaf0] bg-white p-0 text-[#1d1a4a] shadow-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#eceaf7] px-6 py-5">
        <div>
          <p className="font-mono text-xs text-[#595488]">
            &lt;{item.tag}&gt; · {item.sfxLabel}
          </p>
          <h2 id="control-docs-title" className="mt-1 font-display text-2xl font-bold text-[#1d1a4a]">
            {item.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close control documentation"
          className="rounded-lg border border-[#dcdaf0] p-2 text-[#595488] transition-colors duration-150 hover:border-[#1d1a4a] hover:text-[#1d1a4a] cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-5">
        <div>
          <h3 className="font-display text-sm font-bold text-[#1d1a4a]">Effect Breakdown</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#595488]">{item.effectSummary}.</p>
        </div>

        {item.source === 'upstream' ? (
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-[#1d1a4a]">Install via CLI</h3>
              <button
                type="button"
                onClick={() => handleCopy('cmd', installCmd)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dcdaf0] px-2.5 py-1 text-xs font-semibold text-[#1d1a4a] hover:border-[#1d1a4a] cursor-pointer"
              >
                {copiedKey === 'cmd' ? (
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
            <pre className="mt-2 overflow-x-auto rounded-xl bg-[#f7f6fd] px-4 py-3 font-mono text-xs text-[#1d1a4a]">
              <code>{installCmd}</code>
            </pre>
          </div>
        ) : (
          <div>
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">Anime VFX Extension</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#595488]">
              Part of the Anime VFX Studio Pack, built on the upstream Sakuga VFX core engine (
              <code className="font-mono">window.SakugaFX</code>) and bundled in{' '}
              <code className="font-mono">/sakuga-vfx/extras.js</code>. Load after any core Sakuga
              VFX component script.
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">HTML Usage</h3>
            <button
              type="button"
              onClick={() => handleCopy('snippet', item.usageSnippet)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#dcdaf0] px-2.5 py-1 text-xs font-semibold text-[#1d1a4a] hover:border-[#1d1a4a] cursor-pointer"
            >
              {copiedKey === 'snippet' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#5a4fd8]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#595488]" aria-hidden="true" />
                  <span>Copy HTML</span>
                </>
              )}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[#f7f6fd] px-4 py-3 font-mono text-xs leading-relaxed text-[#1d1a4a]">
            <code>{item.usageSnippet}</code>
          </pre>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">Attributes & Tokens</h3>
            <dl className="mt-2 space-y-2.5">
              {item.attributes.map((attr) => (
                <div key={attr.name}>
                  <dt className="font-mono text-xs font-semibold text-[#1d1a4a]">{attr.name}</dt>
                  <dd className="text-xs leading-relaxed text-[#595488]">{attr.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-[#1d1a4a]">Events & Methods</h3>
            <dl className="mt-2 space-y-2.5">
              {item.events.map((ev) => (
                <div key={ev.name}>
                  <dt className="font-mono text-xs font-semibold text-[#1d1a4a]">{ev.name}</dt>
                  <dd className="text-xs leading-relaxed text-[#595488]">{ev.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="border-t border-[#eceaf7] pt-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-bold text-[#1d1a4a]">
                Agent Integration Prompt
              </h3>
              <p className="text-xs text-[#595488]">
                Hands a coding agent the real file URL and wiring rules without redrawing effects.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('prompt', agentPrompt)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d1a4a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#312c70] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedKey === 'prompt' ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Prompt Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Agent Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
