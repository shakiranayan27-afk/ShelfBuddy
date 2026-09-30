// localStorage persistence for ShelfBuddy.
// Keeps pantry items and the dietary preference between page reloads.
// No database — deliberately simple for this MVP.

const PANTRY_KEY = "shelfbuddy.pantry";
const PREFERENCE_KEY = "shelfbuddy.preference";

// Default dietary preference when none is stored yet.
export const DEFAULT_PREFERENCE = "none";

/**
 * Load the saved pantry items.
 * @returns {Array} array of pantry items (empty if none / on error)
 */
export function loadPantry() {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or unavailable storage — fail safe with an empty pantry.
    return [];
  }
}

/**
 * Save the pantry items.
 * @param {Array} items
 */
export function savePantry(items) {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch {
    // Storage may be full or blocked; ignore for this MVP.
  }
}

/**
 * Load the saved dietary preference.
 * @returns {string}
 */
export function loadPreference() {
  try {
    return localStorage.getItem(PREFERENCE_KEY) || DEFAULT_PREFERENCE;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

/**
 * Save the dietary preference.
 * @param {string} preference
 */
export function savePreference(preference) {
  try {
    localStorage.setItem(PREFERENCE_KEY, preference);
  } catch {
    // ignore
  }
}
