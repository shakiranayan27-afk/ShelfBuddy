import IngredientIcon from "./IngredientIcon.jsx";
import { classify, sortItems, STATUS } from "../lib/expiry.js";

// Mobile Smart Meal intro (mobile only, shown via CSS on the Smart Meal tab).
// Purely presentational/derived: a heading, supporting line, a compact preview
// of current Use Soon ingredients, and concise summaries of the user's dietary
// preference + allergies. It reuses the existing expiry utilities and the
// existing Dietary/Allergy STATE (passed in) — no new logic, no duplicate
// controls. The servings selector + Generate button + recipe result are the
// existing RescueMeal/RecipeResult rendered below this intro.

const DIETARY_LABELS = {
  none: "No preference",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  "gluten-free": "Gluten-Free",
};

export default function SmartMealIntro({ items, preference, allergies }) {
  const useSoon = sortItems(items)
    .filter((item) => classify(item) === STATUS.USE_SOON)
    .slice(0, 6);

  const dietaryText = DIETARY_LABELS[preference] || "No preference";
  const allergyList = [
    ...(Array.isArray(allergies?.list) ? allergies.list : []),
    ...(allergies?.other && allergies.other.trim() ? [allergies.other.trim()] : []),
  ];
  const allergyText = allergyList.length ? allergyList.join(", ") : "None selected";

  return (
    <div className="m-smartmeal-intro">
      <h2 className="m-smartmeal-title">Smart Meal</h2>
      <p className="m-smartmeal-sub">
        Turn what needs using first into something worth cooking.
      </p>

      <div className="m-smartmeal-block">
        <h3 className="m-smartmeal-block-title">Needs using first</h3>
        {useSoon.length === 0 ? (
          <p className="m-smartmeal-empty">Nothing needs using urgently 🎉</p>
        ) : (
          <ul className="m-smartmeal-chips">
            {useSoon.map((item) => (
              <li className="m-smartmeal-chip" key={item.id}>
                <IngredientIcon name={item.name} />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="m-smartmeal-prefs">
        <div className="m-smartmeal-pref">
          <span className="m-smartmeal-pref-label">Dietary</span>
          <span className="m-smartmeal-pref-value">{dietaryText}</span>
        </div>
        <div className="m-smartmeal-pref">
          <span className="m-smartmeal-pref-label">Allergies</span>
          <span className="m-smartmeal-pref-value">{allergyText}</span>
        </div>
      </div>
    </div>
  );
}
