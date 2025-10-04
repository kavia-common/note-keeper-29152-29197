import React, { useMemo, useState } from 'react';
import { useNotesContext } from '../../context/NotesContext';

/**
 * Sidebar container for search and notes list navigation.
 * - Responsive: collapses under 1024px using internal toggle (no new deps)
 * - Provides slots: Top controls (collapse), Search summary, and NotesList mount point placeholder
 * - Keyboard navigable with ARIA attributes
 */
// PUBLIC_INTERFACE
export default function Sidebar({ initialCollapsed = false }) {
  const { state } = useNotesContext();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const resultSummary = useMemo(() => {
    const total = state.order.length;
    const q = (state.query || '').trim();
    // Summary text changes when searching
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

      {/* SearchBar slot / summary area */}
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

      {/* NotesList mount point (placeholder for now) */}
      <nav
        className="sidebar-list border-subtle rounded-lg"
        role="navigation"
        aria-label="Notes list"
        style={{
          padding: 'var(--space-2)',
          maxHeight: '60vh',
          overflow: 'auto',
        }}
      >
        <ul
          role="list"
          aria-live="polite"
          aria-busy={state.loading ? 'true' : 'false'}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {/* Placeholder: would render actual NotesList items here */}
          {state.order.length === 0 ? (
            <li
              style={{
                padding: 'var(--space-3)',
                color: 'var(--neutral-500)',
                textAlign: 'center',
              }}
            >
              {state.query ? 'No matches.' : 'No notes yet. Use “New Note” to get started.'}
            </li>
          ) : (
            state.order.map((id) => (
              <li
                key={id}
                tabIndex={0}
                className="focus-ring"
                role="link"
                aria-label={`Open note ${id}`}
                style={{
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.25rem',
                  transition: 'background-color var(--transition)',
                }}
                onKeyDown={(e) => {
                  // Basic keyboard hint: Enter to "open" (no-op for now)
                  if (e.key === 'Enter') {
                    // placeholder for selection action in later step
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {state.notesById[id]?.title || 'Untitled'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                  {new Date(state.notesById[id]?.updatedAt || state.notesById[id]?.createdAt || Date.now()).toLocaleString()}
                </div>
              </li>
            ))
          )}
        </ul>
      </nav>

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
