// Ingredient icon system (presentation only).
//
// Renders a small, soft, flat illustration for a pantry item inside a rounded
// icon tile. Nothing here touches expiry/pantry/recipe logic — it only maps an
// item name to a decorative pictogram for display.
//
// Resolution order (first match wins):
//   1. Specific ingredient keyword (tomato, carrot, bread, milk, ...).
//   2. Category keyword fallback (vegetable, fruit, dairy, grain, meat, staple).
//   3. Generic food icon for anything unknown.
//
// All icons are inline SVG (no image files, no runtime dependency). They share
// a 24×24 coordinate space and use the app palette via currentColor-free fixed
// fills so each ingredient keeps its recognisable, friendly colour.

/* ------------------------------------------------------------------ icons */
/* Each icon is a small flat illustration. Kept simple and rounded to match a
   modern food app. Colours are soft, drawn from the ShelfBuddy green/cream
   family plus muted natural ingredient tones. */

const Tomato = () => (
  <>
    <path d="M12 6c-4 0-7 2.8-7 7.2S8 20 12 20s7-2.4 7-6.8S16 6 12 6Z" fill="#e5533c" />
    <path d="M12 6c-.3-1.6.5-2.9 2.2-3.4-.2 1.7-1 2.8-2.2 3.4Z" fill="#3f9d55" />
    <path d="M12 6c-1.1-.6-1.9-1.7-2.1-3.3C11.5 3.1 12.3 4.4 12 6Z" fill="#3f9d55" />
    <circle cx="9.3" cy="12" r="1.1" fill="#ff8a6e" opacity="0.8" />
  </>
);

const Carrot = () => (
  <>
    <path d="M7 17.5 15.5 9l1.8 1.8L8.8 19.3a1.3 1.3 0 0 1-1.8-1.8Z" fill="#e8822e" />
    <path d="M16.2 7.8c.9-.9 2.4-1.1 3.6-.4-.3 1.3-1.4 2.2-2.7 2.3Z" fill="#3f9d55" />
    <path d="M15.2 6.6c.3-1.2 1.4-2.1 2.7-2.1-.1 1.3-.9 2.4-2.1 2.8Z" fill="#4fae63" />
    <path d="M10.4 12.5l1.3 1.3M8.8 14.1l1.3 1.3" stroke="#c96a1f" strokeWidth="1" strokeLinecap="round" />
  </>
);

const Bread = () => (
  <>
    <path d="M5 11c0-2.8 3-4.5 7-4.5S19 8.2 19 11v5.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" fill="#e3ad5e" />
    <path d="M5 11c0-2.8 3-4.5 7-4.5S19 8.2 19 11c-1.8-1-3.8-1.4-7-1.4S6.8 10 5 11Z" fill="#f0c680" />
    <path d="M9 13.5v2M12 13.5v2M15 13.5v2" stroke="#c98f3f" strokeWidth="1" strokeLinecap="round" />
  </>
);

const Milk = () => (
  <>
    <path d="M9 7.5 10 4h4l1 3.5V19a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z" fill="#eef4f7" stroke="#b9ccd6" strokeWidth="1" />
    <path d="M9 11h6v4H9Z" fill="#8ec8e8" />
    <path d="M10.5 4h3" stroke="#b9ccd6" strokeWidth="1" strokeLinecap="round" />
  </>
);

const Eggs = () => (
  <>
    <ellipse cx="9.5" cy="14" rx="4" ry="5" fill="#fdfaf2" stroke="#e6dcc4" strokeWidth="1" />
    <ellipse cx="15" cy="12.5" rx="3.4" ry="4.3" fill="#fdfaf2" stroke="#e6dcc4" strokeWidth="1" />
    <circle cx="15" cy="12.5" r="1.6" fill="#f6c343" />
  </>
);

