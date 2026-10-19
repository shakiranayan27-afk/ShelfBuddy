import { BrandIcon, BrandWordmark } from "./Brand.jsx";

// Compact app-style brand header shown on mobile only (hidden on desktop via
// CSS). Reuses the shared Brand mark so the logo matches the desktop hero.
// Mostly presentational; the only behaviour is a help button that triggers the
// existing guided tour (no new tour logic).
//
// The small decorative leaves echo the reference flourish; the help/sparkle
// button sits on the right.
export default function MobileHeader({ onHelp }) {
  return (
    <header className="m-header" aria-label="ShelfBuddy">
      <div className="m-header-brand">
        <BrandIcon />
        <BrandWordmark />
      </div>

      <div className="m-header-actions">
        <span className="m-header-leaves" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M4 20c0-9 7-15 16-15 0 9-7 15-16 15Z" fill="none" stroke="#3f9d55" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M4 20C8 15 12 12 18 9" fill="none" stroke="#3f9d55" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>

        {/* Help / tour trigger — fires the existing "Show me around" tour. */}
        <button
          type="button"
          className="m-header-help"
          onClick={onHelp}
          aria-label="Show me around"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
            <path
              d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9 12 3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
