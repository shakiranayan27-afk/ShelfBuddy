import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TOUR_STEPS } from "../lib/tourSteps.js";

// Lightweight guided onboarding tour.
//
// Draws a dimming overlay with a "spotlight" cut-out around the current
// target element (via a large box-shadow), plus a tooltip card with
// Back / Next / Skip / Got it controls and progress dots.
//
// Behaviour notes:
//  - `onRequestView(view)` lets the tour switch the Pantry/Calendar tab so a
//    step's target is mounted (e.g. the calendar). It never changes app logic.
//  - On finish/skip, the parent resets the view and persists "seen".
//  - Respects prefers-reduced-motion for scrolling and transitions.

const PAD = 8; // spotlight padding around the target
const GAP = 12; // gap between target and tooltip
const MARGIN = 12; // min viewport margin for the tooltip

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Tour({ open, onClose, onRequestView }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null); // target rect in viewport coords
  const cardRef = useRef(null);
  const nextBtnRef = useRef(null);

  const step = TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  // Reset to the first step whenever the tour (re)opens.
  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  // Ask the parent to switch to the view this step needs.
  useEffect(() => {
    if (!open || !step) return;
    onRequestView?.(step.view);
  }, [open, step, onRequestView]);

  // Measure the current target, scrolling it into a comfortable position.
  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) {
      setRect(null); // graceful fallback: centered tooltip, no spotlight
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // When the step changes, scroll the target into view, then measure.
  // We measure after the view switch + scroll settle, and again on the next
  // frame to catch layout shifts.
  useLayoutEffect(() => {
    if (!open || !step) return;

    let raf1 = 0;
    let raf2 = 0;
    const t = setTimeout(() => {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
      }
      // Measure after the scroll has had a moment to apply.
      raf1 = requestAnimationFrame(() => {
        measure();
        raf2 = requestAnimationFrame(measure);
      });
    }, 60); // allow a view switch (e.g. calendar) to mount first

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, step, measure]);

  // Keep the spotlight aligned on resize/scroll while open.
  useEffect(() => {
    if (!open) return;
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, measure]);

  // Move focus to the primary action each step for keyboard users.
  useEffect(() => {
    if (open) nextBtnRef.current?.focus();
  }, [open, stepIndex]);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1));
  }, []);
  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard: Esc skips, arrows/Enter navigate.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        isLast ? onClose?.() : goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) goBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isFirst, isLast, goNext, goBack, onClose]);

  if (!open || !step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Spotlight rectangle (padded), clamped to the viewport.
  const spot = rect
    ? {
        top: Math.max(rect.top - PAD, 0),
        left: Math.max(rect.left - PAD, 0),
        width: Math.min(rect.width + PAD * 2, vw),
        height: Math.min(rect.height + PAD * 2, vh),
      }
    : null;

  // Tooltip placement: below the target if it fits, else above, else centered.
  // Never overlaps the spotlight.
  const CARD_W = Math.min(360, vw - MARGIN * 2);
  let cardStyle;
  if (spot) {
    const spaceBelow = vh - (spot.top + spot.height);
    const spaceAbove = spot.top;
    const estCardH = 190; // approximate; clamped below regardless
    const placeBelow = spaceBelow >= Math.min(estCardH, spaceAbove) || spaceBelow >= 150;

    let top;
    if (placeBelow) {
      top = spot.top + spot.height + GAP;
    } else {
      top = Math.max(spot.top - GAP - estCardH, MARGIN);
    }
    // Horizontally center on the target, clamped to the viewport.
    let left = rect.left + rect.width / 2 - CARD_W / 2;
    left = Math.max(MARGIN, Math.min(left, vw - CARD_W - MARGIN));
    cardStyle = { top, left, width: CARD_W };
  } else {
    // Fallback: center the card.
    cardStyle = {
      top: vh / 2 - 95,
      left: vw / 2 - CARD_W / 2,
      width: CARD_W,
    };
  }

  return (
    <div className="tour-root">
      {/* Spotlight: a transparent box whose huge box-shadow dims everything
          else. When there is no target, a plain dim overlay is shown. */}
      {spot ? (
        <div
          className="tour-spotlight"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
          }}
        />
      ) : (
        <div className="tour-dim" />
      )}

      <div
        className="tour-card"
        style={cardStyle}
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
      >
        <div className="tour-step-count">
          Step {stepIndex + 1} of {TOUR_STEPS.length}
        </div>
        <h3 id="tour-title" className="tour-title">
          {step.title}
        </h3>
        <p id="tour-body" className="tour-body">
          {step.body}
        </p>

        <div className="tour-dots" aria-hidden="true">
          {TOUR_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`tour-dot ${i === stepIndex ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={onClose}>
            Skip
          </button>
          <div className="tour-nav">
            {!isFirst && (
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary tour-next"
              onClick={isLast ? onClose : goNext}
              ref={nextBtnRef}
            >
              {isLast ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
