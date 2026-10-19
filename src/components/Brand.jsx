// Shared ShelfBuddy brand lockup: crisp inline pantry icon + large live
// Manrope wordmark with the decorative leaf above the final "y".
//
// Single source of truth for the brand mark. The desktop Hero and the compact
// mobile header both render this, so the logo never diverges between layouts.
// Purely presentational.

// Crisp, scalable pantry/leaf icon that echoes the approved mark. Decorative —
// the wordmark carries the name.
export function BrandIcon() {
  return (
    <svg
      className="hero-brand-icon"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* leaves growing from the top */}
      <path className="hero-brand-leaf" d="M30 16C30 9 24 4 15 4c0 7 4 13 15 13z" />
      <path
        className="hero-brand-leaf hero-brand-leaf--fresh"
        d="M34 16c0-7 6-12 15-12 0 7-4 13-15 13z"
      />
      {/* pantry cabinet */}
      <rect className="hero-brand-cabinet" x="14" y="18" width="36" height="42" rx="8" />
      <line className="hero-brand-shelf" x1="20" y1="39" x2="44" y2="39" />
      {/* simple contents */}
      <circle className="hero-brand-dot hero-brand-dot--citrus" cx="38" cy="30" r="4" />
      <rect className="hero-brand-jar" x="20" y="25" width="9" height="10" rx="2" />
      <circle className="hero-brand-dot hero-brand-dot--tomato" cx="25" cy="50" r="5" />
      <rect className="hero-brand-jar hero-brand-jar--tall" x="34" y="44" width="10" height="12" rx="2" />
    </svg>
  );
}

// The "ShelfBuddy" live wordmark: forest-green "Shelf" + fresh-green "Buddy"
// with a small decorative leaf anchored above the final "y".
export function BrandWordmark() {
  return (
    <span className="hero-wordmark">
      <span className="hero-wordmark-shelf">Shelf</span>
      <span className="hero-wordmark-buddy">
        Buddy
        <svg
          className="hero-wordmark-leaf"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path className="hero-wordmark-leaf-blade" d="M3 21C3 11 11 3 21 3c0 10-8 18-18 18z" />
          <path className="hero-wordmark-leaf-vein" d="M7 17C10 13 14 9 18 7" />
        </svg>
      </span>
    </span>
  );
}
