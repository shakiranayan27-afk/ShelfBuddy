import { useEffect, useRef, useState } from "react";

// Edit Item bottom sheet (used on mobile and desktop). Lets the user manually
// correct a pantry item's name, quantity (free-text, no conversions), and
// expiry date — e.g. after using some milk outside ShelfBuddy.
//
// It does NOT own any inventory: Save calls onSave(id, patch), which flows
// through App's existing handleUpdate -> pantry state -> localStorage. The
// item ID is preserved. Expiry status recalculates automatically wherever the
// item is displayed because everything reads the same pantry state.
export default function EditItemSheet({ item, onSave, onRemove, onClose }) {
  const [name, setName] = useState(item ? item.name : "");
  const [quantity, setQuantity] = useState(item ? item.quantity || "" : "");
  const [expiryDate, setExpiryDate] = useState(item ? item.expiryDate || "" : "");
  const nameRef = useRef(null);
  const dialogRef = useRef(null);

  // Re-seed fields whenever a different item is opened.
  useEffect(() => {
    if (!item) return;
    setName(item.name || "");
    setQuantity(item.quantity || "");
    setExpiryDate(item.expiryDate || "");
  }, [item]);

  // Focus the first field and close on Escape.
  useEffect(() => {
    if (!item) return;
    nameRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    // Minimal guard: keep a name and a date; otherwise ignore the save.
    if (!trimmedName || !expiryDate) return;
    onSave(item.id, {
      name: trimmedName,
      quantity: quantity.trim(),
      expiryDate,
    });
    onClose();
  }

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        // Click on the dimmed backdrop (not the sheet) closes without saving.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-title"
        ref={dialogRef}
      >
        <div className="sheet-grabber" aria-hidden="true" />
        <h2 id="edit-item-title" className="sheet-title">Edit item</h2>

        <form className="sheet-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Food name</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milk"
            />
          </label>

          <label className="field">
            <span>Quantity remaining</span>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 800ml, 500g, 4, 1 loaf"
            />
          </label>

          <label className="field">
            <span>Expiry date</span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </label>

          <div className="sheet-actions">
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

          {/* Removal is available but visually quiet and separated, so it is
              not triggered accidentally. */}
          {onRemove && (
            <button
              type="button"
              className="sheet-remove"
              onClick={() => {
                onRemove(item.id);
                onClose();
              }}
            >
              Used up · remove item
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
