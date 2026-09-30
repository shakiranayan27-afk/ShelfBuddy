// Expiry logic for ShelfBuddy.
//
// All pure functions — no side effects — so classification is always
// computed fresh at display time and is easy to reason about and test.

// Expiry categories used across the app.
export const STATUS = {
  EXPIRED: "expired",
  USE_SOON: "use-soon",
  FRESH: "fresh",
};

// Items that expire within this many days (inclusive) are "Use Soon".
const USE_SOON_THRESHOLD_DAYS = 3;

/**
 * Whole days from today until the given expiry date.
 * Both dates are compared at local midnight so "today" is consistent
 * regardless of the current time of day.
 *
 * Returns a negative number if the date has already passed,
 * 0 if it expires today, positive if it is in the future.
 *
 * @param {string} expiryDate ISO date string "YYYY-MM-DD"
 * @returns {number} whole days until expiry
 */
export function daysUntilExpiry(expiryDate) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY);
}

/**
 * Classify an item as expired / use-soon / fresh.
 *
 *   days <  0            -> expired   (date already passed)
 *   0 <= days <= 3       -> use-soon  (expires within 3 days, includes today)
 *   days >  3            -> fresh      (more than 3 days remaining)
 *
 * @param {{ expiryDate: string }} item
 * @returns {string} one of STATUS.*
 */
export function classify(item) {
  const days = daysUntilExpiry(item.expiryDate);
  if (days < 0) return STATUS.EXPIRED;
  if (days <= USE_SOON_THRESHOLD_DAYS) return STATUS.USE_SOON;
  return STATUS.FRESH;
}

// Display order: Use Soon first, then Fresh, then Expired last.
const STATUS_ORDER = {
  [STATUS.USE_SOON]: 0,
  [STATUS.FRESH]: 1,
  [STATUS.EXPIRED]: 2,
};

/**
 * Sort items for display without mutating the input array.
 * Primary key: status group (Use Soon -> Fresh -> Expired).
 * Secondary key: soonest expiry first within each group.
 *
 * @param {Array<{ expiryDate: string }>} items
 * @returns {Array} a new sorted array
 */
export function sortItems(items) {
  return [...items].sort((a, b) => {
    const groupDiff = STATUS_ORDER[classify(a)] - STATUS_ORDER[classify(b)];
    if (groupDiff !== 0) return groupDiff;
    // within the same group, soonest expiry first
    return daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate);
  });
}

/**
 * Human-friendly label for a status, plus a short expiry description.
 * @param {{ expiryDate: string }} item
 */
export function describeExpiry(item) {
  const days = daysUntilExpiry(item.expiryDate);
  const status = classify(item);

  if (status === STATUS.EXPIRED) {
    const ago = Math.abs(days);
    return { status, label: "Expired", detail: ago === 1 ? "1 day ago" : `${ago} days ago` };
  }
  if (status === STATUS.USE_SOON) {
    let detail;
    if (days === 0) detail = "Expires today";
    else if (days === 1) detail = "Expires tomorrow";
    else detail = `Expires in ${days} days`;
    return { status, label: "Use Soon", detail };
  }
  return { status, label: "Fresh", detail: `Expires in ${days} days` };
}
