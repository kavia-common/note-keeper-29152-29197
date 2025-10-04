import React, { createContext, useContext, useMemo, useReducer } from 'react';

/**
 * NotesContext centralizes state for notes across the application.
 * It exposes:
 * - state: { notesById, order, selectedNoteId, loading, error, query }
 * - dispatch: reducer dispatch for internal actions
 * - actions: bound action creators for convenience in components
 *
 * State shape:
 * {
 *   notesById: { [id: string]: { id, title, content, createdAt, updatedAt } },
 *   order: string[], // ordered array of note ids (newest-first by default)
 *   selectedNoteId: string | null,
 *   loading: boolean,
 *   error: string | null,
 *   query: string
 * }
 */

// Action types
export const NotesActionTypes = {
  INIT_LOAD: 'INIT_LOAD',
  SELECT_NOTE: 'SELECT_NOTE',
  CREATE_NOTE: 'CREATE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Initial state
export const initialState = {
  notesById: {},
  order: [],
  selectedNoteId: null,
  loading: false,
  error: null,
  query: '',
};

// Utility: ensure immutable array insert for newest-first ordering
function insertAtBeginningUnique(arr, id) {
  if (arr[0] === id) return arr;
  const next = arr.filter((x) => x !== id);
  next.unshift(id);
  return next;
}

// Utility: remove from array immutably
function removeFromArray(arr, id) {
  return arr.filter((x) => x !== id);
}

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case NotesActionTypes.INIT_LOAD: {
      const { notes } = action.payload || { notes: [] };
      // Normalize notes to notesById and order (newest first by updatedAt or createdAt)
      const sorted = [...notes].sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      const notesById = {};
      const order = [];
      for (const n of sorted) {
        notesById[n.id] = n;
        order.push(n.id);
      }
      return {
        ...state,
        notesById,
        order,
        loading: false,
        error: null,
        // If available, keep current selection if it still exists
        selectedNoteId: state.selectedNoteId && notesById[state.selectedNoteId] ? state.selectedNoteId : (order[0] || null),
      };
    }

    case NotesActionTypes.SELECT_NOTE: {
      const { id } = action.payload;
      return {
        ...state,
        selectedNoteId: id ?? null,
      };
    }

    case NotesActionTypes.CREATE_NOTE: {
      const { note } = action.payload;
      if (!note || !note.id) return state;

      const now = new Date().toISOString();
      const newNote = {
        createdAt: now,
        updatedAt: now,
        title: '',
        content: '',
        ...note,
      };
      return {
        ...state,
        notesById: {
          ...state.notesById,
          [newNote.id]: newNote,
        },
        order: insertAtBeginningUnique(state.order, newNote.id),
        selectedNoteId: newNote.id,
        error: null,
      };
    }

    case NotesActionTypes.UPDATE_NOTE: {
      const { id, updates } = action.payload;
      const existing = state.notesById[id];
      if (!existing) return state;
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Keep updated note at the top
      return {
        ...state,
        notesById: {
          ...state.notesById,
          [id]: updated,
        },
        order: insertAtBeginningUnique(state.order, id),
        error: null,
      };
    }

    case NotesActionTypes.DELETE_NOTE: {
      const { id } = action.payload;
      if (!state.notesById[id]) return state;

      const { [id]: _, ...rest } = state.notesById;
      const nextOrder = removeFromArray(state.order, id);

      // Adjust selection if the deleted note was selected
      let nextSelected = state.selectedNoteId;
      if (state.selectedNoteId === id) {
        nextSelected = nextOrder[0] || null;
      }

      return {
        ...state,
        notesById: rest,
        order: nextOrder,
        selectedNoteId: nextSelected,
        error: null,
      };
    }

    case NotesActionTypes.SET_SEARCH_QUERY: {
      const { query } = action.payload;
      return {
        ...state,
        query: query ?? '',
      };
    }

    case NotesActionTypes.SET_LOADING: {
      const { loading } = action.payload;
      return {
        ...state,
        loading: Boolean(loading),
      };
    }

    case NotesActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return {
        ...state,
        error: error ?? null,
      };
    }

    default:
      return state;
  }
}

// Contexts
const NotesStateContext = createContext(undefined);
const NotesDispatchContext = createContext(undefined);
const NotesActionsContext = createContext(undefined);

/**
 * Bind action creators to dispatch for convenient use in components.
 */
function createBoundActions(dispatch) {
  return {
    initLoad: (notes) =>
      dispatch({ type: NotesActionTypes.INIT_LOAD, payload: { notes } }),
    selectNote: (id) =>
      dispatch({ type: NotesActionTypes.SELECT_NOTE, payload: { id } }),
    createNote: (note) =>
      dispatch({ type: NotesActionTypes.CREATE_NOTE, payload: { note } }),
    updateNote: (id, updates) =>
      dispatch({ type: NotesActionTypes.UPDATE_NOTE, payload: { id, updates } }),
    deleteNote: (id) =>
      dispatch({ type: NotesActionTypes.DELETE_NOTE, payload: { id } }),
    setSearchQuery: (query) =>
      dispatch({ type: NotesActionTypes.SET_SEARCH_QUERY, payload: { query } }),
    setLoading: (loading) =>
      dispatch({ type: NotesActionTypes.SET_LOADING, payload: { loading } }),
    setError: (error) =>
      dispatch({ type: NotesActionTypes.SET_ERROR, payload: { error } }),
  };
}

/**
 * NotesProvider wraps children and provides state, dispatch, and actions.
 */
// PUBLIC_INTERFACE
export function NotesProvider({ children, initial = initialState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const actions = useMemo(() => createBoundActions(dispatch), [dispatch]);
  return (
    <NotesStateContext.Provider value={state}>
      <NotesDispatchContext.Provider value={dispatch}>
        <NotesActionsContext.Provider value={actions}>
          {children}
        </NotesActionsContext.Provider>
      </NotesDispatchContext.Provider>
    </NotesStateContext.Provider>
  );
}

/**
 * Typed hooks for accessing the notes context.
 */
// PUBLIC_INTERFACE
export function useNotesState() {
  /** Returns the current global notes state. */
  const ctx = useContext(NotesStateContext);
  if (ctx === undefined) {
    throw new Error('useNotesState must be used within a NotesProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useNotesDispatch() {
  /** Returns the reducer dispatch for notes actions. */
  const ctx = useContext(NotesDispatchContext);
  if (ctx === undefined) {
    throw new Error('useNotesDispatch must be used within a NotesProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useNotesActions() {
  /** Returns bound action creators for notes operations. */
  const ctx = useContext(NotesActionsContext);
  if (ctx === undefined) {
    throw new Error('useNotesActions must be used within a NotesProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useNotesContext() {
  /**
   * Convenience hook combining state and actions.
   * Returns: { state, actions, dispatch }
   */
  const state = useNotesState();
  const actions = useNotesActions();
  const dispatch = useNotesDispatch();
  return { state, actions, dispatch };
}
