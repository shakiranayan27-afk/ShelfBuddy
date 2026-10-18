import { describeExpiry, STATUS } from "../lib/expiry.js";

// A single pantry item: name, optional quantity, a coloured status badge
// (Expired / Use Soon / Fresh) with an expiry description, and a remove button.
// For expired items the action reads "Discard" (the food may still be in the
// cupboard); Fresh / Use Soon items keep "Delete".
export default function PantryItemRow({ item, onDelete }) {
  const { status, label, detail } = describeExpiry(item);
  const isExpired = status === STATUS.EXPIRED;
  const actionLabel = isExpired ? "Discard" : "Delete";

  return (
    <li className={`item-row status-${status}`}>
      <div className="item-main">
        <span className="item-name">{item.name}</span>
        {item.quantity && <span className="item-qty">{item.quantity}</span>}
      </div>

      <div className="item-side">
        <span className={`badge badge-${status}`}>{label}</span>
        <span className="item-detail">{detail}</span>
        <button
          type="button"
          className="btn btn-delete"
          aria-label={`${actionLabel} ${item.name}`}
          onClick={() => onDelete(item.id)}
        >
          {actionLabel}
        </button>
      </div>
    </li>
  );
}
