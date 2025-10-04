import React from 'react';

/**
 * SearchBar component with controlled input.
 * Router-agnostic and reusable across the app.
 */
// PUBLIC_INTERFACE
export default function SearchBar({
  value = '',
  placeholder = 'Search…',
  onChange,
  onClear,
  autoFocus = false,
  id = 'search-bar',
  'aria-label': ariaLabel = 'Search',
}) {
  /** Render an accessible search input with clear button. */
  return (
    <div className="border-subtle rounded-md" role="search" aria-label="Search">
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden="true" style={{ paddingLeft: '0.5rem' }}>🔎</span>
        <input
          id={id}
          type="search"
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          style={{ border: 'none', boxShadow: 'none' }}
        />
        {value ? (
          <button
            type="button"
            className="btn"
            onClick={() => onClear && onClear()}
            aria-label="Clear search"
            title="Clear"
            style={{ background: 'transparent', color: 'var(--color-primary)' }}
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}
