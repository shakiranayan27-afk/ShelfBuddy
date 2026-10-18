// Quantity parsing, unit normalisation, safe conversion, and pantry-deduction
// calculation for the post-cooking update flow.
//
// Safety rules enforced here:
//  - Only within-dimension conversion (kg<->g, L<->ml). Never mass<->volume.
//  - Blank/vague/unparseable pantry quantities => needs manual review.
//  - used > available => needs manual review (never auto "used up").
//  - used === available => "used up".
//  - used < available => propose the calculated remainder (no negatives).
//  - No density assumptions, no guessing.

// Unit -> { dimension, toBase } where base is g (mass), ml (volume), or count.
const UNIT_INFO = {
  g: { dimension: "mass", toBase: 1 },
  kg: { dimension: "mass", toBase: 1000 },
  ml: { dimension: "volume", toBase: 1 },
  L: { dimension: "volume", toBase: 1000 },
  count: { dimension: "count", toBase: 1 },
};

// Normalise a unit token to a canonical allowed unit, or null.
export function normaliseUnit(raw) {
  if (typeof raw !== "string") return null;
  const u = raw.trim().toLowerCase();
  if (u === "g") return "g";
  if (u === "kg") return "kg";
  if (u === "ml") return "ml";
  if (u === "l") return "L";
  if (u === "count" || u === "") return "count"; // bare handled by caller
  return null;
}

/**
 * Parse a free-text pantry quantity string into a structured value.
 * Examples: "500ml" -> {amount:500, unit:"ml", dimension:"volume", base:500}
 *           "1.5 kg" -> {amount:1.5, unit:"kg", dimension:"mass", base:1500}
 *           "6"      -> {amount:6, unit:"count", dimension:"count", base:6}
 * Returns null for blank / vague / unparseable input (e.g. "a splash").
 *
 * @param {string|undefined} raw
 * @returns {{amount:number, unit:string, dimension:string, base:number}|null}
 */
export function parseQuantity(raw) {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (text === "") return null;

  // Leading number (int/decimal) optionally followed by a unit token.
  const m = text.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);
  if (!m) return null;

  const amount = parseFloat(m[1]);
  if (!Number.isFinite(amount) || amount < 0) return null;

  const unitToken = m[2].toLowerCase();
  let unit;
  if (unitToken === "") {
    unit = "count"; // a bare number means a count of items
  } else if (unitToken === "g") {
    unit = "g";
  } else if (unitToken === "kg") {
    unit = "kg";
  } else if (unitToken === "ml") {
    unit = "ml";
  } else if (unitToken === "l") {
    unit = "L";
  } else if (unitToken === "count") {
    unit = "count";
  } else {
    // Unknown unit token (e.g. "packs", "slices") -> not safely parseable.
    return null;
  }

  const info = UNIT_INFO[unit];
  if (!info) return null;

  return {
    amount,
    unit,
    dimension: info.dimension,
    base: amount * info.toBase,
  };
}

/**
 * Convert an {amount, unit} into base units of its dimension.
 * @returns {{dimension:string, base:number}|null}
 */
export function toBase(amount, unit) {
  const info = UNIT_INFO[unit];
  if (!info || typeof amount !== "number" || !Number.isFinite(amount)) return null;
  return { dimension: info.dimension, base: amount * info.toBase };
}

/**
 * Format a numeric amount to at most 2 decimals, trimming trailing zeros.
 * @param {number} n
 * @returns {string}
 */
export function formatAmount(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  // toFixed then strip trailing zeros and any dangling dot.
  return rounded
    .toFixed(2)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
}

/**
 * Compute the proposed pantry change for one matched ingredient.
 *
 * @param {string|undefined} pantryQuantity the pantry item's quantity string
 * @param {number} usedAmount recipe amount used
 * @param {string} usedUnit recipe unit (already one of the allowed units)
 * @returns {{
 *   status: "deduct"|"used-up"|"review",
 *   reason?: string,
 *   remainingAmount?: number,  // in the pantry item's original unit
 *   remainingUnit?: string,
 *   remainingLabel?: string
 * }}
 */
export function computeDeduction(pantryQuantity, usedAmount, usedUnit) {
  const pantry = parseQuantity(pantryQuantity);

  // Pantry quantity missing / vague / unparseable -> manual review.
  if (!pantry) {
    return { status: "review", reason: "no-parse" };
  }

  const used = toBase(usedAmount, usedUnit);
  if (!used) {
    return { status: "review", reason: "bad-used" };
  }

  // Different dimensions (e.g. recipe ml vs pantry g) -> never guess.
  if (used.dimension !== pantry.dimension) {
    return { status: "review", reason: "dimension-mismatch" };
  }

  const EPS = 1e-9;
  const usedBase = used.base;
  const availBase = pantry.base;

  // Recipe needs MORE than recorded -> manual review (never auto used-up).
  if (usedBase > availBase + EPS) {
    return { status: "review", reason: "overdraw" };
  }

  // Exactly equal -> used up.
  if (Math.abs(usedBase - availBase) <= EPS) {
    return { status: "used-up" };
  }

  // used < available -> remainder, expressed in the pantry's ORIGINAL unit.
  const remainingBase = availBase - usedBase;
  const originalFactor = UNIT_INFO[pantry.unit].toBase;
  const remainingInOriginal = remainingBase / originalFactor;

  return {
    status: "deduct",
    remainingAmount: remainingInOriginal,
    remainingUnit: pantry.unit,
    remainingLabel: `${formatAmount(remainingInOriginal)}${
      pantry.unit === "count" ? "" : " " + pantry.unit
    }`,
  };
}
