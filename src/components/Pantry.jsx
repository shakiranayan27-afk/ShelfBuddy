import AddItemForm from "./AddItemForm.jsx";
import PantryItemRow from "./PantryItemRow.jsx";
import { sortItems } from "../lib/expiry.js";

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
