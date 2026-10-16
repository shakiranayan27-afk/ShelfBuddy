// Gemini client — the ONLY place the AI provider lives.
//
// Reads the API key from process.env (server-side only). The key is never
// logged and never sent to the browser. Swapping providers later means
// changing only this file.

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.AI_MODEL || "gemini-3.5-flash-lite";

// Lazily create the client so the server can still boot (and serve the
// friendly "not configured" error) even if the key is missing.
let client = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Deliberately vague — never reveal key material or its absence details.
    const err = new Error("AI_NOT_CONFIGURED");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Call Gemini with a prompt and a response schema, returning parsed JSON.
 *
 * @param {string} prompt      the prompt text
 * @param {object} schema      RECIPE_SCHEMA (Gemini structured-output schema)
 * @returns {Promise<object>}  parsed JSON object from the model
 * @throws  Error with .code = "AI_NOT_CONFIGURED" | "AI_CALL_FAILED" | "AI_BAD_OUTPUT"
 */
export async function callModel(prompt, schema) {
  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
  } catch (e) {
    // Log a message only — never the key or full request/config.
    console.error("Gemini call failed:", e?.message || "unknown error");
    const err = new Error("AI_CALL_FAILED");
    err.code = "AI_CALL_FAILED";
    throw err;
  }

  const text = response?.text;
  if (!text) {
    const err = new Error("AI_BAD_OUTPUT");
    err.code = "AI_BAD_OUTPUT";
    throw err;
  }

  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("AI_BAD_OUTPUT");
    err.code = "AI_BAD_OUTPUT";
    throw err;
  }
}

/**
 * Call Gemini with a text prompt AND an inline image, returning parsed JSON.
 * Used by the Quick Add from Photo feature. The image is sent inline (base64)
 * for this single request only — the SDK does not persist it.
 *
 * @param {object} args
 * @param {string} args.textPrompt   instruction text
 * @param {string} args.imageBase64  raw base64 image data (no data: prefix)
 * @param {string} args.mimeType     e.g. "image/jpeg"
 * @param {object} args.schema       structured-output response schema
 * @returns {Promise<object>}        parsed JSON object from the model
 * @throws  Error with .code = "AI_NOT_CONFIGURED" | "AI_CALL_FAILED" | "AI_BAD_OUTPUT"
 */
export async function callModelWithImage({ textPrompt, imageBase64, mimeType, schema }) {
  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { text: textPrompt },
        { inlineData: { mimeType, data: imageBase64 } },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
  } catch (e) {
    // Log a message only — never the key, prompt, or image data.
    console.error("Gemini image call failed:", e?.message || "unknown error");
    const err = new Error("AI_CALL_FAILED");
    err.code = "AI_CALL_FAILED";
    throw err;
  }

  const text = response?.text;
  if (!text) {
    const err = new Error("AI_BAD_OUTPUT");
    err.code = "AI_BAD_OUTPUT";
    throw err;
  }

  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("AI_BAD_OUTPUT");
    err.code = "AI_BAD_OUTPUT";
    throw err;
  }
}
