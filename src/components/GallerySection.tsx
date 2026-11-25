import { useEffect, useMemo, useRef, useState } from 'react';
import { SAKUGA_CATALOG, filterCatalogItems } from '../lib/sakugaStudio';
import type { ControlCategory, SakugaControlSpec, SakugaInputElement } from '../types/sakuga';
import { ControlCard } from './ControlCard';

interface GallerySectionProps {
  onInspectControl: (item: SakugaControlSpec) => void;
}

const CATEGORIES: Array<{ id: ControlCategory; label: string }> = [
  { id: 'all', label: 'All (35)' },
  { id: 'actions', label: 'Actions' },
  { id: 'selection', label: 'Selection' },
  { id: 'inputs', label: 'Inputs & Progress' },
  { id: 'feedback', label: 'Feedback' },
];

export function GallerySection({ onInspectControl }: GallerySectionProps) {
  const [category, setCategory] = useState<ControlCategory>('all');
  const [onlyStudio, setOnlyStudio] = useState(false);
  const [query, setQuery] = useState('');

  const searchHostRef = useRef<HTMLDivElement>(null);
  const searchInputElRef = useRef<SakugaInputElement | null>(null);
  const resetBtnHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = searchHostRef.current;
    if (!host) return;
    host.innerHTML =
      '<sakuga-input label="Filter controls by name, tag, or effect" placeholder="Search tag or SFX..." style="--sk-input-width: 240px; display: block;"></sakuga-input>';
    const el = host.querySelector<SakugaInputElement>('sakuga-input');
    searchInputElRef.current = el;
    const onInput = () => setQuery(el?.value ?? '');
    el?.addEventListener('input', onInput);
    el?.addEventListener('change', onInput);
    return () => {
      el?.removeEventListener('input', onInput);
      el?.removeEventListener('change', onInput);
    };
  }, []);

  const visibleItems = useMemo(
    () => filterCatalogItems(SAKUGA_CATALOG, category, query, onlyStudio),
    [category, query, onlyStudio]
  );

  const showEmpty = visibleItems.length === 0;
  useEffect(() => {
    const host = resetBtnHostRef.current;
    if (!host || !showEmpty) return;
    host.innerHTML =
      '<sakuga-action-button variant="primary" icon="refresh">Reset Filters</sakuga-action-button>';
    const el = host.querySelector('sakuga-action-button');
    const onClick = () => {
      setCategory('all');
      setOnlyStudio(false);
      setQuery('');
      if (searchInputElRef.current) searchInputElRef.current.value = '';
    };
    el?.addEventListener('click', onClick);
    return () => el?.removeEventListener('click', onClick);
  }, [showEmpty]);

  return (
    <section id="gallery" className="scroll-mt-20 mx-auto max-w-[1280px] px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#595488]">
            01. Interactive Component Gallery
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1d1a4a]">
            All thirty-five Anime VFX controls, live.
          </h2>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-[#595488]">
            Bundles the twelve original{' '}
            <span className="font-semibold text-[#1d1a4a]">Sakuga VFX</span> controls by Justin
            Finkelman alongside twenty-three Anime VFX Studio Pack extensions built on the shared{' '}
            <code className="font-mono text-xs text-[#1d1a4a]">window.SakugaFX</code> engine.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div ref={searchHostRef} />
        </div>
      </div>

      {/* Interactive segmented filter bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eceaf7] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Filter controls by category"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#f4f3fc] p-1"
          >
            {CATEGORIES.map((tab) => {
              const active = !onlyStudio && category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setOnlyStudio(false);
                    setCategory(tab.id);
                  }}
                  aria-pressed={active}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#1d1a4a] shadow-xs'
                      : 'text-[#595488] hover:text-[#1d1a4a]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setCategory('all');
                setOnlyStudio((prev) => !prev);
              }}
              aria-pressed={onlyStudio}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                onlyStudio
                  ? 'bg-[#1d1a4a] text-white shadow-xs'
                  : 'text-[#5a4fd8] hover:text-[#1d1a4a]'
              }`}
            >
              Studio Pack (23)
            </button>
          </div>
        </div>

        <p className="text-xs font-medium text-[#595488] tabular-nums">
          Showing {visibleItems.length} of {SAKUGA_CATALOG.length} controls
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#dcdaf0] bg-[#fafaff] p-12 text-center">
          <p className="font-display text-lg font-bold text-[#1d1a4a]">No matching controls</p>
          <p className="mt-1 text-sm text-[#595488]">
            Clear your filter or search query to return to all thirty-five Anime VFX controls.
          </p>
          <div ref={resetBtnHostRef} className="mt-5 flex justify-center" />
        </div>
      ) : (
        <div
          data-testid="gallery-grid"
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {visibleItems.map((item) => (
            <ControlCard key={item.key} item={item} onInspect={onInspectControl} />
          ))}
        </div>
      )}
    </section>
  );
}
