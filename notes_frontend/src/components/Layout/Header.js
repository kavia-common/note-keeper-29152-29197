import React, { useCallback } from 'react';
import { useNotesContext, NotesActionTypes } from '../../context/NotesContext';
import notesApi from '../../api/notesApi';

/**
 * Header component for the app shell.
 * Displays the app title, global search, "New Note" action, and a theme toggle button.
 * Search dispatches SET_SEARCH_QUERY into NotesContext state.
 * New Note triggers local storage create via notesApi and updates context and selection.
 */
// PUBLIC_INTERFACE
export default function Header({ onToggleTheme, currentTheme = 'light' }) {
  /** Header displays app title, search, new note, and theme toggle */
  const { state, dispatch, actions } = useNotesContext();

  // Update search query in context as user types
  const onSearchChange = useCallback(
    (e) => {
      const q = e.target.value;
      dispatch({ type: NotesActionTypes.SET_SEARCH_QUERY, payload: { query: q } });
    },
    [dispatch]
  );

  // Create a new empty note and select it
  const onCreateNote = useCallback(async () => {
    try {
      actions.setLoading(true);
      const created = await notesApi.createNote({ title: '', content: '' });
      // Optimistic add + select
      actions.createNote(created);
      actions.selectNote(created.id);
      actions.setError(null);
    } catch (e) {
      actions.setError(e?.message || 'Failed to create note');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  return (
    <header className="app-header" role="banner" aria-label="Application header">
      <div className="title" aria-label="Application title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden="true" style={{ color: 'var(--color-primary)' }}>📝</span>
        <span>Notes</span>
      </div>

      {/* Global search input */}
      <div style={{ flex: 1, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
        <label htmlFor="global-search" className="sr-only">Search notes</label>
        <input
          id="global-search"
          type="search"
          value={state.query}
          onChange={onSearchChange}
          placeholder="Search notes..."
          className="input focus-ring"
          aria-label="Search notes"
        />
      </div>

      {/* Actions: New Note and Theme Toggle */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          className="btn btn-amber focus-ring"
          onClick={onCreateNote}
          aria-label="Create a new note"
          title="New note"
        >
          ✨ New Note
        </button>
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
