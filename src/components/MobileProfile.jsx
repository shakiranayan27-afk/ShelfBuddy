// Mobile Profile / Your Preferences chrome (mobile only, shown via CSS on the
// Profile tab). NOT an account/login page.
//
// One source of truth: the Dietary Preferences and Allergies controls are NOT
// re-created here. They remain the same single instances rendered in the side
// column; this chrome is split into a top part (title + "Food preferences"
// heading) and a bottom part (meal prefs, help, about) that sit around those
// existing controls in the DOM, so on mobile the Profile view reads as one
// grouped settings screen without duplicating any state or control.

import { useEffect, useRef, useState } from "react";

// Default person/avatar placeholder (ShelfBuddy-style, green). Decorative.
function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#e1f5e8" />
      <circle cx="24" cy="19" r="8" fill="#3f9d55" />
      <path d="M8 42c0-8 7-13 16-13s16 5 16 13Z" fill="#3f9d55" />
    </svg>
  );
}

// Local profile identity: avatar + editable display name + Edit profile.
// NOT an account — name and optional photo are stored locally via onSave.
// Exported so it can be rendered once in the side column and shown on BOTH
// desktop (compact sidebar card) and the mobile Profile tab — one instance,
// one shared state.
export function ProfileIdentity({ profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const fileRef = useRef(null);

  // Keep the local draft in sync if the stored profile changes externally.
  useEffect(() => {
    if (!editing) setName(profile.name || "");
  }, [profile.name, editing]);

  function pickPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSave({ ...profile, photo: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-choosing the same file later
  }

  function removePhoto() {
    onSave({ ...profile, photo: "" });
  }

  function save() {
    onSave({ ...profile, name: name.trim() });
    setEditing(false);
  }

  function cancel() {
    setName(profile.name || "");
    setEditing(false);
  }

  const displayName = profile.name && profile.name.trim() ? profile.name : "ShelfBuddy user";

  return (
    <div className="m-profile-identity">
      <button
        type="button"
        className="m-profile-avatar"
        onClick={() => fileRef.current && fileRef.current.click()}
        aria-label={profile.photo ? "Replace profile photo" : "Add profile photo"}
      >
        {profile.photo ? (
          <img src={profile.photo} alt="" className="m-profile-avatar-img" />
        ) : (
          <AvatarPlaceholder />
        )}
        <span className="m-profile-avatar-edit" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </span>
      </button>

      {/* Hidden native file input drives photo selection. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="m-profile-file"
        onChange={pickPhoto}
      />

      <div className="m-profile-identity-body">
        {editing ? (
          <>
            <div className="m-profile-name-field">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-label="Display name"
              />
            </div>
            <div className="m-profile-identity-actions">
              <button type="button" className="btn btn-primary" onClick={save}>
                Save
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancel}>
                Cancel
              </button>
              {profile.photo && (
                <button type="button" className="m-profile-remove-photo" onClick={removePhoto}>
                  Remove photo
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="m-profile-name">{displayName}</span>
            <button
              type="button"
              className="m-profile-edit-link"
              onClick={() => setEditing(true)}
            >
              Edit profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Top of the mobile Profile view: the "Profile" title + "Food preferences"
// heading above the existing Dietary + Allergies controls. The profile
// identity card itself is rendered once in App (shared with desktop), so it
// is not duplicated here.
export function MobileProfileTop() {
  return (
    <div className="m-profile-top" data-mview="profile">
      <h2 className="m-profile-title">Profile</h2>
      <h3 className="m-profile-group-title m-profile-food-heading">Food preferences</h3>
    </div>
  );
}

// Bottom of the Profile view: appears below the Dietary + Allergies controls.
export function MobileProfileBottom({ servings, onStartTour }) {
  return (
    <div className="m-profile-bottom" data-mview="profile">
      <div className="m-profile-group">
        <h3 className="m-profile-group-title">Meal preferences</h3>
        <div className="m-profile-row">
          <span className="m-profile-row-label">Default servings</span>
          <span className="m-profile-row-value">{servings}</span>
        </div>
        <p className="m-profile-hint">
          Adjust servings on the Smart Meal tab before generating a suggestion.
        </p>
      </div>

      <div className="m-profile-group">
        <h3 className="m-profile-group-title">Help &amp; guidance</h3>
        <button
          type="button"
          className="btn btn-secondary m-profile-tour"
          onClick={onStartTour}
        >
          Show me around
        </button>
        <p className="m-profile-hint">Replay the ShelfBuddy walkthrough.</p>
      </div>

      <div className="m-profile-group">
        <h3 className="m-profile-group-title">About ShelfBuddy</h3>
        <p className="m-profile-hint">
          ShelfBuddy will avoid declared allergens in suggestions, but always
          check ingredient labels and cross-contamination information yourself.
          Recipes are AI-generated — use your own judgement on food safety.
        </p>
      </div>
    </div>
  );
}
