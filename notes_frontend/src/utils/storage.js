//
// Storage utilities for the Notes app.
// Provides safe get/set/remove for a namespaced collection in localStorage,
// with graceful handling of corrupt JSON and environments where localStorage
// is unavailable (fallback to in-memory).
//

const DEFAULT_NAMESPACE = 'nk_notes_v1';

// In-memory fallback store when localStorage is not available.
const memoryStore = (() => {
  let store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

/**
 * Resolve a storage backend that mimics localStorage's API.
 * If window.localStorage is unavailable (SSR, private mode issues, etc.),
 * returns an in-memory store.
 */
function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Basic write/read test to detect Safari private mode or blocked storage
      const testKey = '__nk_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch (_e) {
    // ignore and fallback to memory store
  }
  return memoryStore;
}

const storage = getStorage();

/**
 * Safely parse JSON, returning a fallback value when parsing fails.
 * @param {string|null} value Raw JSON string or null
 * @param {*} fallback Fallback value when parsing fails
 * @returns {*}
 */
function safeParse(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch (_e) {
    return fallback;
  }
}

/**
 * Safely stringify data to JSON, returning null on failure.
 * @param {*} data Data to stringify
 * @returns {string|null}
 */
function safeStringify(data) {
  try {
    return JSON.stringify(data);
  } catch (_e) {
    return null;
  }
}

/**
 * Build the fully qualified key for the namespace.
 * @param {string} [namespace]
 * @returns {string}
 */
function nsKey(namespace) {
  return String(namespace || DEFAULT_NAMESPACE);
}

// PUBLIC_INTERFACE
export function getItem(key, namespace = DEFAULT_NAMESPACE) {
  /** Retrieve a single item inside the namespaced collection by key. Gracefully returns null if missing or invalid. */
  const root = safeParse(storage.getItem(nsKey(namespace)), {});
  if (root && typeof root === 'object' && Object.prototype.hasOwnProperty.call(root, key)) {
    return root[key];
  }
  return null;
}

// PUBLIC_INTERFACE
export function setItem(key, value, namespace = DEFAULT_NAMESPACE) {
  /** Set a single item inside the namespaced collection. Overwrites existing key. No-ops if serialization fails. */
  const root = safeParse(storage.getItem(nsKey(namespace)), {});
  const next = { ...(root && typeof root === 'object' ? root : {}), [key]: value };
  const serialized = safeStringify(next);
  if (serialized != null) {
    storage.setItem(nsKey(namespace), serialized);
  }
}

// PUBLIC_INTERFACE
export function removeItem(key, namespace = DEFAULT_NAMESPACE) {
  /** Remove a single item from the namespaced collection by key. Safe if missing. */
  const root = safeParse(storage.getItem(nsKey(namespace)), {});
  if (!root || typeof root !== 'object') return;
  if (!Object.prototype.hasOwnProperty.call(root, key)) return;
  const { [key]: _omit, ...rest } = root;
  const serialized = safeStringify(rest);
  if (serialized != null) {
    storage.setItem(nsKey(namespace), serialized);
  }
}

// PUBLIC_INTERFACE
export function getAll(namespace = DEFAULT_NAMESPACE) {
  /** Get the entire notes collection object from storage. Returns an object map. */
  const root = safeParse(storage.getItem(nsKey(namespace)), {});
  if (root && typeof root === 'object') return root;
  return {};
}

// PUBLIC_INTERFACE
export function setAll(collection, namespace = DEFAULT_NAMESPACE) {
  /** Replace the entire notes collection object in storage. No-ops if invalid or serialization fails. */
  const data = collection && typeof collection === 'object' ? collection : {};
  const serialized = safeStringify(data);
  if (serialized != null) {
    storage.setItem(nsKey(namespace), serialized);
  }
}

export default {
  getItem,
  setItem,
  removeItem,
  getAll,
  setAll,
};
