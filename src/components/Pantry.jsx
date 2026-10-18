import { useState } from "react";
import AddItemForm from "./AddItemForm.jsx";
import PantryItemRow from "./PantryItemRow.jsx";
import QuickAddPhoto from "./QuickAddPhoto.jsx";
import Icon from "./Icon.jsx";
import { sortItems, classify, daysUntilExpiry, STATUS } from "../lib/expiry.js";

// Count of currently-expired items (recomputed from today on every render).
function countExpired(items) {
  return items.filter((item) => classify(item) === STATUS.EXPIRED).length;
}

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
          <Icon name="alert" />
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
export default function Pantry({ items, onAdd, onDelete, onLoadDemo, onDiscardExpired }) {
  // Live search query — filters the DISPLAYED list only; never mutates data.
  const [query, setQuery] = useState("");

  const sorted = sortItems(items);
  const expiredCount = countExpired(items);

  // Case-insensitive name filter applied after sorting. Covers all statuses
  // (Use Soon / Fresh / Expired) since it filters the full sorted list.
  const trimmedQuery = query.trim().toLowerCase();
  const visible = trimmedQuery
    ? sorted.filter((item) => item.name.toLowerCase().includes(trimmedQuery))
    : sorted;

  return (
    <section className="card pantry-card">
      <h2>My Pantry</h2>
      <p className="section-sub">
        Add what you have at home. Items that need using soon rise to the top.
      </p>

      {/* Grouped so the onboarding tour always has a stable "Use First"
          target, even when the pantry is empty on a first visit. */}
      <div data-tour="use-first">
        <StatusLegend />
        {items.length > 0 && <UseFirstSummary items={items} />}
      </div>

      {/* Entry region: Quick Add + Manual Add, grouped by a subtle surface
          shift (not another hard box). */}
      <div className="pantry-entry">
        <div data-tour="quick-add">
          <QuickAddPhoto onAdd={onAdd} />
        </div>

        <AddItemForm onAdd={onAdd} onLoadDemo={onLoadDemo} />
      </div>

      {/* List region: search integrates naturally above the records. */}
      {items.length > 0 && (
        <div className="pantry-controls">
          <div className="pantry-search">
            <span className="pantry-search-icon" aria-hidden="true">
              <Icon name="search" />
            </span>
            <input
              type="text"
              className="pantry-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pantry…"
              aria-label="Search pantry"
            />
          </div>

          {expiredCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary discard-expired-btn"
              onClick={onDiscardExpired}
            >
              Discard all expired ({expiredCount})
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty-state">
          Your pantry is empty. Add a food item above to get started.
        </p>
      ) : visible.length === 0 ? (
        <p className="empty-state">No pantry items match your search.</p>
      ) : (
        <ul className="item-list">
          {visible.map((item) => (
            <PantryItemRow key={item.id} item={item} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