const Chicken = () => (
  <>
    <path d="M6.5 17.5c-1.2-1.2-1.2-3.4.6-5.1C9 10.5 12 9.5 14.5 9.5c2.8 0 4 1.6 4 3.4 0 2.6-2.8 5.1-6.4 5.1-2.3 0-4.3-.3-5.6-.5Z" fill="#f2c9a0" />
    <path d="M6.6 17.6 4.4 19.8M5.5 16.4 3.4 18.5" stroke="#e6e0d2" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="13.5" cy="12.8" r="1" fill="#d99a66" opacity="0.7" />
  </>
);

const Cheese = () => (
  <>
    <path d="M4 15 14 7l5 2.2V15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" fill="#f4c64a" />
    <path d="M4 15 14 7l5 2.2L4 15Z" fill="#f7d770" />
    <circle cx="8" cy="13.5" r="1" fill="#e2a81f" />
    <circle cx="13" cy="12.5" r="1.2" fill="#e2a81f" />
    <circle cx="11" cy="14.2" r="0.7" fill="#e2a81f" />
  </>
);

const Potato = () => (
  <>
    <path d="M6 13c0-3 2.6-5 6-5s6 1.6 6 4.4c0 3.2-2.8 5.1-6.3 5.1C8.4 17.5 6 15.8 6 13Z" fill="#cda36a" />
    <circle cx="9.5" cy="12" r="0.8" fill="#9c7641" opacity="0.7" />
    <circle cx="13.5" cy="13.5" r="0.7" fill="#9c7641" opacity="0.7" />
    <circle cx="12" cy="11" r="0.6" fill="#9c7641" opacity="0.6" />
  </>
);

const Rice = () => (
  <>
    <path d="M6 12h12l-1.3 6.2a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8Z" fill="#eef1ee" stroke="#c8d2c8" strokeWidth="1" />
    <path d="M6 12c0-1.6 2.7-3 6-3s6 1.4 6 3Z" fill="#fff" stroke="#c8d2c8" strokeWidth="1" />
    <path d="M9.5 10.3l1-1M12 10l1-1M14.3 10.4l1-1" stroke="#b7c2b7" strokeWidth="1" strokeLinecap="round" />
  </>
);

const Lettuce = () => (
  <>
    <path d="M5 13c0-3.5 3-6 7-6s7 2.3 7 5.6c0 .8-.6 1.4-1.4 1.4-1 2.4-3.1 3.5-5.6 3.5S6.4 16.2 5.6 14C5.2 13.9 5 13.5 5 13Z" fill="#5fb96e" />
    <path d="M8 11c1.3-1.4 2.6-2 4-2M10 15c1.4-.4 2.6-1.3 3.4-2.6" stroke="#3f9d55" strokeWidth="1" strokeLinecap="round" fill="none" />
  </>
);

const Banana = () => (
  <>
    <path d="M5 9c1.5 6 5.5 9 11.5 8.8-.3 1-1.2 1.6-2.4 1.6C8.8 19.4 4.4 15 4 9.3 4 8.7 4.4 8.6 5 9Z" fill="#f4cf3d" />
    <path d="M5 9c1.5 6 5.5 8.8 11.5 8.8" stroke="#d9ad24" strokeWidth="1" fill="none" />
    <path d="M4.5 8.8 4 7.4" stroke="#8a6d1a" strokeWidth="1.4" strokeLinecap="round" />
  </>
);

/* -------------------------------------------------------- category icons */

