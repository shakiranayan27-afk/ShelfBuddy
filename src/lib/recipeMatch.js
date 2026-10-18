// Conservative matching between a recipe's `pantryIngredientsUsed` strings and
// the actual pantry items. No fuzzy/AI matching and no substring guessing.
//
// The AI may append a trailing parenthetical quantity, e.g. "Eggs (6)" or
// "Cheddar Cheese (300g)", while pantry names are plain ("Eggs"). We strip a
// single trailing parenthetical, trim, and compare case-insensitively.

import { classify, STATUS } from "./expiry.js";

/**
 * Normalise a name for comparison: strip ONE trailing "(...)", trim, lowercase.
 * @param {string} raw
 * @returns {string}
 */
export function normaliseName(raw) {
  if (typeof raw !== "string") return "";
  // Remove a single trailing parenthetical group (and surrounding spaces).
  const withoutParen = raw.replace(/\s*\([^()]*\)\s*$/, "");
  return withoutParen.trim().toLowerCase();
}

/**
 * Match non-expired pantry items to the recipe's structured used ingredients
 * ({ name, amount, unit }). Each real matched item is returned separately (so
 * duplicate names each appear), paired with the recipe amount/unit used.
 *
 * Matching is conservative: cleaned-name exact, case-insensitive. No fuzzy or
 * substring matching. Unmatched entries yield nothing.
 *
 * @param {Array<{id,name,expiryDate,quantity?}>} pantry
 * @param {Array<{name:string, amount:number, unit:string}>} pantryIngredientsUsed
 * @returns {Array<{ item: object, usedAmount: number, usedUnit: string }>}
 */
export function matchUsedPantryItems(pantry, pantryIngredientsUsed) {
  if (!Array.isArray(pantry) || !Array.isArray(pantryIngredientsUsed)) return [];

  // Map cleaned recipe name -> { amount, unit } (first occurrence wins).
  const usedByName = new Map();
  for (const entry of pantryIngredientsUsed) {
    if (!entry || typeof entry !== "object") continue;
    const key = normaliseName(entry.name);
    if (!key || usedByName.has(key)) continue;
    usedByName.set(key, { amount: entry.amount, unit: entry.unit });
  }
  if (usedByName.size === 0) return [];

  const results = [];
  for (const item of pantry) {
    // Only consider non-expired items (consistent with what the AI saw).
    if (classify(item) === STATUS.EXPIRED) continue;
    const used = usedByName.get(normaliseName(item.name));
    if (!used) continue;
    results.push({ item, usedAmount: used.amount, usedUnit: used.unit });
  }
  return results;
}
