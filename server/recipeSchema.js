// Single source of truth for the Rescue Meal recipe structure.
//
// - RECIPE_SCHEMA is the JSON schema we hand to Gemini (structured output),
//   built with the SDK's `Type` enum.
// - validateRecipe() is our own hand-written check. We do NOT blindly trust
//   the model: we re-verify the shape before returning it to the browser.

import { Type } from "@google/genai";

// Schema passed to Gemini via config.responseSchema. propertyOrdering keeps
// the generated JSON fields in a predictable order.
export const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING },
    whyRecommended: { type: Type.STRING },
    cookingTimeMinutes: { type: Type.INTEGER },
    servings: { type: Type.INTEGER },
    useSoonPrioritised: { type: Type.ARRAY, items: { type: Type.STRING } },
    pantryIngredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
    additionalIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    substitutions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "recipeName",
    "whyRecommended",
    "cookingTimeMinutes",
    "servings",
    "useSoonPrioritised",
    "pantryIngredientsUsed",
    "additionalIngredients",
    "instructions",
    "substitutions",
  ],
  propertyOrdering: [
    "recipeName",
    "whyRecommended",
    "cookingTimeMinutes",
    "servings",
    "useSoonPrioritised",
    "pantryIngredientsUsed",
    "additionalIngredients",
    "instructions",
    "substitutions",
  ],
};

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * Validate and normalise a parsed recipe object.
 * Throws an Error with a clear message if the shape is wrong.
 *
 * @param {any} data parsed JSON from the model
 * @returns {object} a clean Recipe object with all fields present
 */
export function validateRecipe(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Recipe is not an object.");
  }

  const requireString = (field) => {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      throw new Error(`Missing or empty field: ${field}`);
    }
    return data[field].trim();
  };

  const requireStringArray = (field) => {
    if (!isStringArray(data[field])) {
      throw new Error(`Field must be an array of strings: ${field}`);
    }
    return data[field];
  };

  // Strict whole-number-in-range check. No clamping: an out-of-range,
  // non-integer, non-finite, or missing value is rejected outright.
  const requireIntInRange = (field, min, max) => {
    const value = data[field];
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(`Field must be a whole number: ${field}`);
    }
    if (value < min || value > max) {
      throw new Error(`Field out of range (${min}-${max}): ${field}`);
    }
    return value;
  };

  const recipeName = requireString("recipeName");
  const whyRecommended = requireString("whyRecommended");
  const cookingTimeMinutes = requireIntInRange("cookingTimeMinutes", 1, 480);
  const servings = requireIntInRange("servings", 1, 20);
  const useSoonPrioritised = requireStringArray("useSoonPrioritised");
  const pantryIngredientsUsed = requireStringArray("pantryIngredientsUsed");
  const additionalIngredients = requireStringArray("additionalIngredients");
  const instructions = requireStringArray("instructions");
  const substitutions = requireStringArray("substitutions");

  if (instructions.length === 0) {
    throw new Error("Recipe has no instructions.");
  }

  return {
    recipeName,
    whyRecommended,
    cookingTimeMinutes,
    servings,
    useSoonPrioritised,
    pantryIngredientsUsed,
    additionalIngredients,
    instructions,
    substitutions,
  };
}
