import { useEffect, useState } from "react";
import Hero from "./components/Hero.jsx";
import Pantry from "./components/Pantry.jsx";
import PantryTabs from "./components/PantryTabs.jsx";
import CalendarView from "./components/CalendarView.jsx";
import DietaryPreference from "./components/DietaryPreference.jsx";
import Allergies from "./components/Allergies.jsx";
import RescueMeal, { RecipeResult } from "./components/RescueMeal.jsx";
import Tour from "./components/Tour.jsx";
import { generateRescueMeal } from "./lib/api.js";
import { classify, STATUS } from "./lib/expiry.js";
import {
  loadPantry,
  savePantry,
  loadPreference,
  savePreference,
  loadAllergies,
  saveAllergies,
  loadTourSeen,
  saveTourSeen,
} from "./lib/storage.js";

// Combine the selected allergen chips + the free-text "other" into one list
// of strings to send to the backend.
function allergyList(allergies) {
  const list = Array.isArray(allergies.list) ? [...allergies.list] : [];
  const other = (allergies.other || "").trim();
  if (other) list.push(other);
  return list;
}

// Small helper for unique ids without pulling in a dependency.
function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Build a deterministic demo pantry with expiry dates relative to today, so
// it stays useful on any day (covers Use Soon / Fresh / Expired, and g/ml/
// count quantities). Uses the same item structure as normal pantry items.
function buildDemoPantry() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };
  const demo = [
    { name: "Carrots", quantity: "500g", offset: 0 },
    { name: "Tomatoes", quantity: "4", offset: 1 },
    { name: "Bread", quantity: "1 loaf", offset: 3 },
    { name: "Eggs", quantity: "6", offset: 7 },
    { name: "Chicken Breast", quantity: "600g", offset: 8 },
    { name: "Milk", quantity: "1L", offset: 10 },
    { name: "Cheddar Cheese", quantity: "300g", offset: 20 },
    { name: "Potatoes", quantity: "1kg", offset: 25 },
    { name: "Rice", quantity: "1kg", offset: 90 },
    { name: "Yogurt", quantity: "500g", offset: -2 },
  ];
  return demo.map((d) => ({
    id: makeId(),
    name: d.name,
    quantity: d.quantity,
    expiryDate: iso(d.offset),
  }));
}

