import React, { useMemo } from 'react';

/**
 * Single note list row displaying title and timestamp.
 * Highlights when active and triggers onSelect on click/Enter/Space.
 */
// PUBLIC_INTERFACE
export default function NoteItem({
  note,
  active = false,
  onSelect,
  // Progressive enhancement for listbox/option semantics
  roleOverride = 'listitem',
  idOverride,
  dataIndex,
  ariaSelected,
}) {
  /** Render a clickable, accessible list item for a note. */
  const updatedLabel = useMemo(() => {
    const ts = new Date(note?.updatedAt || note?.createdAt || Date.now());
    return ts.toLocaleString();
  }, [note]);

  const handleActivate = () => {
    if (onSelect) onSelect(note.id);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  const commonStyles = {
    padding: '0.5rem 0.625rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '0.25rem',
    transition: 'background-color var(--transition), color var(--transition)',
    backgroundColor: active ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
    cursor: 'pointer',
  };

  const label = `Open note: ${note?.title ? note.title : 'Untitled'}`;

  return (
    <li
      role={roleOverride}
      id={idOverride}
      data-index={dataIndex}
      aria-current={active ? 'true' : undefined}
      aria-selected={ariaSelected}
      className="focus-ring"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={handleActivate}
      style={commonStyles}
      aria-label={label}
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
