import { useState } from "react";
import { detectFoodFromImage } from "../lib/api.js";
import Icon from "./Icon.jsx";

// "Quick Add from Photo" — a collapsible panel inside My Pantry.
//
// Flow: pick a photo -> backend/Gemini detects food NAMES only -> user
// reviews/edits the names and MUST enter an expiry date per item before it
// can be added. Gemini never sets expiry dates and never judges safety.
// Confirmed items go through the same onAdd() as the manual form.

let rowKeySeq = 0;
function makeRow(name = "", expiryDate = "", packSize = "", looseCount = "") {
  rowKeySeq += 1;
  return {
    key: `qa-${Date.now()}-${rowKeySeq}`,
    name,
    expiryDate,
    quantity: "", // "Quantity remaining" — always manual, never auto-filled.
    // True when the date was pre-filled from a date printed on the packaging.
    dateDetected: expiryDate !== "",
    // Informational detected hints only — these never populate `quantity`.
    packSize,
    looseCount,
  };
}

export default function QuickAddPhoto({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewRows, setReviewRows] = useState([]);
  const [noResults, setNoResults] = useState(false);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    // Allow re-selecting the same file later.
    e.target.value = "";
    if (!file) return;

    setStatus("loading");
    setErrorMessage("");
    setNoResults(false);
    try {
      const foods = await detectFoodFromImage(file);
      setReviewRows(
        foods.map((f) => makeRow(f.name, f.expiryDate, f.packSize, f.looseCount))
      );
      setNoResults(foods.length === 0);
      setStatus("idle");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function updateRow(key, patch) {
    setReviewRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  }

  function removeRow(key) {
    setReviewRows((rows) => rows.filter((r) => r.key !== key));
  }

  function addAnotherRow() {
    setReviewRows((rows) => [...rows, makeRow("")]);
  }

  function confirmRow(row) {
    const name = row.name.trim();
    // Guard: name and a manually-entered expiry date are both required.
    if (!name || !row.expiryDate) return;
    onAdd({ name, expiryDate: row.expiryDate, quantity: row.quantity.trim() });
    removeRow(row.key);
  }

  return (
    <div className="quick-add">
      <button
        type="button"
        className="quick-add-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>
          <Icon name="camera" /> Quick Add from Photo
        </span>
        <span className="quick-add-chevron" aria-hidden="true">
          {open ? <Icon name="chevronUp" /> : <Icon name="chevronDown" />}
        </span>
      </button>

      {open && (
        <div className="quick-add-body">
          <p className="quick-add-note">
            Snap or upload a photo of your groceries. We'll suggest the food
            names — you review them and add an expiry date yourself. Detected
            names are AI-suggested, so please double-check them.
          </p>

          <label className="btn btn-secondary quick-add-pick">
            {status === "loading" ? "Scanning your photo…" : "Choose or take a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFile}
              disabled={status === "loading"}
              hidden
            />
          </label>

          {status === "error" && (
            <div className="rescue-error" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}

          {noResults && status !== "loading" && (
            <p className="quick-add-empty">
              No foods detected. You can add items manually below, or try a
              clearer photo.
            </p>
          )}

          {reviewRows.length > 0 && (
            <div className="quick-add-review">
              <h4>Review detected foods</h4>
              <ul className="qa-list">
                {reviewRows.map((row) => {
                  const ready = row.name.trim() !== "" && row.expiryDate !== "";
                  return (
                    <li key={row.key} className="qa-row">
                      <div className="qa-fields">
                        <label className="field">
                          <span>Food name</span>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updateRow(row.key, { name: e.target.value })}
                            placeholder="e.g. Spinach"
                          />
                        </label>

                        <label className="field">
                          <span>Expiry date</span>
                          <input
                            type="date"
                            value={row.expiryDate}
                            onChange={(e) =>
                              updateRow(row.key, {
                                expiryDate: e.target.value,
                                dateDetected: false,
                              })
                            }
                          />
                          {row.dateDetected && (
                            <span className="qa-date-hint">
                              Detected from packaging — please check it
                            </span>
                          )}
                        </label>

                        <label className="field">
                          <span>Quantity remaining <em>(optional)</em></span>
                          <input
                            type="text"
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(row.key, { quantity: e.target.value })
                            }
                            placeholder="e.g. 500g"
                          />
                          {row.packSize && (
                            <span className="qa-size-hint">
                              Pack size detected: {row.packSize}
                            </span>
                          )}
                          {row.looseCount && (
                            <span className="qa-size-hint">
                              Count detected: {row.looseCount}
                            </span>
                          )}
                        </label>
                      </div>

                      <div className="qa-row-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => confirmRow(row)}
                          disabled={!ready}
                          title={ready ? "" : "Enter a name and expiry date first"}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="btn btn-delete"
                          onClick={() => removeRow(row.key)}
                          aria-label={`Remove ${row.name || "item"} from review`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button type="button" className="btn btn-secondary" onClick={addAnotherRow}>
                + Add another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
