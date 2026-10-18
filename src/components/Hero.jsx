import Icon from "./Icon.jsx";
import PantryIllustration from "./PantryIllustration.jsx";

// Crisp, scalable ShelfBuddy brand icon (pantry cabinet + leaves) that echoes
// the approved mark. Rendered as inline SVG so it stays sharp beside the large
// live wordmark at any size. Decorative — the wordmark carries the name.
function BrandIcon() {
  return (
    <svg
      className="hero-brand-icon"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* leaves growing from the top */}
      <path
        className="hero-brand-leaf"
        d="M30 16C30 9 24 4 15 4c0 7 4 13 15 13z"
      />
      <path
        className="hero-brand-leaf hero-brand-leaf--fresh"
        d="M34 16c0-7 6-12 15-12 0 7-4 13-15 13z"
      />
      {/* pantry cabinet */}
      <rect
        className="hero-brand-cabinet"
        x="14"
        y="18"
        width="36"
        height="42"
        rx="8"
      />
      <line className="hero-brand-shelf" x1="20" y1="39" x2="44" y2="39" />
      {/* simple contents */}
      <circle className="hero-brand-dot hero-brand-dot--citrus" cx="38" cy="30" r="4" />
      <rect className="hero-brand-jar" x="20" y="25" width="9" height="10" rx="2" />
      <circle className="hero-brand-dot hero-brand-dot--tomato" cx="25" cy="50" r="5" />
      <rect className="hero-brand-jar hero-brand-jar--tall" x="34" y="44" width="10" height="12" rx="2" />
    </svg>
  );
}

// ShelfBuddy hero: a full-width colour band with an asymmetric 55/45 desktop
// composition — left-aligned branding, slogan, sub-line, and the "Show me
// around" CTA on the left; a custom pantry illustration on the right. On
// mobile the copy stacks above the illustration. Purely presentational; the
// only prop is the tour trigger.
export default function Hero({ onStartTour }) {
  return (
    <header className="hero-band" aria-labelledby="hero-brand">
      <div className="hero-band__inner">
        <div className="hero-copy">
          {/* Brand lockup: icon + large live Manrope wordmark. No tile/card. */}
          <div className="hero-brand" id="hero-brand">
            <BrandIcon />
            <span className="hero-wordmark">
              <span className="hero-wordmark-shelf">Shelf</span>
              {/* "Buddy" carries a small decorative leaf above its final "y"
                  to echo the original logo. The leaf is anchored to this span
                  and sized in em units so it scales with the wordmark. */}
              <span className="hero-wordmark-buddy">
                Buddy
                <svg
                  className="hero-wordmark-leaf"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    className="hero-wordmark-leaf-blade"
                    d="M3 21C3 11 11 3 21 3c0 10-8 18-18 18z"
                  />
                  <path
                    className="hero-wordmark-leaf-vein"
                    d="M7 17C10 13 14 9 18 7"
                  />
                </svg>
              </span>
            </span>
          </div>

          {/* Slogan — one line, fluid clamp sizing, secondary to the brand. */}
          <h1 className="hero-slogan">Never lose track of what's in the back!</h1>

          {/* Sub-line — one line, smaller, medium weight, deep green/sage. */}
          <p className="hero-subline">Your AI-powered pantry companion</p>

          <button type="button" className="hero-cta" onClick={onStartTour}>
            <Icon name="sparkles" />
            Show me around
          </button>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <PantryIllustration />
        </div>
      </div>
    </header>
  );
}
