import React, { forwardRef } from 'react';

/**
 * InlineErrorForward provides a forwardRef variant for advanced focus control.
 */
// PUBLIC_INTERFACE
const InlineErrorForward = forwardRef(function InlineErrorForward(
  {
    message,
    id,
    'aria-live': ariaLive = 'assertive',
    focusable = false,
    style = {},
  },
  ref
) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      aria-live={ariaLive}
      tabIndex={focusable ? -1 : undefined}
      className="inline-error"
      ref={ref}
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
});

export default InlineErrorForward;
