import React, { useMemo, useState } from 'react';
import { useNotesContext } from '../../context/NotesContext';
import { NotesList } from '../Notes';

/**
 * Sidebar container for search and notes list navigation.
 * - Responsive: collapses under 1024px using internal toggle (no new deps)
 * - Provides slots: Top controls (collapse), search summary, and NotesList
 * - Keyboard navigable with ARIA attributes
 */
// PUBLIC_INTERFACE
export default function Sidebar({ initialCollapsed = false }) {
  const { state, actions } = useNotesContext();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const resultSummary = useMemo(() => {
    const total = state.order.length;
    const q = (state.query || '').trim();
    if (!q) return `${total} note${total === 1 ? '' : 's'}`;
    return `“${q}” • ${total} match${total === 1 ? '' : 'es'}`;
  }, [state.order.length, state.query]);

  // The container itself becomes hidden on small screens when collapsed
  const containerStyle = useMemo(
    () => ({
      display: collapsed ? 'none' : 'block',
    }),
    [collapsed]
  );

  const notesArray = useMemo(() => state.order.map((id) => state.notesById[id]).filter(Boolean), [state.order, state.notesById]);

  return (
    <aside
      className="app-sidebar elev-1"
      role="complementary"
      aria-label="Notes navigation sidebar"
      style={containerStyle}
    >
      {/* Header row with collapse toggle (visible on small screens) */}
      <div
        className="sidebar-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Notes</h3>
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}
        >
          {resultSummary}
        </span>

        {/* Collapse only impacts <1024px visually; on large screens layout shows it anyway */}
        <button
          type="button"
          className="btn focus-ring"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          title="Collapse"
          style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--color-primary)' }}
        >
          ⮜
        </button>
      </div>

      {/* Search summary area */}
      <div
        className="sidebar-search-slot card"
        role="region"
        aria-label="Search section"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span aria-hidden="true">🔎</span>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-500)' }}>
              Global search is in the header
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
              {state.query ? `Filtering by: “${state.query}”` : 'Type in the header search to filter'}
            </div>
          </div>
        </div>
      </div>

      {/* Notes list wired to global state */}
      <NotesList
        notes={notesArray}
        selectedId={state.selectedNoteId}
        onSelect={(id) => actions.selectNote(id)}
        searchable={false}
        ariaLabel="Notes list"
      />

      {/* Expand handle for small screens when collapsed */}
      {collapsed && (
        <button
          type="button"
          className="btn focus-ring"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          style={{
            position: 'fixed',
            left: 'var(--space-4)',
            bottom: 'var(--space-4)',
            background: 'var(--color-primary)',
            color: '#fff',
            boxShadow: 'var(--shadow-2)',
          }}
        >
          ⮞ Notes
        </button>
      )}
    </aside>
  );
}
