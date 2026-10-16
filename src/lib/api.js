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

// --- Quick Add from Photo ---

// Client-side guards (mirrored on the backend as the source of truth).
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Read a File into a base64 string (without the "data:...;base64," prefix).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Detect visible foods from a photo via our backend. Each result has a name,
 * an expiryDate ("" unless clearly printed), a packSize ("" unless clearly
 * printed), and a looseCount ("" unless a countable loose item). The user
 * reviews/confirms before an item is added; detected hints never auto-fill
 * the quantity field.
 *
 * @param {File} file an image file
 * @returns {Promise<Array<{ name: string, expiryDate: string, packSize: string, looseCount: string }>>}
 * @throws {Error} with a friendly .message on any failure
 */
export async function detectFoodFromImage(file) {
  if (!file) {
    throw new Error("Please choose a photo first.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use a JPEG, PNG, or WebP photo.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("That image is too large. Please use a photo under 5 MB.");
  }

  const imageBase64 = await fileToBase64(file);

  let res;
  try {
    res = await fetch("/api/detect-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType: file.type }),
    });
  } catch {
    throw new Error("Couldn't reach the photo service. Please try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && data.message) || "Couldn't analyse the photo. Please try again.";
    throw new Error(message);
  }

  if (!data || !Array.isArray(data.foods)) {
    throw new Error("Couldn't read foods from that photo. Try another, or add manually.");
  }

  // Normalise to objects, tolerating a bare-string shape and missing fields.
  return data.foods.map((f) =>
    typeof f === "string"
      ? { name: f, expiryDate: "", packSize: "", looseCount: "" }
      : {
          name: String(f?.name ?? ""),
          expiryDate: String(f?.expiryDate ?? ""),
          packSize: String(f?.packSize ?? ""),
          looseCount: String(f?.looseCount ?? ""),
        }
  );
}
