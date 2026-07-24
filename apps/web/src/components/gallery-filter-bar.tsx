'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TagCount {
  name: string;
  count: number;
}

const ORIENTATIONS = [
  { value: '', label: 'All' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'square', label: 'Square' },
];

export function GalleryFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag') ?? '';
  const currentOrientation = searchParams.get('orientation') ?? '';

  const [tags, setTags] = useState<TagCount[]>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/gallery/tags')
      .then((res) => res.json())
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTagMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function updateParams(next: { tag?: string; orientation?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cursor');

    if (next.tag !== undefined) {
      if (next.tag) params.set('tag', next.tag);
      else params.delete('tag');
    }
    if (next.orientation !== undefined) {
      if (next.orientation) params.set('orientation', next.orientation);
      else params.delete('orientation');
    }

    const qs = params.toString();
    router.push(qs ? `/gallery?${qs}` : '/gallery');
  }

  const hasActiveFilters = currentTag || currentOrientation;

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setTagMenuOpen((v) => !v)}
          className="text-sm px-3.5 py-1.5 rounded-full border border-ink/20 flex items-center gap-1.5"
        >
          {currentTag ? `#${currentTag}` : 'Tags'}
          <i className="ti ti-chevron-down" style={{ fontSize: 14 }} aria-hidden="true" />
        </button>
        {tagMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 bg-paper-light border border-ink/15 rounded-lg shadow-none w-56 max-h-72 overflow-y-auto z-10 py-1.5">
            {tags.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate">No tags yet.</div>
            )}
            {tags.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  updateParams({ tag: t.name === currentTag ? '' : t.name });
                  setTagMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm flex justify-between ${
                  t.name === currentTag ? 'bg-ink/5 font-medium' : ''
                }`}
              >
                <span>{t.name}</span>
                <span className="text-slate font-mono text-xs">{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        {ORIENTATIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => updateParams({ orientation: o.value })}
            className={`text-sm px-3 py-1.5 rounded-full ${
              currentOrientation === o.value
                ? 'bg-ink text-paper-light'
                : 'border border-ink/20 text-slate'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => router.push('/gallery')}
          className="text-sm text-accent"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
