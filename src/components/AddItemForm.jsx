import { useState } from "react";

// Form to add a new pantry item: food name, expiry date, optional quantity.
// Calls onAdd({ name, expiryDate, quantity }) when submitted with valid input.
export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a food name.");
      return;
    }
    if (!expiryDate) {
      setError("Please choose an expiry date.");
      return;
    }

    onAdd({
      name: trimmedName,
      expiryDate,
      quantity: quantity.trim(),
    });

    // reset for the next entry
    setName("");
    setExpiryDate("");
    setQuantity("");
    setError("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-fields">
        <label className="field">
          <span>Food name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spinach"
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

        <label className="field">
          <span>Quantity <em>(optional)</em></span>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 500g"
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary">
        Add to pantry
      </button>
    </form>
  );
}
