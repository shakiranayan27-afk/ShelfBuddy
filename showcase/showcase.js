/* ==========================================================================
   ShelfBuddy — Mobile Showcase: fit-to-viewport scaling (presentation only)

   Sole responsibility: on desktop/laptop, scale the ENTIRE phone down as one
   unit when the browser window is shorter or narrower than the phone needs,
   so the device is always fully visible, never clipped, and the outer page
   never scrolls. A single uniform scale() preserves the aspect ratio exactly.

   On real phones the device frame is removed by CSS (max-width: 500px) and
   this script simply resets the scale to 1 — it touches nothing in the app.
   ========================================================================== */
(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 500; // must match the CSS media query
  var TARGET_VH = 0.92; // phone should occupy ~92% of the viewport height
  var WIDTH_MARGIN = 32; // min horizontal breathing room (px)

  var phone = document.getElementById("phone");
  if (!phone) return;

  function readPx(styles, name) {
    return parseFloat(styles.getPropertyValue(name)) || 0;
  }

  function fit() {
    // On real phones the frame is gone; keep scale neutral.
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      phone.style.setProperty("--scale", "1");
      return;
    }

    var root = getComputedStyle(document.documentElement);
    var appW = readPx(root, "--app-w");
    var appH = readPx(root, "--app-h");
    var pad = readPx(root, "--frame-pad");

    // Unscaled device footprint including the graphite bezel.
    var deviceW = appW + pad * 2;
    var deviceH = appH + pad * 2;

    // Preferred size: let the phone occupy ~92% of the viewport height.
    var heightScale = (window.innerHeight * TARGET_VH) / deviceH;

    // Hard limit: never let the (scaled) phone overflow the viewport width,
    // so there is never horizontal clipping/scroll on narrow laptops.
    var widthLimit = (window.innerWidth - WIDTH_MARGIN) / deviceW;

    // Take the smaller of the target and the width limit. This both grows the
    // phone to ~92vh on tall screens and shrinks it proportionally (never
    // clipping, never distorting) when the laptop is short or narrow.
    var scale = Math.min(heightScale, widthLimit);

    phone.style.setProperty("--scale", String(scale));
  }

  fit();
  window.addEventListener("resize", fit, { passive: true });
  window.addEventListener("orientationchange", fit, { passive: true });
})();
