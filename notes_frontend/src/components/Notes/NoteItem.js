import React, { useMemo } from 'react';

/**
 * Single note list row displaying title and timestamp.
 * Highlights when active and triggers onSelect on click/Enter.
 */
// PUBLIC_INTERFACE
export default function NoteItem({
  note,
  active = false,
  onSelect,
}) {
  /** Render a clickable, accessible list item for a note. */
  const updatedLabel = useMemo(() => {
    const ts = new Date(note?.updatedAt || note?.createdAt || Date.now());
    return ts.toLocaleString();
  }, [note]);

  const handleActivate = () => {
    if (onSelect) onSelect(note.id);
  };

  return (
    <li
      role="listitem"
      aria-current={active ? 'true' : undefined}
      className="focus-ring"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
      onClick={handleActivate}
      style={{
        padding: '0.5rem 0.625rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.25rem',
        transition: 'background-color var(--transition)',
        backgroundColor: active ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
        cursor: 'pointer',
      }}
      aria-label={`Open note: ${note?.title ? note.title : 'Untitled'}`}
    >
      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
        {note?.title?.trim() ? note.title : 'Untitled'}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
        {updatedLabel}
      </div>
    </li>
  );
}
