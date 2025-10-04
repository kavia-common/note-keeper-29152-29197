/* global BigInt */
//
// ID generation utilities.
// Provides a collision-resistant ID generator for notes using a timestamp
// and a random component. Attempts to use crypto.getRandomValues when available.
//
//

/**
 * Generate a random string using crypto if available, otherwise Math.random.
 * @param {number} bytes Number of random bytes (when crypto available)
 * @returns {string} base36-encoded random string
 */
function randomString(bytes = 8) {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(bytes);
      window.crypto.getRandomValues(arr);
      // Convert bytes to base36-ish by grouping into a hex string first then base36
      const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
      // Convert hex to a big int and then to base36 string; if BigInt unsupported, return hex
      if (typeof BigInt !== 'undefined') {
        const val = BigInt('0x' + hex);
        return val.toString(36);
      }
      return hex;
    }
  } catch (_e) {
    // fall back to Math.random below
  }
  // Fallback: combine multiple Math.random calls for length
  let acc = '';
  for (let i = 0; i < 3; i++) {
    acc += Math.random().toString(36).slice(2);
  }
  return acc.slice(0, 16);
}

// PUBLIC_INTERFACE
export function generateNoteId(prefix = 'note') {
  /** Generate a collision-resistant Note ID like 'note_<ts>_<rand>' using ms timestamp and random component. */
  const ts = Date.now(); // milliseconds since epoch
  const rand = randomString(10);
  return `${prefix}_${ts}_${rand}`;
}

export default { generateNoteId };