const Vegetable = Lettuce; // leafy green stands in for the veg category
const Fruit = () => (
  <>
    <path d="M12 7c-3 0-5 2-5 5.2S9 19 12 19s5-2.6 5-6.8S15 7 12 7Z" fill="#ef5f7a" />
    <path d="M12 7c0-1.4.9-2.4 2.3-2.7C14.1 5.7 13.3 6.7 12 7Z" fill="#3f9d55" />
    <circle cx="9.6" cy="12.4" r="1" fill="#ff8ea2" opacity="0.8" />
  </>
);
const Dairy = Milk;
const Grain = () => (
  <>
    <path d="M12 4v15" stroke="#caa24f" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 7c-1.6-.6-3-.3-3.6 1 1.6.6 3 .3 3.6-1ZM12 7c1.6-.6 3-.3 3.6 1-1.6.6-3 .3-3.6-1ZM12 11c-1.6-.6-3-.3-3.6 1 1.6.6 3 .3 3.6-1ZM12 11c1.6-.6 3-.3 3.6 1-1.6.6-3 .3-3.6-1ZM12 15c-1.6-.6-3-.3-3.6 1 1.6.6 3 .3 3.6-1ZM12 15c1.6-.6 3-.3 3.6 1-1.6.6-3 .3-3.6-1Z" fill="#e3ad5e" />
  </>
);
const Meat = Chicken;
const Staple = () => (
  <>
    <path d="M7 9h10l-.8 9a1 1 0 0 1-1 .9H8.8a1 1 0 0 1-1-.9Z" fill="#e9ddc4" stroke="#cdbd98" strokeWidth="1" />
    <rect x="9.5" y="5.5" width="5" height="3.5" rx="0.6" fill="#f3ecda" stroke="#cdbd98" strokeWidth="1" />
    <path d="M9.5 12.5h5" stroke="#cdbd98" strokeWidth="1" strokeLinecap="round" />
  </>
);

/* ------------------------------------------------------------- generic */
const Generic = () => (
  <>
    <circle cx="12" cy="12.5" r="6" fill="#bfe6c6" />
    <path d="M9.5 11c.6-.9 1.5-1.4 2.5-1.4s1.9.5 2.5 1.4" stroke="#3f9d55" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="14.3" r="1" fill="#3f9d55" />
  </>
);

/* --------------------------------------------------------- keyword maps */
/* Order matters only within the lookup function (specific before category).
   Keys are lowercase substrings matched against the item name. */

const SPECIFIC = [
  [["tomato", "cherry tomato", "passata"], Tomato],
  [["carrot"], Carrot],
  [["bread", "loaf", "baguette", "bun", "roll", "toast"], Bread],
  [["milk"], Milk],
  [["egg"], Eggs],
  [["chicken", "turkey"], Chicken],
  [["cheddar", "cheese"], Cheese],
  [["potato", "potatoes", "spud"], Potato],
  [["rice"], Rice],
  [["lettuce", "spinach", "kale", "salad", "cabbage", "rocket"], Lettuce],
  [["banana"], Banana],
];

const CATEGORY = [
  [
    [
      "veg", "onion", "pepper", "cucumber", "broccoli", "cauliflower",
      "courgette", "zucchini", "pea", "bean", "corn", "mushroom", "celery",
      "leek", "garlic",
    ],
    Vegetable,
  ],
  [
    [
      "fruit", "apple", "orange", "berry", "strawberr", "grape", "melon",
      "mango", "pear", "peach", "lemon", "lime", "kiwi", "pineapple", "avocado",
    ],
    Fruit,
  ],
  [["dairy", "yoghurt", "yogurt", "butter", "cream", "custard"], Dairy],
  [
    ["grain", "pasta", "noodle", "oat", "cereal", "flour", "quinoa", "couscous", "barley"],
    Grain,
  ],
  [
    ["meat", "beef", "pork", "lamb", "mince", "sausage", "bacon", "ham", "fish", "salmon", "tuna", "prawn", "tofu"],
    Meat,
  ],
  [
    ["staple", "tin", "can", "sauce", "oil", "spice", "stock", "sugar", "salt", "honey", "jam", "soup"],
    Staple,
  ],
];

// Resolve an item name to an icon component (never returns null).
function resolveIcon(name) {
  const n = (name || "").toLowerCase();

  for (const [keywords, Comp] of SPECIFIC) {
    if (keywords.some((k) => n.includes(k))) return Comp;
  }
  for (const [keywords, Comp] of CATEGORY) {
    if (keywords.some((k) => n.includes(k))) return Comp;
  }
  return Generic;
}

// Public component: a soft rounded tile holding the resolved ingredient icon.
// Decorative — the item name beside it carries the accessible text.
export default function IngredientIcon({ name }) {
  const Glyph = resolveIcon(name);
  return (
    <span className="ingredient-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24" role="presentation">
        <Glyph />
      </svg>
    </span>
  );
}
