//
// Notes API abstraction with REST-ready signatures, delegating to local storage for now.
// No external dependencies. All functions return Promises.
// Future: swap internals to call fetchJson for a backend without changing consumers.
//

import useLocalNotes from '../hooks/useLocalNotes';
import { toAppError } from './client';

/**
 * @typedef {Object} Note
 * @property {string} id Unique ID
 * @property {string} title Note title
 * @property {string} content Note content (markdown/plain)
 * @property {string} createdAt ISO timestamp when created
 * @property {string} updatedAt ISO timestamp when last updated
 */

// PUBLIC_INTERFACE
export function listNotes() {
  /**
   * List all notes (newest first).
   * Returns Promise<Note[]>
   */
  return useLocalNotes
    .listNotes()
    .catch((e) => Promise.reject(toAppError(e)));
}

// PUBLIC_INTERFACE
export function getNote(id) {
  /**
   * Get a single note by id.
   * @param {string} id Note ID
   * Returns Promise<Note|null>
   */
  return useLocalNotes
    .getNote(id)
    .catch((e) => Promise.reject(toAppError(e)));
}

// PUBLIC_INTERFACE
export function createNote(partial) {
  /**
   * Create a new note.
   * @param {{ title?: string, content?: string, id?: string }} [partial]
   * Returns Promise<Note>
   */
  return useLocalNotes
    .createNote(partial)
    .catch((e) => Promise.reject(toAppError(e)));
}

// PUBLIC_INTERFACE
export function updateNote(id, updates) {
  /**
   * Update an existing note by id.
   * @param {string} id
   * @param {{ title?: string, content?: string }} updates
   * Returns Promise<Note>
   */
  return useLocalNotes
    .updateNote(id, updates)
    .catch((e) => Promise.reject(toAppError(e)));
}

// PUBLIC_INTERFACE
export function deleteNote(id) {
  /**
   * Delete a note by id.
   * @param {string} id
   * Returns Promise<boolean> true if deleted, false if not found
   */
  return useLocalNotes
    .deleteNote(id)
    .catch((e) => Promise.reject(toAppError(e)));
}

const notesApi = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};

export default notesApi;
