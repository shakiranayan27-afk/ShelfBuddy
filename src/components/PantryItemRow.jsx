import { describeExpiry, STATUS } from "../lib/expiry.js";
import IngredientIcon from "./IngredientIcon.jsx";

// A single pantry item: icon, name, optional quantity, a coloured status badge
// (Expired / Use Soon / Fresh) with an expiry description, an explicit Edit
// button, and a remove button. For expired items the action reads "Discard"
// (the food may still be in the cupboard); Fresh / Use Soon items keep
// "Delete".
//
// Editing: the WHOLE row opens the Edit Item sheet via onEdit(item) — clicking
// anywhere that isn't the Edit/Delete buttons triggers it (keyboard: Enter /
// Space on the focused row). There is also an explicit pencil Edit button so
// the action is obvious. Both call the same onEdit. The Edit and Delete
// buttons stopPropagation so they never double-fire the row handler.
export default function PantryItemRow({ item, onDelete, onEdit }) {
  const { status, label, detail } = describeExpiry(item);
  const isExpired = status === STATUS.EXPIRED;
  const actionLabel = isExpired ? "Discard" : "Delete";

  function openEdit() {
    if (onEdit) onEdit(item);
  }

  function onRowKeyDown(e) {
    // Activate on Enter / Space like a button, but ignore when the event came
    // from an inner control (buttons handle their own activation).
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEdit();
    }
  }

  return (
    <li
      className={`item-row status-${status}`}
      onClick={openEdit}
      onKeyDown={onRowKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${item.name}`}
    >
      <div className="item-main">
        <IngredientIcon name={item.name} />
        <span className="item-text">
          <span className="item-name">{item.name}</span>
          {item.quantity && <span className="item-qty">{item.quantity}</span>}
        </span>
      </div>

      <div className="item-side">
        <span className={`badge badge-${status}`}>{label}</span>
        <span className="item-detail">{detail}</span>

        {/* Edit + Delete grouped in the single action cell so the four-track
            row grid alignment is preserved. Both stopPropagation. */}
        <span className="item-actions">
          <button
            type="button"
            className="btn btn-edit"
            aria-label={`Edit ${item.name}`}
            onClick={(e) => {
              e.stopPropagation();
              openEdit();
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>

          <button
            type="button"
            className="btn btn-delete"
            aria-label={`${actionLabel} ${item.name}`}
            onClick={(e) => {
              // Never let the delete click bubble up to the row edit handler.
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            {actionLabel}
          </button>
        </span>
      </div>
    </li>
  );
}
