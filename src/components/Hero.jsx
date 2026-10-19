import Icon from "./Icon.jsx";
import PantryIllustration from "./PantryIllustration.jsx";
import { BrandIcon, BrandWordmark } from "./Brand.jsx";

// ShelfBuddy hero: a full-width colour band with an asymmetric 55/45 desktop
// composition — left-aligned branding, slogan, sub-line, and the "Show me
// around" CTA on the left; a custom pantry illustration on the right. On
// mobile the copy stacks above the illustration. Purely presentational; the
// only prop is the tour trigger.
//
// The brand mark (icon + wordmark) is the shared Brand component so the logo
// stays identical between this desktop hero and the compact mobile header.
export default function Hero({ onStartTour }) {
  return (
    <header className="hero-band" aria-labelledby="hero-brand">
      <div className="hero-band__inner">
        <div className="hero-copy">
          {/* Brand lockup: icon + large live Manrope wordmark. No tile/card. */}
          <div className="hero-brand" id="hero-brand">
            <BrandIcon />
            <BrandWordmark />
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
