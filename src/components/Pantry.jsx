import AddItemForm from "./AddItemForm.jsx";
import PantryItemRow from "./PantryItemRow.jsx";
import QuickAddPhoto from "./QuickAddPhoto.jsx";
import { sortItems, classify, daysUntilExpiry, STATUS } from "../lib/expiry.js";

// Compact, read-only status legend. Purely presentational — it describes the
// existing classification rules without changing any thresholds.
function StatusLegend() {
  return (
    <div className="status-legend" aria-label="What the status colours mean">
      <span className="legend-item">
        <span className="legend-dot legend-dot-use-soon" aria-hidden="true" />
        <strong>Use Soon</strong> expires within 3 days
      </span>
      <span className="legend-item">
        <span className="legend-dot legend-dot-fresh" aria-hidden="true" />
        <strong>Fresh</strong> more than 3 days remaining
      </span>
      <span className="legend-item">
        <span className="legend-dot legend-dot-expired" aria-hidden="true" />
        <strong>Expired</strong> expiry date has passed
      </span>
    </div>
  );
}

// "Use First" summary. Shows ONLY Use Soon items (expired excluded), ordered
// by soonest expiry, with a count. If there are none, shows a subtle positive
// line. Derived from the existing classify/daysUntilExpiry logic — no new
// thresholds or reclassification.
function UseFirstSummary({ items }) {
  const useSoon = items
    .filter((item) => classify(item) === STATUS.USE_SOON)
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  if (useSoon.length === 0) {
    return (
      <p className="use-first-ok" role="status">
        Nothing needs urgent use.
      </p>
    );
  }

  return (
    <div className="use-first" role="status">
      <div className="use-first-head">
        <span className="use-first-icon" aria-hidden="true">
          ⏰
        </span>
        <strong>Use First ({useSoon.length})</strong>
      </div>
      <p className="use-first-names">
        {useSoon.map((item) => item.name).join(" · ")}
      </p>
    </div>
  );
}

// "My Pantry" section: add form plus the sorted list of items.
// Sorting (Use Soon -> Fresh -> Expired) is applied at render time so the
// list always reflects the current date.
export default function Pantry({ items, onAdd, onDelete }) {
  const sorted = sortItems(items);

  return (
    <section className="card">
      <h2>My Pantry</h2>
      <p className="section-sub">
        Add what you have at home. Items that need using soon rise to the top.
      </p>

      <StatusLegend />

      {/* Use First summary only renders meaningfully when items exist. */}
      {items.length > 0 && <UseFirstSummary items={items} />}

      <QuickAddPhoto onAdd={onAdd} />

      <AddItemForm onAdd={onAdd} />

      {sorted.length === 0 ? (
        <p className="empty-state">
          Your pantry is empty. Add a food item above to get started.
        </p>
      ) : (
        <ul className="item-list">
          {sorted.map((item) => (
            <PantryItemRow key={item.id} item={item} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
