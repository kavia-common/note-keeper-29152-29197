import React, { useMemo } from 'react';

/**
 * NoteView displays note details in a read-only view.
 * Shows title, created/updated timestamps, and content.
 */
// PUBLIC_INTERFACE
export default function NoteView({ note = null, onEdit }) {
  /** Render view state or placeholder when no note is selected. */
  const times = useMemo(() => {
    if (!note) return null;
    const created = new Date(note.createdAt || Date.now());
    const updated = new Date(note.updatedAt || note.createdAt || Date.now());
    return {
      createdLabel: created.toLocaleString(),
      updatedLabel: updated.toLocaleString(),
    };
  }, [note]);

  if (!note) {
    return (
      <div className="card" role="status" aria-live="polite">
        <h3 style={{ marginTop: 0 }}>No note selected</h3>
        <p className="text-muted">Choose a note from the list to view its content.</p>
      </div>
    );
  }

  return (
    <article className="card" role="article" aria-label="Note content">
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ margin: 0, flex: 1 }}>
          {note.title?.trim() ? note.title : 'Untitled'}
        </h2>
        {onEdit && (
          <button
            type="button"
            className="btn focus-ring"
            onClick={() => onEdit(note.id)}
            aria-label="Edit note"
            title="Edit"
          >
            ✏️ Edit
          </button>
        )}
      </header>

      <div className="mb-2" style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
        <span aria-label="Created at">Created: {times?.createdLabel}</span>
        <span style={{ margin: '0 0.5rem' }}>•</span>
        <span aria-label="Updated at">Updated: {times?.updatedLabel}</span>
      </div>

      <section aria-label="Note body">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontFamily: 'inherit',
            fontSize: 'var(--text-base)',
          }}
        >
          {note.content || ''}
        </pre>
      </section>
    </article>
  );
}
