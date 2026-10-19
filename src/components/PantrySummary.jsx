import IngredientIcon from "./IngredientIcon.jsx";
import { CATEGORY, categoryCounts } from "../lib/category.js";

// "Your Pantry" summary card (mobile only). Four illustrated category tiles,
// each showing a live count derived from the existing items array via
// categoryCounts(). No data is persisted here — it is a pure presentation of
// the real pantry. The tile graphics reuse IngredientIcon so they match the
// detailed pantry rows.
//
// Each category uses a representative ingredient name so IngredientIcon picks a
// recognisable illustration (e.g. "Tomato" for Fruits & Veg).

const TILES = [
  { key: CATEGORY.FRUIT_VEG, label: "Fruits & Veg", sample: "Tomato" },
  { key: CATEGORY.GRAINS, label: "Grains", sample: "Rice" },
  { key: CATEGORY.DAIRY, label: "Dairy", sample: "Milk" },
  { key: CATEGORY.PROTEINS, label: "Proteins", sample: "Chicken" },
];

export default function PantrySummary({ items, onNavigate }) {
  const counts = categoryCounts(items);

  return (
    <section className="m-summary-card" aria-label="Your Pantry summary">
      {/* The whole header row is a real button that scrolls to the detailed
          "All pantry items" list, so the chevron is meaningful. */}
      <button
        type="button"
        className="m-card-head m-card-head-btn"
        onClick={onNavigate}
        aria-label="Go to all pantry items"
      >
        <h2>Your Pantry</h2>
        <span className="m-card-chevron" aria-hidden="true">›</span>
      </button>

      <div className="m-summary-grid">
        {TILES.map((tile) => (
          <div className="m-summary-cat" key={tile.key}>
            <span className="m-summary-tile">
              <IngredientIcon name={tile.sample} />
            </span>
            <span className="m-summary-count">{counts[tile.key]}</span>
            <span className="m-summary-label">{tile.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
