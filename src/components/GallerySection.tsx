import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SAKUGA_CATALOG, filterCatalogItems } from '../lib/sakugaStudio';
import type { ControlCategory, SakugaControlSpec } from '../types/sakuga';
import { ControlCard } from './ControlCard';

interface GallerySectionProps {
  onInspectControl: (item: SakugaControlSpec) => void;
}

const CATEGORIES: Array<{ id: ControlCategory; label: string }> = [
  { id: 'all', label: 'All (30)' },
  { id: 'actions', label: 'Actions' },
  { id: 'selection', label: 'Selection' },
  { id: 'inputs', label: 'Inputs & Progress' },
  { id: 'feedback', label: 'Feedback' },
];

export function GallerySection({ onInspectControl }: GallerySectionProps) {
  const [category, setCategory] = useState<ControlCategory>('all');
  const [onlyStudio, setOnlyStudio] = useState(false);
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(
    () => filterCatalogItems(SAKUGA_CATALOG, category, query, onlyStudio),
    [category, query, onlyStudio]
  );

  return (
    <section id="gallery" className="scroll-mt-20 mx-auto max-w-[1200px] px-6 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#595488]">
            01. Interactive Component Gallery
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1d1a4a]">
            All thirty Sakuga controls, live.
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#595488]">
            Includes all twelve original Sakuga VFX controls plus eighteen custom Studio extensions
            built on the shared <code className="font-mono text-xs text-[#1d1a4a]">window.SakugaFX</code>{' '}
            engine.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <label htmlFor="gallery-search" className="sr-only">
              Filter controls by name, tag, or effect
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#595488]"
              aria-hidden="true"
            />
            <input
              id="gallery-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tag or SFX..."
              className="w-full rounded-lg border border-[#dcdaf0] bg-white py-2 pl-9 pr-3 text-sm text-[#1d1a4a] placeholder:text-[#595488]/70 focus:border-[#5a4fd8] focus:outline-none sm:w-52"
            />
          </div>
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
              Studio Pack (18)
            </button>
          </div>
        </div>

        <p className="font-mono text-xs text-[#595488] tabular-nums">
          Showing {visibleItems.length} of {SAKUGA_CATALOG.length} controls
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#dcdaf0] bg-[#fafaff] p-12 text-center">
          <p className="font-display text-lg font-bold text-[#1d1a4a]">No matching controls</p>
          <p className="mt-1 text-sm text-[#595488]">
            Clear your filter or search query to return to all thirty Sakuga VFX controls.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setOnlyStudio(false);
              setQuery('');
            }}
            className="mt-4 rounded-lg bg-[#1d1a4a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#312c70] cursor-pointer"
          >
            Reset Filters
          </button>
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
