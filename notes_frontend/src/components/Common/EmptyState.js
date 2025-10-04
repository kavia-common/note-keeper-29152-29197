import React from 'react';

/**
 * EmptyState component to display helpful messages when lists have no content,
 * when search yields no results, or when an error occurs.
 * Designed for the Ocean Professional theme and accessibility.
 */
// PUBLIC_INTERFACE
export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Create a new item to get started.',
  icon = '🌊',
  action = null,
  role = 'status',
  'aria-live': ariaLive = 'polite',
}) {
  /** Render an accessible empty state panel. */
  return (
    <div
      className="card border-subtle rounded-lg"
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      style={{ textAlign: 'center' }}
    >
      <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">
        {icon}
      </div>
      <h3 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
        {description}
      </p>
      {action}
    </div>
  );
}
