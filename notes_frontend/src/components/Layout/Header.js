import React from 'react';

/**
 * Header component for the app shell.
 * Displays the app title and a theme toggle button passed in via props.
 */
// PUBLIC_INTERFACE
export default function Header({ onToggleTheme, currentTheme = 'light' }) {
  /** Header displays app title and theme button */
  return (
    <header className="app-header">
      <div className="title" aria-label="Application title">Notes</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn focus-ring"
          onClick={onToggleTheme}
          aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
          title="Toggle theme"
        >
          {currentTheme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}
