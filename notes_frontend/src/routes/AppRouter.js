import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNotesContext } from '../context/NotesContext';

/**
 * Minimal hash router for the Notes app.
 * Supports routes:
 *   - #/                 => no selection (list/empty state)
 *   - #/note/:id         => selects the note with :id
 *
 * Synchronizes the URL hash with NotesContext.selectedNoteId and vice versa.
 * No external dependencies. Keeps routing concerns isolated from components.
 */

// Route parsing helpers
function parseHash(hashString) {
  const raw = String(hashString || window.location.hash || '').trim();
  const hash = raw.startsWith('#') ? raw.slice(1) : raw;
  const path = hash || '/';

  // Normalize: ensure it starts with a slash
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // Match routes
  if (normalized === '/' || normalized === '') {
    return { route: '/', params: {} };
  }
  const noteMatch = normalized.match(/^\/note\/([^/?#]+)/);
  if (noteMatch) {
    return { route: '/note/:id', params: { id: decodeURIComponent(noteMatch[1]) } };
  }
  // Unknown route -> fallback to home
  return { route: '/', params: {} };
}

function buildHashForNote(id) {
  if (!id) return '#/';
  return `#/note/${encodeURIComponent(id)}`;
}

// PUBLIC_INTERFACE
export function useHashRouter() {
  /** Hook returning { route, params, navigate } for hash-based routing. */
  const [state, setState] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => setState(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('hashchange', handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  const navigate = useCallback((to) => {
    // Accept either a path string like '/note/123' or a full hash like '#/note/123'
    let target = String(to || '/');
    if (!target.startsWith('#')) {
      target = '#' + (target.startsWith('/') ? target.slice(1) : target);
    }
    if (window.location.hash !== target) {
      // Use assign to create a new entry without reloading
      window.location.hash = target.slice(1).startsWith('/') ? target : '#/';
    }
  }, []);

  return { ...state, navigate };
}

const RouterContext = createContext(undefined);

/**
 * RouterProvider manages synchronization between the URL hash and NotesContext selection.
 * Children can consume { route, params, selectedId, navigate } via useAppRouter.
 */
// PUBLIC_INTERFACE
export function RouterProvider({ children }) {
  const { state, actions } = useNotesContext();
  const { route, params, navigate } = useHashRouter();

  // When hash changes: update selected note in context to match route
  useEffect(() => {
    if (route === '/note/:id') {
      const id = params?.id || null;
      if (id && id !== state.selectedNoteId) {
        actions.selectNote(id);
      }
    } else if (route === '/') {
      if (state.selectedNoteId !== null) {
        // Home route signifies "no explicit selection from router"
        // Do not force deselection; keep current selection for UX.
        // However, if you want to strictly sync, uncomment:
        // actions.selectNote(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, params?.id]);

  // When selected note changes: update URL hash if necessary
  useEffect(() => {
    const desiredHash = buildHashForNote(state.selectedNoteId);
    if (window.location.hash !== desiredHash) {
      window.location.hash = desiredHash;
    }
  }, [state.selectedNoteId]);

  const value = useMemo(
    () => ({
      route,
      params,
      selectedId: state.selectedNoteId,
      navigate,
    }),
    [route, params, state.selectedNoteId, navigate]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppRouter() {
  /** Returns router info and navigation: { route, params, selectedId, navigate } */
  const ctx = useContext(RouterContext);
  if (ctx === undefined) {
    throw new Error('useAppRouter must be used within a RouterProvider');
  }
  return ctx;
}

export default {
  RouterProvider,
  useAppRouter,
};
