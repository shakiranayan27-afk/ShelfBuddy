import { useEffect, useState } from "react";
import Hero from "./components/Hero.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import PantrySummary from "./components/PantrySummary.jsx";
import ExpiringSoon from "./components/ExpiringSoon.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import SmartMealIntro from "./components/SmartMealIntro.jsx";
import { MobileProfileTop, MobileProfileBottom, ProfileIdentity } from "./components/MobileProfile.jsx";
import DesktopProfileButton from "./components/DesktopProfileButton.jsx";
import EditItemSheet from "./components/EditItemSheet.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
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
  saveTourSeen,
  loadProfile,
  saveProfile,
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
  // Active mobile view (bottom navigation). One of:
  //   "pantry" | "smartMeal" | "calendar" | "profile"
  // Desktop ignores this entirely; it only drives mobile section visibility.
  const [mobileNav, setMobileNav] = useState("pantry");
  // Local profile (display name + optional photo). Not an account.
  const [profile, setProfile] = useState(() => loadProfile());
  // The pantry item currently open in the Edit Item sheet (null = closed).
  const [editingItem, setEditingItem] = useState(null);
  // Full-screen welcome/splash shown on first open, before the Pantry tab.
  const [showSplash, setShowSplash] = useState(true);

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

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Auto-dismiss the post-cooking confirmation after a few seconds.
  useEffect(() => {
    if (!pantryToast) return;
    const t = setTimeout(() => setPantryToast(""), 4000);
    return () => clearTimeout(t);
  }, [pantryToast]);

  // The guided tour now starts ONLY through an explicit "Show me around"
  // action (the splash button, the mobile header help icon, or the Profile
  // button). The previous first-visit auto-start is intentionally disabled so
  // the tour never launches on its own — including after the welcome splash.

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

  // Mobile bottom-nav dispatcher. Each tab is a distinct mobile VIEW; the
  // relevant sections are shown via CSS (driven by data-mobile-view on .app).
  // No fake pages: Calendar also flips the existing pantryView state so the
  // real CalendarView mounts (and so desktop's own toggle is unaffected since
  // this only runs from the mobile nav). The other three keep the columns
  // branch mounted via pantryView="pantry".
  function handleMobileNav(tab) {
    setMobileNav(tab);
    setPantryView(tab === "calendar" ? "calendar" : "pantry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Dismiss the welcome splash and land on the Pantry tab by default.
  function dismissSplash() {
    setShowSplash(false);
    setMobileNav("pantry");
    setPantryView("pantry");
  }

  // Smoothly scroll to a section within the current (Pantry) view. Used by the
  // "Your Pantry" and "Items expiring soon" card headers so their chevrons do
  // something real. Ensures the Pantry view is active first.
  function scrollToPantryTarget(selector) {
    setMobileNav("pantry");
    setPantryView("pantry");
    // Double rAF so any view/state change has settled before we measure.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Brief highlight so the action is perceptible even when the target is
        // already near the top and the scroll distance is tiny (common on tall
        // desktop windows). Also move focus for keyboard users.
        el.classList.add("nav-flash");
        if (el.tabIndex < 0) el.setAttribute("tabindex", "-1");
        try {
          el.focus({ preventScroll: true });
        } catch {
          /* older browsers: ignore */
        }
        setTimeout(() => el.classList.remove("nav-flash"), 1100);
      });
    });
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
    // data-mobile-view drives which sections are visible on mobile (<=560px).
    // Desktop ignores it entirely and renders the full single-page layout.
    <div className="app" data-mobile-view={mobileNav}>
      {/* Full-screen welcome splash on first open. Covers the app while active;
          dismisses after 3s, on any click/tap, or via "Show me around" (which
          also starts the tour). Lands on the Pantry tab. */}
      {showSplash && (
        <SplashScreen onDismiss={dismissSplash} onStartTour={() => setTourOpen(true)} />
      )}

      {/* Desktop hero (hidden on mobile via CSS). */}
      <Hero onStartTour={() => setTourOpen(true)} />
      {/* Compact app-style brand header (mobile only via CSS). The help icon
          triggers the same existing tour — no second tour. */}
      <MobileHeader onHelp={() => setTourOpen(true)} />

      {/* Desktop-only top-right profile control (hidden on mobile via CSS).
          Reuses the shared profile + preference state. */}
      <DesktopProfileButton
        profile={profile}
        onSaveProfile={setProfile}
        preference={preference}
        onChangePreference={setPreference}
        allergies={allergies}
        onChangeAllergies={setAllergies}
        onStartTour={() => setTourOpen(true)}
      />

      <main className="app-main">
        {pantryToast && (
          <p className="pantry-toast" role="status">
            {pantryToast}
          </p>
        )}

        {pantryView === "calendar" ? (
          /* Dedicated full-width Calendar workspace: only the tabs + calendar.
             The meal sections are hidden (not unmounted-with-loss — all state
             lives in App, so switching back restores everything). On mobile
             this is the Calendar tab; the Pantry/Calendar segmented control is
             hidden via CSS there (the bottom nav owns view switching). */
          <div className="calendar-workspace">
            <PantryTabs view={pantryView} onChange={setPantryView} />
            <CalendarView items={items} />
          </div>
        ) : (
          <>
            {/* Tabs sit in their own full-width row above the two columns so
                that both columns share the same top edge on desktop. Hidden on
                mobile (the bottom nav replaces this). */}
            <div className="pantry-tabs-row">
              <PantryTabs view={pantryView} onChange={setPantryView} />
            </div>

            <div className="app-columns">
              {/* Left column (~65% on desktop): core pantry workspace. On
                  mobile this is the Pantry TAB (data-mview="pantry"). The
                  summary/expiring cards are passed into Pantry so they sit
                  between search and "+ Add food" on mobile; hidden on desktop.
                  Both are derived from `items` only. */}
              <div className="col-main" id="pantry-section" data-mview="pantry">
                <Pantry
                  items={items}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  onLoadDemo={handleLoadDemo}
                  onDiscardExpired={handleDiscardExpired}
                  onEditItem={setEditingItem}
                  mobileSummary={
                    <>
                      <PantrySummary
                        items={items}
                        onNavigate={() => scrollToPantryTarget(".pantry-list-heading")}
                      />
                      <ExpiringSoon
                        items={items}
                        onNavigate={() => scrollToPantryTarget('[data-tour="use-first"]')}
                        onEditItem={setEditingItem}
                      />
                    </>
                  }
                />
              </div>

              {/* Right column (~35% on desktop): preferences + meal controls.
                  On mobile these are split across the Profile and Smart Meal
                  tabs via data-mview, while remaining the SAME single
                  component instances (one source of truth). */}
              <div className="col-side">
                {/* Local profile identity card. One instance, shared state:
                    on desktop it sits at the top of the sidebar; on mobile it
                    appears in the Profile tab (data-mview="profile"). */}
                <div className="profile-identity-card" data-mview="profile">
                  <ProfileIdentity profile={profile} onSave={setProfile} />
                </div>

                {/* Profile tab (mobile): grouped settings around the existing
                    Dietary + Allergies controls. */}
                <MobileProfileTop />
                <div data-mview="profile">
                  <DietaryPreference value={preference} onChange={setPreference} />
                </div>
                <div data-mview="profile">
                  <Allergies value={allergies} onChange={setAllergies} />
                </div>
                <MobileProfileBottom
                  servings={servings}
                  onStartTour={() => setTourOpen(true)}
                />

                {/* Smart Meal tab (mobile): intro + the existing controls. */}
                <div id="smart-meal-section" data-mview="smartMeal">
                  <div className="m-smartmeal-only">
                    <SmartMealIntro
                      items={items}
                      preference={preference}
                      allergies={allergies}
                    />
                  </div>
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
            </div>

            {/* Full-width result row beneath both columns, only when a recipe
                exists: recipe card + compact post-cooking update panel. On
                mobile it belongs to the Smart Meal tab (data-mview). */}
            {mealStatus === "success" && recipe && (
              <div data-mview="smartMeal">
                <RecipeResult
                  recipe={recipe}
                  pantry={items}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onRegenerate={() => handleGenerateMeal(true)}
                  onCooked={handleCookedComplete}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>ShelfBuddy MVP</p>
      </footer>

      {/* Edit Item bottom sheet. Uses the LIVE item from `items` (by id) so it
          always reflects current data, and saves through the existing
          handleUpdate -> pantry state -> localStorage path (ID preserved). */}
      <EditItemSheet
        item={editingItem ? items.find((it) => it.id === editingItem.id) || null : null}
        onSave={handleUpdate}
        onRemove={handleDelete}
        onClose={() => setEditingItem(null)}
      />

      {/* Fixed app-style bottom navigation (mobile only via CSS). */}
      <MobileBottomNav active={mobileNav} onNavigate={handleMobileNav} />

      <Tour open={tourOpen} onClose={closeTour} onRequestView={setPantryView} />
    </div>
  );
}
