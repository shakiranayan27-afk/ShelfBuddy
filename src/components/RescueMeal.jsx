import { useState } from "react";
import RecipeCard from "./RecipeCard.jsx";
import { generateRescueMeal, filterOutExpired } from "../lib/api.js";

// "Rescue Meal" section: a Generate button plus idle / loading / success /
// error / empty states. Uses the current pantry and dietary preference.
export default function RescueMeal({ pantry, preference }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Do we have any non-expired items to cook with?
  const usableCount = filterOutExpired(pantry).length;
  const hasUsableItems = usableCount > 0;

  async function handleGenerate() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await generateRescueMeal(pantry, preference);
      setRecipe(result);
      setStatus("success");
    } catch (e) {
      setErrorMessage(e.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="card">
      <h2>Smart Meal Suggestion</h2>
      <p className="section-sub">
        Generate an AI recipe that prioritises the ingredients you need to use soon.
      </p>

      {/* Empty / non-usable pantry state */}
      {!hasUsableItems ? (
        <p className="empty-state">
          Add some non-expired ingredients to your pantry first, then generate a Smart Meal Suggestion.
        </p>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Creating your Smart Meal Suggestion…"
              : "Generate Smart Meal Suggestion"}
          </button>

          {/* Loading state */}
          {status === "loading" && (
            <div className="rescue-loading" role="status">
              <span className="spinner" aria-hidden="true" />
              <span>Creating your Smart Meal Suggestion…</span>
            </div>
          )}

          {/* Error state with retry */}
          {status === "error" && (
            <div className="rescue-error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGenerate}
              >
                Try again
              </button>
            </div>
          )}

          {/* Success state */}
          {status === "success" && recipe && <RecipeCard recipe={recipe} />}
        </>
      )}
    </section>
  );
}
