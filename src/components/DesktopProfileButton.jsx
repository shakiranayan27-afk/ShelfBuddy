import { useEffect, useRef, useState } from "react";
import { ProfileIdentity } from "./MobileProfile.jsx";
import DietaryPreference from "./DietaryPreference.jsx";
import Allergies from "./Allergies.jsx";

// Desktop-only top-right profile control + panel (hidden on mobile via CSS, so
// it never interferes with the mobile Profile bottom-nav tab).
//
// The avatar button opens a compact modal panel that REUSES the shared profile
// data and the existing Dietary/Allergy components — no separate state, no
// account/login/cloud. Closes via the X button, an outside click, or Escape.
export default function DesktopProfileButton({
  profile,
  onSaveProfile,
  preference,
  onChangePreference,
  allergies,
  onChangeAllergies,
  onStartTour,
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Close on Escape; restore focus to the trigger when closing.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    // Focus the panel's close button for keyboard users.
    const t = setTimeout(() => {
      panelRef.current?.querySelector(".dp-close")?.focus();
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  function close() {
    setOpen(false);
    btnRef.current?.focus();
  }

  return (
    <div className="dp-root">
      <button
        ref={btnRef}
        type="button"
        className="dp-avatar-btn"
        aria-label="Open profile"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {profile.photo ? (
          <img src={profile.photo} alt="" className="dp-avatar-img" />
        ) : (
          <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
            <circle cx="24" cy="24" r="24" fill="#e1f5e8" />
            <circle cx="24" cy="19" r="8" fill="#3f9d55" />
            <path d="M8 42c0-8 7-13 16-13s16 5 16 13Z" fill="#3f9d55" />
          </svg>
        )}
        <span className="dp-tooltip" role="tooltip">Profile</span>
      </button>

      {open && (
        <div
          className="dp-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="dp-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your profile and preferences"
            ref={panelRef}
          >
            <div className="dp-panel-head">
              <h2 className="dp-panel-title">Profile</h2>
              <button
                type="button"
                className="dp-close"
                aria-label="Close profile"
                onClick={close}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="dp-panel-body">
              {/* Shared profile identity (same instance pattern / shared state). */}
              <ProfileIdentity profile={profile} onSave={onSaveProfile} />

              {/* Shared preference controls — same components, same state. */}
              <DietaryPreference value={preference} onChange={onChangePreference} />
              <Allergies value={allergies} onChange={onChangeAllergies} />

              <button
                type="button"
                className="btn btn-secondary dp-tour-btn"
                onClick={() => {
                  close();
                  onStartTour?.();
                }}
              >
                Show me around
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
