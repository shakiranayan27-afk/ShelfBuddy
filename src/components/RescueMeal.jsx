import { useRef, useState } from "react";
import RecipeCard from "./RecipeCard.jsx";
import CookedUpdate from "./CookedUpdate.jsx";
import Icon from "./Icon.jsx";
import { filterOutExpired } from "../lib/api.js";
import { matchUsedPantryItems } from "../lib/recipeMatch.js";

// Smart Meal Suggestion — CONTROLS ONLY (servings + generate + loading/error).
// Lives in the right-side column on desktop. The generated recipe result and
// the post-cooking panel are rendered full-width by <RecipeResult/> so they
// can use the whole desktop width.
//
// Recipe/status state is owned by App so the result can render elsewhere in
// the layout. All generation logic is unchanged — it now lives in App's
// onGenerate handler.
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 8;

export default function RescueMeal({
  pantry,
  status,
  errorMessage,
  servings,
  onChangeServings,
  onGenerate,
}) {
  const hasUsableItems = filterOutExpired(pantry).length > 0;

  return (
    <section className="card rescue-card" data-tour="smart-meal">
      <h2 className="rescue-heading">
        <Icon name="sparkles" />
        Smart Meal Suggestion
      </h2>
      <p className="section-sub">
        Generate an AI recipe that prioritises the ingredients you need to use soon.
      </p>

      {!hasUsableItems ? (
        <p className="empty-state">
          Add some non-expired ingredients to your pantry first, then generate a Smart Meal Suggestion.
        </p>
      ) : (
        <>
          <div className="servings-control">
            <span className="servings-label">Servings</span>
            <div className="servings-stepper">
              <button
                type="button"
                className="servings-btn"
                onClick={() => onChangeServings(-1)}
                disabled={servings <= MIN_SERVINGS || status === "loading"}
                aria-label="Fewer servings"
              >
                <Icon name="minus" />
              </button>
              <span className="servings-value" aria-live="polite">
                {servings}
              </span>
              <button
                type="button"
                className="servings-btn"
                onClick={() => onChangeServings(1)}
                disabled={servings >= MAX_SERVINGS || status === "loading"}
                aria-label="More servings"
              >
                <Icon name="plus" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Creating your Smart Meal Suggestion…"
              : "Generate Smart Meal Suggestion"}
          </button>

          {status === "loading" && (
            <div className="rescue-loading" role="status">
              <span className="spinner" aria-hidden="true" />
              <span>Creating your Smart Meal Suggestion…</span>
            </div>
          )}

          {status === "error" && (
            <div className="rescue-error" role="alert">
              <p>{errorMessage}</p>
              <button type="button" className="btn btn-secondary" onClick={onGenerate}>
                Try again
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// Full-width result area: the recipe card, a "Generate another recipe"
// action, plus the post-cooking update panel. Rendered beneath the
// two-column workspace when a recipe exists.
//
// When the user starts the post-cooking flow, the recipe card + regenerate
// action collapse so only the deduction review shows; the recipe data is still
// held by the parent so calculations work. Cancel restores the recipe;
// confirm calls onCooked() to clear everything and return to the pantry.
export function RecipeResult({ recipe, pantry, onUpdate, onDelete, onRegenerate, onCooked }) {
  const [cooking, setCooking] = useState(false);
  const cookedRef = useRef(null);
  if (!recipe) return null;

  // Only offer "I cooked this" when the recipe actually uses pantry items we
  // can act on (same conservative matching the update flow uses).
  const canCook =
    matchUsedPantryItems(pantry, recipe.pantryIngredientsUsed).length > 0;

  return (
    <div className="recipe-result">
      {!cooking && (
        <>
          <RecipeCard recipe={recipe} />

          {/* Grouped action bar directly below the result: the cook action is
              the primary, regenerate is the secondary outlined action. */}
          <div className="recipe-actions">
            {canCook && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => cookedRef.current && cookedRef.current.start()}
              >
                I cooked this · Update pantry
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onRegenerate}>
              Generate another recipe
            </button>
          </div>
        </>
      )}
      <CookedUpdate
        ref={cookedRef}
        recipe={recipe}
        pantry={pantry}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onOpenChange={setCooking}
        onComplete={onCooked}
      />
    </div>
  );
}
