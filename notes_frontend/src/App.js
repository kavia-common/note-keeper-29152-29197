import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import './styles/theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { NotesList, NoteView, NoteEditor } from './components/Notes';
import notesApi from './api/notesApi';
import { useNotesContext, NotesActionTypes } from './context/NotesContext';

/**
 * Root application shell for the Notes app.
 * Orchestrates NotesContext with API: load notes, search, selection, create, edit, save, and delete.
 * Includes keyboard shortcut for save (Ctrl/Cmd+S) and inline error handling via context.
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const { state, actions, dispatch } = useNotesContext();

  // Apply theme to document root so CSS variables update globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial load of notes on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        actions.setLoading(true);
        const notes = await notesApi.listNotes();
        if (!cancelled) {
          actions.initLoad(notes);
          actions.setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          actions.setError(e?.message || 'Failed to load notes');
        }
      } finally {
        if (!cancelled) {
          actions.setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actions]);

  // Keyboard shortcut: Ctrl/Cmd+S to save when editing
  useEffect(() => {
    function handleKeyDown(e) {
      const isSave = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
      if (!isSave) return;
      // Prevent browser save dialog
      e.preventDefault();

      if (editMode && currentNote) {
        // Save current edits using draft buffer if available (NoteEditor passes via onSave)
        // Here we no-op; actual save triggers via form submit in NoteEditor.
        // Keeping the handler to satisfy requirement and prevent default page save.
        const form = document.querySelector('form[aria-label="Edit note"]');
        if (form) {
          form.requestSubmit?.();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Derived notes array respecting current search query for NotesList
  const notesArray = useMemo(() => {
    const { notesById, order } = state;
    return order.map((id) => notesById[id]).filter(Boolean);
  }, [state.notesById, state.order]);

  const filteredNotes = useMemo(() => {
    const q = (state.query || '').trim().toLowerCase();
    if (!q) return notesArray;
    return notesArray.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notesArray, state.query]);

  const currentNote = state.selectedNoteId ? state.notesById[state.selectedNoteId] : null;

  // Track edit mode locally: view vs editor
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    // If selection changes, default to view mode
    setEditMode(false);
  }, [state.selectedNoteId]);

  // Selection handler from list
  const handleSelectNote = useCallback(
    (id) => {
      actions.selectNote(id);
      setEditMode(false);
    },
    [actions]
  );

  // Save handler from NoteEditor: optimistic update then persist
  const handleSaveNote = useCallback(
    async (id, updates) => {
      try {
        // optimistic update
        actions.updateNote(id, updates);
        setEditMode(false);
        actions.setError(null);
        // persist
        await notesApi.updateNote(id, updates);
      } catch (e) {
        // surface error inline via context
        actions.setError(e?.message || 'Failed to save note');
      }
    },
    [actions]
  );

  // Delete with confirmation and selection fallback handled by reducer
  const handleDeleteNote = useCallback(
    async (id) => {
      const confirmed = window.confirm('Delete this note? This action cannot be undone.');
      if (!confirmed) return;
      try {
        // Optimistic remove
        actions.deleteNote(id);
        actions.setError(null);
        await notesApi.deleteNote(id);
      } catch (e) {
        actions.setError(e?.message || 'Failed to delete note');
      }
    },
    [actions]
  );

  // Start editing current note
  const handleEdit = useCallback(() => {
    if (currentNote) setEditMode(true);
  }, [currentNote]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
  }, []);

  return (
    <div className={`app-shell ocean-gradient`}>
      {/* Header with app title, search (wired inside) and theme toggle */}
      <Header onToggleTheme={toggleTheme} currentTheme={theme} />

      {/* Content area with sidebar and main pane */}
      <div className="app-content">
        <Sidebar />
        <main className="app-main" role="main" aria-label="Main content area" aria-busy={state.loading ? 'true' : 'false'}>
          {/* Inline error surface */}
          {state.error ? (
            <div
              role="alert"
              className="mb-2"
              style={{
                color: 'white',
                background: 'var(--color-error)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {state.error}
            </div>
          ) : null}

          {/* When there are notes or query, show list and view/editor; otherwise friendly empty state */}
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <section aria-label="Notes list panel">
              <NotesList
                notes={notesArray}
                selectedId={state.selectedNoteId}
                onSelect={handleSelectNote}
                searchable={true}
                searchQuery={state.query}
                onSearch={(val) => dispatch({ type: NotesActionTypes.SET_SEARCH_QUERY, payload: { query: val } })}
                onClearSearch={() => dispatch({ type: NotesActionTypes.SET_SEARCH_QUERY, payload: { query: '' } })}
                emptyMessage="No notes yet. Use “New Note” to create your first note."
                notFoundMessage="No notes match your search."
              />
            </section>

            <section aria-label="Note detail panel">
              {!editMode ? (
                <NoteView note={currentNote} onEdit={() => handleEdit()} />
              ) : (
                <NoteEditor
                  note={currentNote}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                  onDelete={handleDeleteNote}
                />
              )}
            </section>
          </div>

          <small className="text-muted">Ocean theme is active. Current theme: {theme}</small>
        </main>
      </div>
    </div>
  );
}

export default App;
