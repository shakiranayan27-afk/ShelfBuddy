import { useEffect, useState } from "react";
import Pantry from "./components/Pantry.jsx";
import PantryTabs from "./components/PantryTabs.jsx";
import CalendarView from "./components/CalendarView.jsx";
import DietaryPreference from "./components/DietaryPreference.jsx";
import RescueMeal from "./components/RescueMeal.jsx";
import {
  loadPantry,
  savePantry,
  loadPreference,
  savePreference,
} from "./lib/storage.js";

// Small helper for unique ids without pulling in a dependency.
function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Root component. Owns the pantry list and dietary preference, and keeps
// both in sync with localStorage.
export default function App() {
  const [items, setItems] = useState(() => loadPantry());
  const [preference, setPreference] = useState(() => loadPreference());
  // Which view of the My Pantry area is shown. Does not affect other sections.
  const [pantryView, setPantryView] = useState("pantry"); // "pantry" | "calendar"

  // Persist whenever either piece of state changes.
  useEffect(() => {
    savePantry(items);
  }, [items]);

  useEffect(() => {
    savePreference(preference);
  }, [preference]);

  function handleAdd(newItem) {
    setItems((prev) => [...prev, { id: makeId(), ...newItem }]);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🥕 ShelfBuddy</h1>
        <p className="tagline">Use what you have. Waste less.</p>
      </header>

      <main className="app-main">
        <PantryTabs view={pantryView} onChange={setPantryView} />

        {pantryView === "pantry" ? (
          <Pantry items={items} onAdd={handleAdd} onDelete={handleDelete} />
        ) : (
          <CalendarView items={items} />
        )}

        <DietaryPreference value={preference} onChange={setPreference} />
        <RescueMeal pantry={items} preference={preference} />
      </main>

      <footer className="app-footer">
        <p>ShelfBuddy MVP</p>
      </footer>
    </div>
  );
}
