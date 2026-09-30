// Server-side safety helpers for ShelfBuddy.
//
// These enforce the responsible-AI rules independently of the frontend.
// Even though the browser already filters expired items before sending,
// the backend re-verifies here as defence in depth so expired food can
// NEVER reach the AI model.
//
// Note: this module is ready for Stage 2. It is not wired into any AI
// call yet because the AI endpoint has not been implemented.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Whole days from today until an ISO expiry date, compared at midnight.
 * Mirrors the frontend logic so both sides agree.
 * @param {string} expiryDate "YYYY-MM-DD"
 * @returns {number}
 */
export function daysUntilExpiry(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY);
}

/**
 * Remove expired items from an incoming pantry payload.
 * Each item is expected to include an `expiryDate` so the backend can
 * verify expiry independently (per the agreed contract for Stage 2).
 *
 * @param {Array<{ name: string, expiryDate: string }>} items
 * @returns {Array} only non-expired items
 */
export function removeExpired(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    if (!item || !item.expiryDate) return false;
    return daysUntilExpiry(item.expiryDate) >= 0;
  });
}
