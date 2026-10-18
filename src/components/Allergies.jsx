// "Allergies to avoid" — user-declared hard exclusions for recipe generation.
// Multiple selectable common allergens plus an optional free-text entry.
// Stored like Dietary Preferences; sent to the backend on every generation.

const COMMON_ALLERGENS = [
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree nuts",
  "Soy",
  "Wheat / Gluten",
  "Fish",
  "Shellfish",
  "Sesame",
];

export default function Allergies({ value, onChange }) {
  const { list, other } = value;

  function toggle(allergen) {
    const next = list.includes(allergen)
      ? list.filter((a) => a !== allergen)
      : [...list, allergen];
    onChange({ list: next, other });
  }

  function setOther(text) {
    onChange({ list, other: text });
  }

  return (
    <section className="card allergies-card">
      <h2>Allergies to avoid</h2>
      <p className="section-sub">
        Select any allergens to exclude. ShelfBuddy treats these as a hard
        exclusion when generating suggestions.
      </p>

      <div className="pref-options" role="group" aria-label="Allergies to avoid">
        {COMMON_ALLERGENS.map((allergen) => (
          <label
            key={allergen}
            className={`pref-chip ${list.includes(allergen) ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={list.includes(allergen)}
              onChange={() => toggle(allergen)}
            />
            {allergen}
          </label>
        ))}
      </div>

      <label className="field allergy-other">
        <span>Other allergy <em>(optional)</em></span>
        <input
          type="text"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="e.g. Mustard"
        />
      </label>

      <p className="allergy-note">
        ShelfBuddy will avoid declared allergens in suggestions, but always
        check ingredient labels and cross-contamination information yourself.
      </p>
    </section>
  );
}
