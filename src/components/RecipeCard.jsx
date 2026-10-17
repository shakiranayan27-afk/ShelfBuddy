// Renders a generated Rescue Meal recipe: all 7 structured fields plus the
// fixed AI disclaimer that must appear on every recipe.

// Fixed disclaimer text — shown verbatim on every generated recipe.
const DISCLAIMER =
  "This recipe is AI-generated. Please verify ingredients for your own " +
  "allergies and food-safety suitability before cooking. ShelfBuddy does " +
  "not determine whether food is safe to eat.";

// Display-only helper: strip any leading number prefix the model may have
// added (e.g. "1. ", "2) ") so the <ol> supplies the single number itself,
// avoiding "1. 1." double numbering. Does not alter the AI output or schema.
function stripLeadingNumber(step) {
  return step.replace(/^\s*\d+[.)]\s*/, "");
}

// Small helper: render a labelled list, or a muted "none" line if empty.
function ListBlock({ title, items, emptyText }) {
  return (
    <div className="recipe-block">
      <h4>{title}</h4>
      {items && items.length > 0 ? (
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="recipe-none">{emptyText}</p>
      )}
    </div>
  );
}

export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3 className="recipe-name">{recipe.recipeName}</h3>

      <div className="recipe-meta">
        <span className="recipe-meta-pill">⏱ ~{recipe.cookingTimeMinutes} min</span>
        <span className="recipe-meta-pill">
          🍽 Serves {recipe.servings}
        </span>
      </div>

      <div className="recipe-block">
        <h4>Why this recipe</h4>
        <p>{recipe.whyRecommended}</p>
      </div>

      {/* Emphasised panel: the whole point is using these up first. */}
      <div className="recipe-use-soon">
        <h4>Prioritising what needs using first</h4>
        {recipe.useSoonPrioritised && recipe.useSoonPrioritised.length > 0 ? (
          <ul>
            {recipe.useSoonPrioritised.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="recipe-none">No soon-to-expire ingredients were prioritised.</p>
        )}
      </div>

      <ListBlock
        title="Pantry ingredients used"
        items={recipe.pantryIngredientsUsed}
        emptyText="None."
      />

      <ListBlock
        title="Additional ingredients required"
        items={recipe.additionalIngredients}
        emptyText="None — you have everything you need."
      />

      <div className="recipe-block">
        <h4>Instructions</h4>
        <ol className="recipe-steps">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{stripLeadingNumber(step)}</li>
          ))}
        </ol>
      </div>

      <ListBlock
        title="Optional substitutions"
        items={recipe.substitutions}
        emptyText="None suggested."
      />

      <p className="recipe-disclaimer" role="note">
        {DISCLAIMER}
      </p>
    </div>
  );
}
