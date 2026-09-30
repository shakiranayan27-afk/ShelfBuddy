import { describeExpiry } from "../lib/expiry.js";

// A single pantry item: name, optional quantity, a coloured status badge
// (Expired / Use Soon / Fresh) with an expiry description, and a delete button.
export default function PantryItemRow({ item, onDelete }) {
  const { status, label, detail } = describeExpiry(item);

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
          aria-label={`Delete ${item.name}`}
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
