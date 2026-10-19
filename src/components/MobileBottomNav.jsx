// Fixed app-style bottom navigation (mobile only). Uses REAL ShelfBuddy
// sections — no fake pages. Tabs:
//   - Pantry     -> show pantry view + scroll to the pantry section
//   - Smart Meal -> show pantry view + scroll to the Smart Meal section
//   - Calendar   -> activate the existing Calendar view state
//   - Add        -> show pantry view + open/scroll to the "+ Add food" section
//
// All behaviour is delegated to the parent via onNavigate(tab); this component
// is presentational + a thin dispatcher. Active tab is highlighted forest
// green on a light mint background.

const TABS = [
  { key: "pantry", label: "Pantry", icon: PantryGlyph },
  { key: "smartMeal", label: "Smart Meal", icon: MealGlyph },
  { key: "calendar", label: "Calendar", icon: CalendarGlyph },
  { key: "profile", label: "Profile", icon: ProfileGlyph },
];

export default function MobileBottomNav({ active, onNavigate }) {
  return (
    <nav className="m-bottom-nav" aria-label="ShelfBuddy sections">
      {TABS.map((tab) => {
        const Glyph = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`m-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(tab.key)}
          >
            <span className="m-nav-icon" aria-hidden="true">
              <Glyph />
            </span>
            <span className="m-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* --- simple SVG line icons (stroke uses currentColor from the item) --- */

function svgProps() {
  return {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

function PantryGlyph() {
  return (
    <svg {...svgProps()}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="12" y1="6" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="18" />
    </svg>
  );
}

function MealGlyph() {
  return (
    <svg {...svgProps()}>
      <path d="M6 3v7a2 2 0 0 0 2 2v9" />
      <path d="M10 3v4" />
      <path d="M18 3c-1.7 0-3 2-3 5s1.3 4 3 4v9" />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg {...svgProps()}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

function ProfileGlyph() {
  return (
    <svg {...svgProps()}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}
