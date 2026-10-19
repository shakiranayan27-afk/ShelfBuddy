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

const ALLERGIES_KEY = "shelfbuddy.allergies";

/**
 * Load the saved allergy selections.
 * @returns {{ list: string[], other: string }}
 */
export function loadAllergies() {
  try {
    const raw = localStorage.getItem(ALLERGIES_KEY);
    if (!raw) return { list: [], other: "" };
    const parsed = JSON.parse(raw);
    return {
      list: Array.isArray(parsed.list) ? parsed.list : [],
      other: typeof parsed.other === "string" ? parsed.other : "",
    };
  } catch {
    return { list: [], other: "" };
  }
}

/**
 * Save the allergy selections.
 * @param {{ list: string[], other: string }} allergies
 */
export function saveAllergies(allergies) {
  try {
    localStorage.setItem(ALLERGIES_KEY, JSON.stringify(allergies));
  } catch {
    // ignore
  }
}

const PROFILE_KEY = "shelfbuddy.profile";

// Default local profile. This is NOT an account — just a display name and an
// optional photo (data URL) stored locally, like every other preference.
export const DEFAULT_PROFILE = { name: "", photo: "" };

/**
 * Load the local profile (display name + optional photo data URL).
 * @returns {{ name: string, photo: string }}
 */
export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      photo: typeof parsed.photo === "string" ? parsed.photo : "",
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Save the local profile.
 * @param {{ name: string, photo: string }} profile
 */
export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage may be full (photos can be large) or blocked; ignore for MVP.
  }
}

const TOUR_SEEN_KEY = "shelfbuddy.tourSeen";

/**
 * Has the user already seen (completed or skipped) the onboarding tour?
 * @returns {boolean}
 */
export function loadTourSeen() {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === "true";
  } catch {
    // If storage is unavailable, treat as seen so we never trap the user.
    return true;
  }
}

/**
 * Mark the onboarding tour as seen.
 */
export function saveTourSeen() {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "true");
  } catch {
    // ignore
  }
}
