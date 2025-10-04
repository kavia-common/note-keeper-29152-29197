import React from 'react';

/**
 * Spinner shows an animated loading indicator.
 */
// PUBLIC_INTERFACE
export default function Spinner({
  size = 18,
  color = 'var(--color-primary)',
  'aria-label': ariaLabel = 'Loading',
  style = {},
}) {
  const border = Math.max(2, Math.floor(size / 9));
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className="spinner"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${border}px solid rgba(0,0,0,0.08)`,
        borderTopColor: color,
        animation: 'ocean-spin 0.8s linear infinite',
        ...style,
      }}
    />
  );
}
