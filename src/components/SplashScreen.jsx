import { useEffect, useRef, useState } from "react";
import { BrandIcon, BrandWordmark } from "./Brand.jsx";
import PantryIllustration from "./PantryIllustration.jsx";
import Icon from "./Icon.jsx";

// Full-screen ShelfBuddy welcome / splash screen shown once on first load,
// before the app (Pantry tab) is revealed. Works for both the desktop site
// and the mobile app-style layout.
//
// Behaviour:
//  - Appears immediately on open and STAYS visible until the user interacts
//    (no auto-dismiss / no timeout).
//  - A click/tap anywhere dismisses it (-> Pantry).
//  - The "Show me around" button dismisses it AND starts the guided tour.
//  - Fades out smoothly, then unmounts.
//
// Purely presentational; the only effect is the fade timer and the two
// callbacks. It reuses the shared Brand mark, the existing pantry illustration,
// and the vibrant hero gradient so the look matches the rest of the app.
const FADE_MS = 420; // keep in sync with the CSS transition

export default function SplashScreen({ onDismiss, onStartTour }) {
  const [leaving, setLeaving] = useState(false);
  const fadeTimer = useRef(null);

  // Begin the fade-out, then notify the parent to unmount after the transition.
  function close(startTour) {
    if (leaving) return;
    setLeaving(true);
    if (startTour) onStartTour?.();
    fadeTimer.current = setTimeout(() => onDismiss?.(), FADE_MS);
  }

  // Clean up the fade timer on unmount. No auto-dismiss: the splash persists
  // until the user clicks/taps or presses "Show me around".
  useEffect(() => {
    return () => clearTimeout(fadeTimer.current);
  }, []);

  return (
    <div
      className={`splash ${leaving ? "is-leaving" : ""}`}
      role="dialog"
      aria-label="Welcome to ShelfBuddy"
      onClick={() => close(false)}
    >
      {/* Decorative leaves + sparkles scattered toward the edges, echoing the
          reference splash. Decorative only. */}
      <Leaf className="splash-leaf splash-leaf--1" />
      <Leaf className="splash-leaf splash-leaf--2" />
      <Leaf className="splash-leaf splash-leaf--3" />
      <Leaf className="splash-leaf splash-leaf--4" />
      <Leaf className="splash-leaf splash-leaf--5" />
      <Leaf className="splash-leaf splash-leaf--6" />
      <Sparkle className="splash-spark splash-spark--1" />
      <Sparkle className="splash-spark splash-spark--2" />
      <Sparkle className="splash-spark splash-spark--3" />
      <Sparkle className="splash-spark splash-spark--4" />

      <div className="splash-inner">
        {/* Brand: pantry/leaf icon centred ABOVE the large wordmark. */}
        <div className="splash-brand">
          <BrandIcon />
          <BrandWordmark />
        </div>

        <h1 className="splash-slogan">Never lose track of what's in the back!</h1>
        <p className="splash-subline">Your AI-powered pantry companion</p>

        <button
          type="button"
          className="splash-cta"
          onClick={(e) => {
            e.stopPropagation(); // don't double-fire the backdrop dismiss
            close(true);
          }}
        >
          <Icon name="sparkles" />
          Show me around
        </button>

        {/* Large centred pantry illustration. */}
        <div className="splash-illustration" aria-hidden="true">
          <PantryIllustration />
        </div>
      </div>
    </div>
  );
}

// A single decorative leaf (fresh green blade + vein). Position/size via class.
function Leaf({ className }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path
          d="M4 20c0-9 7-15 16-15 0 9-7 15-16 15Z"
          fill="#58b765"
          stroke="#2f8f49"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M4 20C8 15 12 12 18 9" fill="none" stroke="#2f8f49" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// A small four-point sparkle. Position/size via class.
function Sparkle({ className }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8Z" fill="#ffffff" />
      </svg>
    </span>
  );
}
