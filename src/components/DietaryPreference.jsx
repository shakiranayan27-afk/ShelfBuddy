// Dietary preference selector. Five options, single choice.
// The chosen value is lifted to App and persisted in localStorage.
const OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "gluten-free", label: "Gluten-Free" },
];

export default function DietaryPreference({ value, onChange }) {
  return (
    <section className="card dietary-card" data-tour="dietary">
      <h2>Dietary Preferences</h2>
      <p className="section-sub">
        We'll respect this when generating your Smart Meal Suggestion.
      </p>

      <div className="pref-options" role="radiogroup" aria-label="Dietary preference">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`pref-chip ${value === opt.value ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="dietary-preference"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </section>
  );
}