// Root component. Owns the pantry list and dietary preference, and keeps
// both in sync with localStorage.
export default function App() {
  const [items, setItems] = useState(() => loadPantry());
  const [preference, setPreference] = useState(() => loadPreference());
  const [allergies, setAllergies] = useState(() => loadAllergies());
  // Which view of the My Pantry area is shown. Does not affect other sections.
  const [pantryView, setPantryView] = useState("pantry"); // "pantry" | "calendar"
  // Onboarding tour visibility.
  const [tourOpen, setTourOpen] = useState(false);
  // Smart Meal state (lifted here so the result can render full-width,
  // separate from the controls that live in the right-side column).
  const [mealStatus, setMealStatus] = useState("idle"); // idle|loading|success|error
  const [recipe, setRecipe] = useState(null);
  const [mealError, setMealError] = useState("");
  const [servings, setServings] = useState(2);
  // Brief confirmation shown after a post-cooking pantry update.
  const [pantryToast, setPantryToast] = useState("");

  // Persist whenever either piece of state changes.
  useEffect(() => {
    savePantry(items);
  }, [items]);

  useEffect(() => {
    savePreference(preference);
  }, [preference]);

  useEffect(() => {
    saveAllergies(allergies);
  }, [allergies]);

  // Auto-dismiss the post-cooking confirmation after a few seconds.
  useEffect(() => {
    if (!pantryToast) return;
    const t = setTimeout(() => setPantryToast(""), 4000);
    return () => clearTimeout(t);
  }, [pantryToast]);

  // Auto-start the tour on the user's first visit only.
  useEffect(() => {
    if (!loadTourSeen()) {
      const t = setTimeout(() => setTourOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  // End the tour (finished or skipped): remember it and reset to Pantry.
  function closeTour() {
    setTourOpen(false);
    setPantryView("pantry");
    saveTourSeen();
  }

  function handleAdd(newItem) {
    setItems((prev) => [...prev, { id: makeId(), ...newItem }]);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Discard every currently-expired item (user-triggered only). Expiry is
  // recomputed from the current date via classify().
  function handleDiscardExpired() {
    setItems((prev) => prev.filter((item) => classify(item) !== STATUS.EXPIRED));
  }

  // Update an existing pantry item in place (merges a partial patch).
  // Reuses the same state + localStorage persistence as add/delete.
  function handleUpdate(id, patch) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function changeServings(delta) {
    setServings((s) => Math.min(8, Math.max(1, s + delta)));
  }

  // After the user confirms the post-cooking pantry update: the deductions
  // have already been applied via onUpdate/onDelete; clear the generated
  // recipe and review so the user returns to the normal pantry workspace,
  // and surface a brief "Pantry updated." confirmation.
  function handleCookedComplete() {
    setRecipe(null);
    setMealStatus("idle");
    setMealError("");
    setPantryToast("Pantry updated.");
  }

  // Load the deterministic demo pantry. If the pantry already has items, ask
  // first. Replacing clears any open recipe result so stale recipe data can't
  // be applied to the new pantry. Does not touch preference or servings.
  function handleLoadDemo() {
    if (
      items.length > 0 &&
      !window.confirm("Replace your current pantry with demo items?")
    ) {
      return;
    }
    setItems(buildDemoPantry());
    // Clear any generated recipe/post-cooking result from the old pantry.
    setRecipe(null);
    setMealStatus("idle");
    setMealError("");
  }

  // Generate a recipe. When `regenerate` is true, pass the previous recipe
  // name so the model returns a meaningfully different meal. Pantry, servings,
  // preference, and allergies are reused unchanged either way.
  async function handleGenerateMeal(regenerate = false) {
    setMealStatus("loading");
    setMealError("");
    try {
      const result = await generateRescueMeal(items, preference, servings, {
        allergies: allergyList(allergies),
        previousRecipeName: regenerate && recipe ? recipe.recipeName : "",
      });
      setRecipe(result);
      setMealStatus("success");
    } catch (e) {
      setMealError(e.message || "Something went wrong. Please try again.");
      setMealStatus("error");
    }
  }

  return (
    <div className="app">
      <Hero onStartTour={() => setTourOpen(true)} />

      <main className="app-main">
        {pantryToast && (
          <p className="pantry-toast" role="status">
            {pantryToast}
          </p>
        )}

        {pantryView === "calendar" ? (
          /* Dedicated full-width Calendar workspace: only the tabs + calendar.
             The meal sections are hidden (not unmounted-with-loss — all state
             lives in App, so switching back restores everything). */
          <div className="calendar-workspace">
            <PantryTabs view={pantryView} onChange={setPantryView} />
            <CalendarView items={items} />
          </div>
        ) : (
          <>
            {/* Tabs sit in their own full-width row above the two columns so
                that both columns share the same top edge on desktop. */}
            <div className="pantry-tabs-row">
              <PantryTabs view={pantryView} onChange={setPantryView} />
            </div>

            <div className="app-columns">
              {/* Left column (~65% on desktop): core pantry workspace */}
              <div className="col-main">
                <Pantry
                  items={items}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  onLoadDemo={handleLoadDemo}
                  onDiscardExpired={handleDiscardExpired}
                />
              </div>

              {/* Right column (~35% on desktop): preferences + meal controls */}
              <div className="col-side">
                <DietaryPreference value={preference} onChange={setPreference} />
                <Allergies value={allergies} onChange={setAllergies} />
                <RescueMeal
                  pantry={items}
                  status={mealStatus}
                  errorMessage={mealError}
                  servings={servings}
                  onChangeServings={changeServings}
                  onGenerate={() => handleGenerateMeal(false)}
                />
              </div>
            </div>

            {/* Full-width result row beneath both columns, only when a recipe
                exists: recipe card + compact post-cooking update panel. */}
            {mealStatus === "success" && recipe && (
              <RecipeResult
                recipe={recipe}
                pantry={items}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRegenerate={() => handleGenerateMeal(true)}
                onCooked={handleCookedComplete}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>ShelfBuddy MVP</p>
      </footer>

      <Tour open={tourOpen} onClose={closeTour} onRequestView={setPantryView} />
    </div>
  );
}
