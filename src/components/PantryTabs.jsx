// Pantry / Calendar switch. Controls only which view of the My Pantry area
// is shown; the rest of the app (Dietary Preferences, Smart Meal Suggestion)
// is unaffected.
export default function PantryTabs({ view, onChange }) {
  return (
    <div className="pantry-tabs" role="tablist" aria-label="Pantry view">
      <button
        type="button"
        role="tab"
        aria-selected={view === "pantry"}
        className={`pantry-tab ${view === "pantry" ? "active" : ""}`}
        onClick={() => onChange("pantry")}
      >
        Pantry
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "calendar"}
        className={`pantry-tab ${view === "calendar" ? "active" : ""}`}
        onClick={() => onChange("calendar")}
      >
        Calendar
      </button>
    </div>
  );
}
