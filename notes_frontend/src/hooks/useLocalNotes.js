//
// Local notes storage hook-like utility.
// Provides localStorage-backed CRUD operations with optimistic updates,
// timestamps, basic validation, and Promise-based async-like API.
//
// Each note shape:
// { id, title, content, createdAt, updatedAt }
//
// Integration points:
// - Uses utils/storage: getAll, setAll
// - Uses utils/id: generateNoteId
//
// API surface is future compatible with a planned notesApi wrapper.
// All functions return Promises, resolving synchronously but allowing
// calling code to treat them as async operations.
//

import { getAll, setAll } from '../utils/storage';
import { generateNoteId } from '../utils/id';

const COLLECTION_KEY = 'notes'; // key within the namespaced storage blob

/**
 * Internal: safely load the notes map from storage.
 * Returns an object map { [id]: note } or {} when missing.
 */
function loadNotesMap() {
  const root = getAll();
  const map = root && typeof root === 'object' && root[COLLECTION_KEY] && typeof root[COLLECTION_KEY] === 'object'
    ? root[COLLECTION_KEY]
    : {};
  return { ...map }; // shallow copy to avoid accidental mutation
}

/**
 * Internal: persist the notes map back to storage.
 * Writes the full collection object with the COLLECTION_KEY nested.
 */
function saveNotesMap(map) {
  const root = getAll();
  const nextRoot = {
    ...(root && typeof root === 'object' ? root : {}),
    [COLLECTION_KEY]: { ...(map || {}) },
  };
  setAll(nextRoot);
}

/**
 * Internal: validate and normalize note fields.
 */
function normalizeNote(note) {
  if (!note || typeof note !== 'object') {
    throw new Error('Invalid note object.');
  }
  const id = String(note.id || '').trim();
  if (!id) throw new Error('Note must have a valid id.');

  const title = typeof note.title === 'string' ? note.title : '';
  const content = typeof note.content === 'string' ? note.content : '';
  const createdAt = note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = note.updatedAt ? new Date(note.updatedAt).toISOString() : createdAt;

  return { id, title, content, createdAt, updatedAt };
}

/**
 * Internal: create a new note with timestamps.
 */
function buildNewNote(partial = {}) {
  const id = String(partial.id || generateNoteId()).trim();
  const now = new Date().toISOString();
  return normalizeNote({
    id,
    title: typeof partial.title === 'string' ? partial.title : '',
    content: typeof partial.content === 'string' ? partial.content : '',
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Internal: apply updates to an existing note with updatedAt touch.
 */
function applyUpdates(existing, updates) {
  if (!existing) throw new Error('Cannot update non-existent note.');
  const merged = {
    ...existing,
    ...(updates && typeof updates === 'object' ? updates : {}),
    updatedAt: new Date().toISOString(),
  };
  return normalizeNote(merged);
}

/**
 * Internal: sort notes by updatedAt (desc), fallback to createdAt.
 */
function sortNotesByRecent(notesArr) {
  return [...notesArr].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

// PUBLIC_INTERFACE
export function listNotes() {
  /** Returns a Promise resolving to an array of notes, newest-first by updatedAt. */
  return Promise.resolve().then(() => {
    const map = loadNotesMap();
    const arr = Object.values(map).map((n) => normalizeNote(n));
    return sortNotesByRecent(arr);
  });
}

// PUBLIC_INTERFACE
export function getNote(id) {
  /** Returns a Promise resolving to a single note by id, or null if not found. */
  return Promise.resolve().then(() => {
    const safeId = String(id || '').trim();
    if (!safeId) return null;
    const map = loadNotesMap();
    const note = map[safeId];
    return note ? normalizeNote(note) : null;
  });
}

// PUBLIC_INTERFACE
export function createNote(partial = {}) {
  /**
   * Create a new note (id generated if not provided).
   * Updates storage immediately and resolves with the created note.
   */
  return Promise.resolve().then(() => {
    const map = loadNotesMap();
    const newNote = buildNewNote(partial);

    if (map[newNote.id]) {
      // Collision unlikely; regenerate once if happens
      const regen = buildNewNote({ ...partial, id: generateNoteId() });
      map[regen.id] = regen;
      saveNotesMap(map);
      return regen;
    }

    map[newNote.id] = newNote;
    saveNotesMap(map);
    return newNote;
  });
}

// PUBLIC_INTERFACE
export function updateNote(id, updates = {}) {
  /**
   * Update a note by id with partial updates to title/content.
   * Touches updatedAt. Updates storage immediately and resolves with updated note.
   * Rejects if note not found or validation fails.
   */
  return Promise.resolve().then(() => {
    const safeId = String(id || '').trim();
    if (!safeId) throw new Error('updateNote requires a valid id.');
    if (!updates || typeof updates !== 'object') throw new Error('updateNote requires an updates object.');

    const map = loadNotesMap();
    const existing = map[safeId];
    if (!existing) throw new Error('Note not found.');

    const updated = applyUpdates(existing, {
      title: typeof updates.title === 'string' ? updates.title : existing.title,
      content: typeof updates.content === 'string' ? updates.content : existing.content,
    });

    map[safeId] = updated;
    saveNotesMap(map);
    return updated;
  });
}

// PUBLIC_INTERFACE
export function deleteNote(id) {
  /**
   * Delete a note by id.
   * Updates storage immediately and resolves with true if deleted, false if not found.
   */
  return Promise.resolve().then(() => {
    const safeId = String(id || '').trim();
    if (!safeId) return false;
    const map = loadNotesMap();
    if (!map[safeId]) return false;
    const { [safeId]: _omit, ...rest } = map;
    saveNotesMap(rest);
    return true;
  });
}

// PUBLIC_INTERFACE
export function searchNotes(query = '') {
  /**
   * Case-insensitive search across title and content.
   * Returns Promise resolving to array of matching notes sorted by recency.
   */
  return Promise.resolve().then(() => {
    const q = String(query || '').toLowerCase().trim();
    const map = loadNotesMap();
    const arr = Object.values(map).map((n) => normalizeNote(n));

    if (!q) return sortNotesByRecent(arr);

    const filtered = arr.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
    return sortNotesByRecent(filtered);
  });
}

/**
 * Default export providing all functions together for convenience.
 */
const useLocalNotes = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
};

export default useLocalNotes;
