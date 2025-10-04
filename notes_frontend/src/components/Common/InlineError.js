import React from 'react';

/**
 * InlineError shows a compact error message region with proper roles.
 */
// PUBLIC_INTERFACE
export default function InlineError({
  message,
  id,
  'aria-live': ariaLive = 'assertive',
  focusable = false,
  style = {},
  refEl,
}) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      aria-live={ariaLive}
      tabIndex={focusable ? -1 : undefined}
      className="inline-error"
      ref={refEl}
      style={{
        color: 'white',
        background: 'var(--color-error)',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
    >
      {message}
    </div>
  );
}
