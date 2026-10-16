// Prompt, schema, and validator for the "Quick Add from Photo" feature.
//
// The model identifies VISIBLE FOOD NAMES, and may ALSO:
//  - transcribe an expiry date ONLY when clearly printed on packaging,
//  - transcribe a package size ONLY when clearly printed (e.g. "1 L"),
//  - report a count ONLY for clearly countable loose items (e.g. "3 apples").
//
// It must NEVER estimate expiry, calculate shelf life, infer a date from the
// food type, judge whether food is safe to eat, or estimate how much remains
// in a container from its fill level (transparent, translucent, or opaque).
// Those remain human responsibilities in the app.

import { Type } from "@google/genai";

// Structured-output schema. All string fields are required by the schema but
// MUST be empty strings when the information is not clearly visible (Gemini
// structured output has no clean "optional", so blank-when-unknown is used).
//
//  - name:       common food name
//  - expiryDate: clearly printed expiry date as YYYY-MM-DD, else ""
//  - packSize:   clearly printed package size (e.g. "1 L", "500 g"), else ""
//  - looseCount: count of clearly countable LOOSE items (e.g. "3 apples"), else ""
export const FOOD_DETECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    foods: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
          packSize: { type: Type.STRING },
          looseCount: { type: Type.STRING },
        },
        required: ["name", "expiryDate", "packSize", "looseCount"],
        propertyOrdering: ["name", "expiryDate", "packSize", "looseCount"],
      },
    },
  },
  required: ["foods"],
  propertyOrdering: ["foods"],
};

// Upper bound on how many entries we keep, to keep the review list manageable.
const MAX_FOODS = 25;
// Guard on the length of free-text descriptive fields.
const MAX_FIELD_LEN = 40;

export const FOOD_DETECTION_PROMPT = `You are helping a household food app identify groceries in a photo.

TASK: List the food items that are clearly visible in the image, by their
common everyday name (for example: "Broccoli", "Milk", "Eggs", "Apple").
For each item, also provide expiryDate, packSize, and looseCount ONLY when the
information is clearly visible — otherwise leave the relevant field empty.

RULES:
1. Identify food items only. Ignore non-food objects, backgrounds, people,
   and brand names.
2. Use simple, common food names. One entry per distinct food item.
3. expiryDate: transcribe a date ONLY when it is clearly printed and legible
   on the packaging (for example next to "Best before", "Use by", or "Exp").
   Convert it to YYYY-MM-DD. Leave it "" when the date is missing, partial,
   ambiguous, smudged, or not clearly visible.
4. packSize: transcribe the package size ONLY when it is clearly printed on
   the packaging (for example "1 L", "500 g", "250 ml", "12 eggs"). Leave it
   "" when no size is clearly printed.
5. looseCount: for clearly countable LOOSE items that are NOT in packaging
   (for example a few apples on a counter), report the count as text like
   "3 apples". Leave it "" otherwise.
6. NEVER estimate or infer how much food or drink REMAINS inside a container
   from its fill level. This applies to transparent, translucent, AND opaque
   containers. Do not guess remaining amounts under any circumstances.
7. For opaque containers, report nothing beyond clearly printed packaging text.
8. Do NOT estimate, calculate, or infer an expiry date from the type of food
   or its appearance. Do NOT calculate shelf life.
9. Do NOT comment on freshness, ripeness, or whether anything is safe to eat.
10. If you cannot clearly identify any food, return an empty list.

Return ONLY the structured JSON described by the response schema.`;

// Accept only a real YYYY-MM-DD that is a valid calendar date; otherwise "".
function sanitiseDate(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";
  const [y, m, d] = trimmed.split("-").map(Number);
  const dt = new Date(trimmed + "T00:00:00");
  if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) {
    return "";
  }
  return trimmed;
}

// Trim a short descriptive string and cap its length. No semantic parsing.
function sanitiseText(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_FIELD_LEN);
}

/**
 * Validate and normalise the model's detection output.
 * @param {any} data parsed JSON from the model
 * @returns {{ foods: Array<{ name, expiryDate, packSize, looseCount }> }}
 */
export function validateDetections(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.foods)) {
    throw new Error("Detection output is not in the expected shape.");
  }

  const seen = new Set();
  const foods = [];
  for (const raw of data.foods) {
    // Tolerate either an object or a bare string (defensive).
    const name = typeof raw === "string" ? raw.trim() : String(raw?.name ?? "").trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    foods.push({
      name,
      expiryDate: sanitiseDate(raw?.expiryDate),
      packSize: sanitiseText(raw?.packSize),
      looseCount: sanitiseText(raw?.looseCount),
    });

    if (foods.length >= MAX_FOODS) break;
  }

  return { foods };
}
