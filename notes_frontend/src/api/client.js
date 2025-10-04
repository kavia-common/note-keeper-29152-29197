//
// Minimal API client wrapper with switchable local/remote mode.
// For now, default is "local" mode and fetchJson is a placeholder to preserve
// a future REST integration path without introducing external dependencies.
//

/**
 * @typedef {Object} ApiError
 * @property {string} message Human-readable error message
 * @property {number} [status] HTTP status code when applicable
 * @property {any} [data] Optional parsed response data or error body
 */

/**
 * Convert any caught error into a standardized ApiError.
 * This keeps UI and caller code stable, regardless of transport layer.
 */
// PUBLIC_INTERFACE
export function toAppError(err, overrides = {}) {
  /** Convert a thrown error into a standardized ApiError. */
  const base = {
    message: 'Unexpected error',
    status: undefined,
    data: undefined,
  };

  if (!err) return { ...base, ...overrides };

  // If it's already in our ApiErrorish shape, pass through with overrides.
  if (typeof err === 'object' && ('message' in err || 'status' in err || 'data' in err)) {
    return { ...base, ...err, ...overrides };
  }

  // Native Error instance
  if (err instanceof Error) {
    return { ...base, message: err.message || base.message, ...overrides };
  }

  // Fallback stringify
  try {
    return { ...base, message: String(err), ...overrides };
  } catch (_e) {
    return { ...base, ...overrides };
  }
}

// Mode control: when true, skip network and use local adapters.
// This can be wired to an env var or runtime flag later.
const USE_LOCAL = true;

/**
 * Fetch JSON helper that is REST-ready.
 * In local mode, this returns a rejected promise if accidentally called,
 * making it clear that the caller should use the local adapter instead.
 *
 * In remote mode (future), it will perform an actual fetch and return parsed JSON
 * while normalizing errors to ApiError.
 */
// PUBLIC_INTERFACE
export async function fetchJson(url, options = {}) {
  /** REST-ready JSON fetch helper. In local mode, rejects to prevent accidental network usage. */
  if (USE_LOCAL) {
    const err = toAppError(
      new Error('fetchJson called in local mode. Use local adapter instead.'),
      { status: 0 }
    );
    return Promise.reject(err);
  }

  // Future implementation for remote mode:
  // const res = await fetch(url, {
  //   headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  //   ...options,
  // });
  // const contentType = res.headers.get('content-type') || '';
  // let data;
  // if (contentType.includes('application/json')) {
  //   data = await res.json().catch(() => undefined);
  // } else {
  //   data = await res.text().catch(() => undefined);
  // }
  // if (!res.ok) {
  //   throw toAppError(new Error(`Request failed with ${res.status}`), { status: res.status, data });
  // }
  // return data;

  // For now (unreachable when USE_LOCAL === true), keep placeholder to satisfy lints.
  throw toAppError(new Error('Remote mode not implemented'), { status: 0 });
}

export default {
  fetchJson,
  toAppError,
};
