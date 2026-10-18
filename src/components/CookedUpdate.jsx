import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { matchUsedPantryItems } from "../lib/recipeMatch.js";
import { computeDeduction, formatAmount } from "../lib/quantity.js";

// "Update pantry after cooking" — compact, calculated, user-confirmed flow.
//
// Default state: each safely-calculated row shows only "Current → Proposed"
// with a small Edit action. Fields appear only when the user clicks Edit.
// Rows ShelfBuddy can't calculate safely are labelled "Review manually" and
// show their editable controls immediately.
//
// Nothing changes until "Confirm pantry update". All calculation logic
// (servings amounts, kg<->g, L<->ml, used</=/> available) is unchanged.

const REVIEW_REASON = {
  "no-parse": "current quantity isn't recorded clearly",
  "dimension-mismatch": "recipe unit doesn't match the stored unit",
  overdraw: "recipe needs more than recorded",
  "bad-used": "couldn't calculate",
};

function proposedLabel(proposal) {
  if (proposal.status === "used-up") return "Used up";
  if (proposal.status === "deduct") return proposal.remainingLabel;
  return null; // review
}

// Append the unit to a numeric amount string. "count" stays unitless.
function withUnit(amountStr, unit) {
  if (amountStr === "") return "";
  if (!unit || unit === "count") return amountStr;
  return `${amountStr}${unit}`;
}

function buildRows(matched) {
  return matched.map(({ item, usedAmount, usedUnit }) => {
    const d = computeDeduction(item.quantity, usedAmount, usedUnit);
    const isReview = d.status === "review";
    // For safely-calculated rows we know the unit (the pantry item's original
    // unit, preserved through the deduction). Review rows have no safe unit.
    const calcUnit = d.status === "deduct" ? d.remainingUnit : null;
    return {
      id: item.id,
      name: item.name,
      currentLabel: item.quantity || "no quantity recorded",
      usedLabel: `${usedAmount}${usedUnit === "count" ? "" : " " + usedUnit}`,
      proposal: d,
      isReview,
      // Review rows start expanded; calculated rows start collapsed.
      expanded: isReview,
      // The unit to persist for a calculated row (null for count / review).
      calcUnit,
      // The editable NUMBER only (unit shown as a fixed suffix for calc rows).
      remaining: d.status === "deduct" ? formatAmount(d.remainingAmount) : "",
      usedUp: d.status === "used-up",
    };
  });
}

const CookedUpdate = forwardRef(function CookedUpdate(
  { recipe, pantry, onUpdate, onDelete, onOpenChange, onComplete },
  ref
) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);

  const matched = useMemo(
    () => matchUsedPantryItems(pantry, recipe.pantryIngredientsUsed),
    [pantry, recipe.pantryIngredientsUsed]
  );

  function startFlow() {
    setRows(buildRows(matched));
    setOpen(true);
    onOpenChange?.(true);
  }

  // Let the parent trigger the flow from a grouped action bar, and tell it
  // whether there is anything matched to update.
  useImperativeHandle(ref, () => ({
    start: startFlow,
    hasMatches: () => matched.length > 0,
  }), [matched]);

  function cancelFlow() {
    setOpen(false);
    onOpenChange?.(false);
  }

  function setRow(id, patch) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleConfirm() {
    for (const row of rows) {
      if (row.usedUp) {
        onDelete(row.id);
        continue;
      }
      const remaining = row.remaining.trim();
      if (remaining !== "") {
        // Calculated rows: persist number + original unit (e.g. "80g",
        // "1.5L"; count stays unitless). Review rows: keep free text as typed.
        const quantity = row.isReview ? remaining : withUnit(remaining, row.calcUnit);
        onUpdate(row.id, { quantity });
      }
      // blank + not used up -> no change (covers untouched review rows)
    }
    setOpen(false);
    // Hand control back to the parent, which clears the recipe + review and
    // returns to the pantry workspace.
    onComplete?.();
  }

  // When closed, the parent's grouped action bar renders the trigger.
  if (!open) return null;

  return (
    <div className="cooked-panel">
      <h4>Update pantry after cooking</h4>
      <p className="cooked-sub">
        Review the proposed changes. Nothing changes until you press Confirm
        pantry update.
      </p>

      <ul className="cooked-list">
        {rows.map((row) => {
          const proposed = proposedLabel(row.proposal);
          return (
            <li key={row.id} className={`cooked-row ${row.isReview ? "is-review" : ""}`}>
              {/* Compact summary line */}
              <div className="cooked-summary">
                <span className="cooked-name">{row.name}</span>

                {row.isReview ? (
                  <span className="cooked-badge-review">
                    Review manually — {REVIEW_REASON[row.proposal.reason] || "review manually"}
                  </span>
                ) : (
                  <span className="cooked-change">
                    <span className="cooked-from">{row.currentLabel}</span>
                    <span className="cooked-arrow" aria-hidden="true">→</span>
                    <span className="cooked-to">{proposed}</span>
                  </span>
                )}

                {!row.isReview && (
                  <button
                    type="button"
                    className="cooked-edit"
                    onClick={() => setRow(row.id, { expanded: !row.expanded })}
                    aria-expanded={row.expanded}
                  >
                    {row.expanded ? "Done" : "Edit"}
                  </button>
                )}
              </div>

              {/* Expanded / review controls */}
              {row.expanded && (
                <div className="cooked-controls">
                  <span className="cooked-used">Recipe uses: {row.usedLabel}</span>
                  <label className="field cooked-remaining">
                    <span>Remaining quantity</span>
                    {row.isReview ? (
                      // Unknown/incompatible unit: free-text as before.
                      <input
                        type="text"
                        value={row.remaining}
                        disabled={row.usedUp}
                        onChange={(e) => setRow(row.id, { remaining: e.target.value })}
                        placeholder="e.g. 300ml"
                      />
                    ) : (
                      // Calculated row: editable number with a fixed unit
                      // suffix so editing can never strip the unit.
                      <span className="cooked-remaining-input">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.remaining}
                          disabled={row.usedUp}
                          onChange={(e) => setRow(row.id, { remaining: e.target.value })}
                          placeholder="0"
                        />
                        {row.calcUnit && row.calcUnit !== "count" && (
                          <span className="cooked-unit-suffix">{row.calcUnit}</span>
                        )}
                      </span>
                    )}
                  </label>
                  <label className="cooked-usedup">
                    <input
                      type="checkbox"
                      checked={row.usedUp}
                      onChange={(e) =>
                        setRow(row.id, {
                          usedUp: e.target.checked,
                          remaining: e.target.checked ? "" : row.remaining,
                        })
                      }
                    />
                    Used up
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="cooked-actions">
        <button type="button" className="btn btn-secondary" onClick={cancelFlow}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleConfirm}>
          Confirm pantry update
        </button>
      </div>
    </div>
  );
});

export default CookedUpdate;
