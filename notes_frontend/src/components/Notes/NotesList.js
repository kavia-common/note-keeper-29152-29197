import React, { useMemo } from 'react';
import SearchBar from '../Common/SearchBar';
import EmptyState from '../Common/EmptyState';
import NoteItem from './NoteItem';

/**
 * NotesList renders a searchable list of notes.
 * - Router-agnostic: selection routed via onSelect(noteId)
 * - Highlights selected note via selectedId prop
 * - Accepts controlled search value or uses internal filter with provided onSearch
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
        <EmptyState
          title="No notes"
          description={emptyMessage}
          icon="📝"
        />
      ) : showNoResults ? (
        <EmptyState
          title="No results"
          description={notFoundMessage}
          icon="🔎"
        />
      ) : (
        <nav
          role="navigation"
          aria-label={ariaLabel}
          className="border-subtle rounded-lg"
          style={{ padding: 'var(--space-2)', maxHeight: '60vh', overflow: 'auto' }}
        >
          <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                active={selectedId === note.id}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
