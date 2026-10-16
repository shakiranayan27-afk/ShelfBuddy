// ShelfBuddy backend — minimal Express server.
//
// Stage 2A: implements the AI Rescue Meal endpoint using Google Gemini.
// The API key lives ONLY in server-side .env (loaded via dotenv) and never
// reaches the browser. Expired items are re-checked here as defence in depth.
//
// Run with: npm run server

import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { removeExpired, daysUntilExpiry } from "./safety.js";
import { buildPrompt } from "./promptBuilder.js";
import { callModel, callModelWithImage } from "./aiClient.js";
import { RECIPE_SCHEMA, validateRecipe } from "./recipeSchema.js";
import {
  FOOD_DETECTION_PROMPT,
  FOOD_DETECTION_SCHEMA,
  validateDetections,
} from "./foodVisionPrompt.js";

const app = express();
// Use the platform-provided port in production (e.g. Render); 3001 locally.
const PORT = process.env.PORT || 3001;

// Resolve paths relative to this file (works under ESM).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Items expiring within this many days (inclusive) are "Use Soon".
// Mirrors the frontend threshold so both sides agree.
const USE_SOON_THRESHOLD_DAYS = 3;

// Quick Add from Photo: max raw image size (5 MB) and allowed types.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// JSON body limit raised to 8 MB so a 5 MB image (base64 adds ~33%) fits.
app.use(express.json({ limit: "8mb" }));

// Simple health check so you can confirm the server is up.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", stage: "2A" });
});

// Rescue Meal endpoint.
//
// Request body: { pantry: [{ name, expiryDate, quantity? }], preference }
// Flow: re-filter expired -> split useSoon/fresh -> build prompt ->
//       call Gemini (structured output) -> validate -> return Recipe JSON.
app.post("/api/rescue-meal", async (req, res) => {
  const { pantry = [], preference = "none" } = req.body || {};

  // 1. Defence in depth: independently remove expired items using each
  //    item's expiryDate. Expired food is NEVER sent to the model.
  const safePantry = removeExpired(pantry);

  if (safePantry.length === 0) {
    return res.status(400).json({
      error: "EMPTY_PANTRY",
      message: "Add some non-expired ingredients first.",
    });
  }

  // 2. Split into Use Soon (<= 3 days) and Fresh so the prompt can prioritise.
  const useSoon = [];
  const fresh = [];
  for (const item of safePantry) {
    if (daysUntilExpiry(item.expiryDate) <= USE_SOON_THRESHOLD_DAYS) {
      useSoon.push(item);
    } else {
      fresh.push(item);
    }
  }

  // 3. Build the prompt (encodes all the responsible-AI rules).
  const prompt = buildPrompt(useSoon, fresh, preference);

  // 4. Call the model and 5. validate its output.
  try {
    const raw = await callModel(prompt, RECIPE_SCHEMA);
    const recipe = validateRecipe(raw);
    return res.json({ recipe });
  } catch (e) {
    if (e.code === "AI_NOT_CONFIGURED") {
      return res.status(500).json({
        error: "AI_NOT_CONFIGURED",
        message: "AI service is not configured. Check the server .env.",
      });
    }
    if (e.code === "AI_CALL_FAILED") {
      return res.status(502).json({
        error: "AI_CALL_FAILED",
        message: "Couldn't reach the recipe service. Please try again.",
      });
    }
    // AI_BAD_OUTPUT or a validation error
    return res.status(502).json({
      error: "AI_BAD_OUTPUT",
      message: "The recipe came back in an unexpected format. Try again.",
    });
  }
});

// Quick Add from Photo — detect visible food names in an uploaded image.
//
// Request body: { imageBase64: "<base64, no data: prefix>", mimeType }
// The image is held in memory for this request only and never written to
// disk or logged. Gemini returns food NAMES ONLY — never expiry or safety.
app.post("/api/detect-food", async (req, res) => {
  const { imageBase64, mimeType } = req.body || {};

  // Basic validation of the upload.
  if (typeof imageBase64 !== "string" || !imageBase64 || !mimeType) {
    return res.status(400).json({
      error: "BAD_IMAGE",
      message: "No image received. Please choose a photo and try again.",
    });
  }

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return res.status(400).json({
      error: "BAD_IMAGE_TYPE",
      message: "Unsupported image type. Use a JPEG, PNG, or WebP photo.",
    });
  }

  // Reject oversized images. base64 length * 3/4 ≈ raw byte size.
  const approxBytes = Math.floor((imageBase64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return res.status(413).json({
      error: "IMAGE_TOO_LARGE",
      message: "That image is too large. Please use a photo under 5 MB.",
    });
  }

  try {
    const raw = await callModelWithImage({
      textPrompt: FOOD_DETECTION_PROMPT,
      imageBase64,
      mimeType,
      schema: FOOD_DETECTION_SCHEMA,
    });
    const { foods } = validateDetections(raw);
    return res.json({ foods });
  } catch (e) {
    if (e.code === "AI_NOT_CONFIGURED") {
      return res.status(500).json({
        error: "AI_NOT_CONFIGURED",
        message: "AI service is not configured. Check the server .env.",
      });
    }
    if (e.code === "AI_CALL_FAILED") {
      return res.status(502).json({
        error: "AI_CALL_FAILED",
        message: "Couldn't analyse the photo. Please try again.",
      });
    }
    // AI_BAD_OUTPUT or a validation error
    return res.status(502).json({
      error: "AI_BAD_OUTPUT",
      message: "Couldn't read foods from that photo. Try another, or add manually.",
    });
  }
});

// --- Production static hosting (Render) ---
// In production the Express server also serves the built Vite frontend from
// /dist and provides an SPA fallback so any non-API route returns index.html.
// This block is skipped in local development, where Vite serves the frontend
// on its own port (npm run dev) and this server only handles /api/*.
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "..", "dist");

  // Serve the static built assets.
  app.use(express.static(distDir));

  // SPA fallback: for any GET that is not an /api route, return index.html.
  // Using a middleware (not a wildcard route) avoids Express 5 path parsing
  // issues and keeps all /api/* routes taking precedence above.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ShelfBuddy server listening on port ${PORT}`);
});
