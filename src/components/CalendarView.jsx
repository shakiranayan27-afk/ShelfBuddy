import { useMemo, useState } from "react";
import Icon from "./Icon.jsx";
import IngredientIcon from "./IngredientIcon.jsx";
import { classify, describeExpiry, STATUS } from "../lib/expiry.js";

// Read-only monthly expiry calendar. Reuses the existing pantry `items` and
// the existing expiry logic (classify/describeExpiry) — it defines no new
// thresholds and never mutates data.

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Build a "YYYY-MM-DD" string from numeric parts (local, no Date parsing).
function ymd(year, month /* 0-based */, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// Friendly "19 October" label from a "YYYY-MM-DD" string. Parsed from the
// string parts (no Date timezone drift). Presentation only.
function friendlyDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MONTHS[m - 1]}`;
}

// Highest-priority status among a day's items, for the cell's accent.
// Use Soon outranks Expired outranks Fresh for visual attention.
function cellAccent(items) {
  if (items.some((i) => classify(i) === STATUS.USE_SOON)) return STATUS.USE_SOON;
  if (items.some((i) => classify(i) === STATUS.EXPIRED)) return STATUS.EXPIRED;
  return STATUS.FRESH;
}

export default function CalendarView({ items }) {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-based
  });
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD" | null

  // Group items by their stored expiryDate string. Compared as strings, so
  // there is no timezone drift from the user's typed date.
  const itemsByDate = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!item.expiryDate) continue;
      if (!map.has(item.expiryDate)) map.set(item.expiryDate, []);
      map.get(item.expiryDate).push(item);
    }
    return map;
  }, [items]);

  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  // Grid math for the viewed month.
  const firstWeekday = new Date(view.year, view.month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  // Leading blanks + day numbers.
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function stepMonth(delta) {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function goToday() {
    setView({ year: today.getFullYear(), month: today.getMonth() });
  }

  const selectedItems = selectedDate ? itemsByDate.get(selectedDate) || [] : [];

  return (
    <section className="card calendar-card" data-tour="calendar">
      <div className="cal-header">
        <h2>Calendar</h2>
        <div className="cal-nav">
          <button type="button" className="btn btn-secondary" onClick={() => stepMonth(-1)} aria-label="Previous month">
            <Icon name="chevronLeft" />
          </button>
          <span className="cal-month">
            {MONTHS[view.month]} {view.year}
          </span>
          <button type="button" className="btn btn-secondary" onClick={() => stepMonth(1)} aria-label="Next month">
            <Icon name="chevronRight" />
          </button>
          <button type="button" className="btn btn-secondary cal-today" onClick={goToday}>
            Today
          </button>
        </div>
      </div>

      <div className="cal-grid cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`b-${idx}`} className="cal-cell cal-cell-empty" />;

          const dateStr = ymd(view.year, view.month, day);
          const dayItems = itemsByDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const accent = dayItems.length ? cellAccent(dayItems) : null;

          return (
            <button
              type="button"
              key={dateStr}
              className={`cal-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelectedDate(dateStr)}
              aria-label={`${MONTHS[view.month]} ${day}, ${dayItems.length} item(s) expiring`}
            >
              <span className="cal-daynum">{day}</span>

              {dayItems.length > 0 && (
                /* Shared cell content: up to two ingredient ENTRIES plus "+N".
                   Each entry carries an icon + name + quantity. On mobile the
                   name/quantity are hidden via CSS (compact overlapping icons);
                   on desktop/tablet they are shown beside/under the icon. The
                   status accent underline keeps fresh/use-soon/expired meaning. */
                <span className={`cal-icons status-${accent}`} aria-hidden="true">
                  {dayItems.slice(0, 2).map((it) => (
                    <span className="cal-entry" key={it.id}>
                      <span className="cal-icon">
                        <IngredientIcon name={it.name} />
                      </span>
                      <span className="cal-entry-text">
                        <span className="cal-entry-name">{it.name}</span>
                        {it.quantity && (
                          <span className="cal-entry-qty">{it.quantity}</span>
                        )}
                      </span>
                    </span>
                  ))}
                  {dayItems.length > 2 && (
                    <span className="cal-icon-more">+{dayItems.length - 2}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected-day detail panel. The friendly date heading ("19 October")
          shows on mobile; desktop keeps its "Expiring on YYYY-MM-DD" heading
          via the two spans below (CSS picks which to show). Each row carries an
          ingredient illustration (mobile) + name + quantity + the existing
          expiry description, all from describeExpiry — no new expiry logic. */}
      {selectedDate && (
        <div className="cal-detail">
          <h3>
            <span className="cal-detail-date-desktop">Expiring on {selectedDate}</span>
            <span className="cal-detail-date-mobile">{friendlyDate(selectedDate)}</span>
          </h3>
          {selectedItems.length === 0 ? (
            <p className="cal-detail-empty">Nothing expires on this day.</p>
          ) : (
            <ul className="cal-detail-list">
              {selectedItems.map((item) => {
                const { status, label, detail } = describeExpiry(item);
                return (
                  <li key={item.id} className="cal-detail-item">
                    <span className="cal-detail-icon" aria-hidden="true">
                      <IngredientIcon name={item.name} />
                    </span>
                    <span className="cal-detail-text">
                      <span className="cal-detail-name">
                        {item.name}
                        {item.quantity && <span className="item-qty"> · {item.quantity}</span>}
                      </span>
                      <span className={`cal-detail-expiry status-${status}`}>{detail}</span>
                    </span>
                    <span className={`badge badge-${status}`}>{label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
