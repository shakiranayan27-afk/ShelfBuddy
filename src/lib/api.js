// Frontend API helper for the Rescue Meal feature.
//
// Talks ONLY to our own backend at /api/rescue-meal (proxied to the Express
// server in dev via vite.config.js). The Gemini API key lives server-side
// and is never referenced here.

import { classify, STATUS } from "./expiry.js";

/**
 * Remove expired items on the frontend before sending.
 * The backend independently re-checks and removes expired items too;
 * this is the first of the two safety filters.
 *
 * @param {Array} items pantry items
 * @returns {Array} items that are not expired
 */
export function filterOutExpired(items) {
  return items.filter((item) => classify(item) !== STATUS.EXPIRED);
}

/**
 * Request an AI Rescue Meal for the current pantry + preference.
 *
 * @param {Array} pantry pantry items ({ name, expiryDate, quantity? })
 * @param {string} preference dietary preference key
 * @returns {Promise<object>} the recipe object (7 structured fields)
 * @throws {Error} with a friendly .message on any failure
 */
export async function generateRescueMeal(pantry, preference) {
  // Safety filter #1: never send expired items to the backend.
  const usablePantry = filterOutExpired(pantry).map((item) => ({
    name: item.name,
    expiryDate: item.expiryDate, // backend re-checks expiry independently
    quantity: item.quantity || "",
  }));

  let res;
  try {
    res = await fetch("/api/rescue-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pantry: usablePantry, preference }),
    });
  } catch {
    // Network / server unreachable.
    throw new Error("Couldn't reach the recipe service. Please try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Prefer the backend's friendly message; fall back to a generic one.
    const message =
      (data && data.message) || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  if (!data || !data.recipe) {
    throw new Error("The recipe came back in an unexpected format. Try again.");
  }

  return data.recipe;
}
