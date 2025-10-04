import React from 'react';

/**
 * Skeleton placeholder block or text line.
 * Use width/height to shape, and rounded to adjust radius.
 */
// PUBLIC_INTERFACE
export default function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'var(--radius-sm)',
  'aria-label': ariaLabel = 'Loading',
  className = '',
  style = {},
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        background: `linear-gradient(90deg, var(--neutral-100) 25%, var(--neutral-200) 37%, var(--neutral-100) 63%)`,
        backgroundSize: '400% 100%',
        animation: 'ocean-skeleton 1.2s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
