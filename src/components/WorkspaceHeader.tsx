import { useEffect, useRef } from 'react';
import type { AppSection } from '../types/workspace';

interface WorkspaceHeaderProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  onQuickAction: () => void;
}

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'focus', label: 'Focus' },
  { id: 'summary', label: 'Summary' },
  { id: 'components', label: 'Components' },
];

type SakugaNavEl = HTMLElement & { value?: string };

export function WorkspaceHeader({
  activeSection,
  onSelectSection,
  onQuickAction,
}: WorkspaceHeaderProps) {
  const navHostRef = useRef<HTMLDivElement>(null);
  const navElRef = useRef<SakugaNavEl | null>(null);
  const ctaHostRef = useRef<HTMLDivElement>(null);

  const callbacksRef = useRef({ onSelectSection, onQuickAction });
  callbacksRef.current = { onSelectSection, onQuickAction };

  // Mount <sakuga-nav> once
  useEffect(() => {
    const host = navHostRef.current;
    if (!host) return;
    host.innerHTML = `
      <sakuga-nav label="Primary navigation" value="${activeSection}">
        ${NAV_ITEMS.map(
          (item) =>
            `<option value="${item.id}"${item.id === activeSection ? ' selected' : ''}>${item.label}</option>`
        ).join('')}
      </sakuga-nav>
    `;
    const el = host.querySelector<SakugaNavEl>('sakuga-nav');
    navElRef.current = el;
    const onChange = (e: Event) => {
      const val = (e as CustomEvent<{ value: AppSection }>).detail?.value;
      if (val) callbacksRef.current.onSelectSection(val);
    };
    el?.addEventListener('change', onChange);
    return () => el?.removeEventListener('change', onChange);
  }, []);

  // Sync <sakuga-nav> active underline whenever activeSection changes externally
  useEffect(() => {
    const el = navElRef.current;
    if (el && el.value !== activeSection) {
      el.setAttribute('value', activeSection);
    }
  }, [activeSection]);

  // Mount / update <sakuga-action-button> for top-right primary CTA
  const isComponents = activeSection === 'components';
  useEffect(() => {
    const host = ctaHostRef.current;
    if (!host) return;
    const icon = isComponents ? 'sparkles' : 'plus';
    const label = isComponents ? 'Quick Install' : 'New Task';
    host.innerHTML = `<sakuga-action-button icon="${icon}" variant="primary" size="md">${label}</sakuga-action-button>`;
    const el = host.querySelector('sakuga-action-button');
    const onClick = () => callbacksRef.current.onQuickAction();
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [isComponents]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e2e0f2] bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-8 px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onSelectSection('tasks')}
          className="font-display text-xl font-extrabold tracking-tight text-[#1d1a4a] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff5fa8]"
        >
          Koma Desk
        </button>

        <div ref={navHostRef} className="flex items-center" />

        <div ref={ctaHostRef} className="flex items-center shrink-0" />
      </div>
    </header>
  );
}
