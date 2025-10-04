import React, { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from '../Common/SearchBar';
import EmptyState from '../Common/EmptyState';
import NoteItem from './NoteItem';

/**
 * NotesList renders a searchable list of notes with accessible keyboard navigation.
 * - Router-agnostic: selection routed via onSelect(noteId)
 * - Highlights selected note via selectedId prop
 * - Accepts controlled search value or uses external onSearch
 * - Keyboard: Up/Down to move active option, Enter to open/edit
 */
// PUBLIC_INTERFACE
export default function NotesList({
  notes = [],
  selectedId = null,
  onSelect,
  searchable = true,
  searchQuery = '',
  onSearch,
  onClearSearch,
  emptyMessage = 'No notes yet. Create a new note to get started.',
  notFoundMessage = 'No notes match your search.',
  ariaLabel = 'Notes list',
}) {
  /** Compute filtered notes using provided searchQuery if onSearch not supplied. */
  const filtered = useMemo(() => {
    const arr = Array.isArray(notes) ? notes : [];
    if (!searchable) return arr;
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notes, searchable, searchQuery]);

  const showEmpty = (notes?.length || 0) === 0;
  const showNoResults = !showEmpty && searchable && (filtered?.length || 0) === 0;

  // Keyboard navigation state for listbox
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, filtered.findIndex((n) => n.id === selectedId))
  );
  const listRef = useRef(null);

  // Reset active index when list changes or selection changes
  useEffect(() => {
    const idx = filtered.findIndex((n) => n.id === selectedId);
    if (idx >= 0) {
      setActiveIndex(idx);
    } else {
      setActiveIndex(0);
    }
  }, [filtered, selectedId]);

  // Scroll active option into view politely
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const option = listEl.querySelector(`[data-index="${activeIndex}"]`);
    if (option && typeof option.scrollIntoView === 'function') {
      option.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const onKeyDownList = (e) => {
    if (!filtered.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filtered[activeIndex];
      if (current && onSelect) onSelect(current.id);
    }
  };

  return (
    <section aria-label="Notes navigation" className="card" style={{ padding: 'var(--space-2)' }}>
      {searchable && (
        <div className="mb-2" role="region" aria-label="Notes search">
          <SearchBar
            value={searchQuery}
            onChange={onSearch}
            onClear={onClearSearch}
            placeholder="Search notes..."
            id="notes-search"
            aria-label="Filter notes"
          />
        </div>
      )}

      {showEmpty ? (
        <EmptyState title="No notes" description={emptyMessage} icon="📝" />
      ) : showNoResults ? (
        <EmptyState title="No results" description={notFoundMessage} icon="🔎" />
      ) : (
        <nav
          role="navigation"
          aria-label={ariaLabel}
          className="border-subtle rounded-lg"
          style={{ padding: 'var(--space-2)', maxHeight: '60vh', overflow: 'auto' }}
        >
          <div
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={
              filtered[activeIndex] ? `note-option-${filtered[activeIndex].id}` : undefined
            }
            tabIndex={0}
            className="focus-ring"
            onKeyDown={onKeyDownList}
            ref={listRef}
          >
            <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map((note, idx) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  active={selectedId === note.id}
                  onSelect={onSelect}
                  roleOverride="option"
                  idOverride={`note-option-${note.id}`}
                  dataIndex={idx}
                  ariaSelected={selectedId === note.id}
                />
              ))}
            </ul>
          </div>
        </nav>
      )}
    </section>
  );
}
