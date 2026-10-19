import IngredientIcon from "./IngredientIcon.jsx";
import { classify, describeExpiry, sortItems, STATUS } from "../lib/expiry.js";

// "Items expiring soon" card (mobile only). Shows up to the first 3 Use Soon
// items, soonest first. Uses ONLY the existing expiry utilities — no new
// expiry logic. Expiry text is amber (distinct from the expired red).
//
// If there are no Use Soon items the card is not rendered. The full pantry
// below always still contains every item regardless of this cap.
export default function ExpiringSoon({ items, onNavigate, onEditItem }) {
  const useSoon = sortItems(items)
    .filter((item) => classify(item) === STATUS.USE_SOON)
    .slice(0, 3);

  if (useSoon.length === 0) return null;

  return (
    <section className="m-expiring-card" aria-label="Items expiring soon">
      {/* Header row is a real button that scrolls to the Use First summary /
          top of the detailed pantry list where these items are visible. */}
      <button
        type="button"
        className="m-card-head m-card-head-btn"
        onClick={onNavigate}
        aria-label="Go to items that need using soon"
      >
        <h2>Items expiring soon</h2>
        <span className="m-card-chevron" aria-hidden="true">›</span>
      </button>

      <ul className="m-expiring-list">
        {useSoon.map((item) => {
          const { detail } = describeExpiry(item);
          return (
            <li key={item.id}>
              {/* The whole row is a button that opens the existing Edit Item
                  UI for THIS pantry item (desktop modal / mobile sheet). The
                  card header's own navigation is separate. */}
              <button
                type="button"
                className="m-expiring-row"
                onClick={() => onEditItem && onEditItem(item)}
                aria-label={`Edit ${item.name}`}
              >
                <IngredientIcon name={item.name} />
                <span className="m-expiring-text">
                  <span className="m-expiring-name">{item.name}</span>
                  <span className="m-expiring-detail">{detail}</span>
                </span>
                <span className="m-expiring-chevron" aria-hidden="true">›</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
