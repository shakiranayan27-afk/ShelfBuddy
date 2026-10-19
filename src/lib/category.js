// Food category helper (pure, derived — no persisted data).
//
// Maps a pantry item NAME to one of four summary categories used by the mobile
// "Your Pantry" card. This never stores anything: counts are computed from the
// live items array at render time. Items that match none of the four return
// null and simply don't contribute to any summary count.
//
// Keyword matching is intentionally the same spirit as IngredientIcon.jsx so
// the summary tiles and the detailed pantry rows agree about what an item is.

export const CATEGORY = {
  FRUIT_VEG: "fruitVeg",
  GRAINS: "grains",
  DAIRY: "dairy",
  PROTEINS: "proteins",
};

// Ordered keyword lists. First matching category wins. Proteins and dairy are
// checked before fruit/veg so e.g. "chicken" or "milk" aren't shadowed.
const RULES = [
  [
    CATEGORY.PROTEINS,
    [
      "egg", "chicken", "turkey", "beef", "pork", "lamb", "mince", "sausage",
      "bacon", "ham", "meat", "fish", "salmon", "tuna", "prawn", "shrimp",
      "tofu", "lentil", "chickpea",
    ],
  ],
  [
    CATEGORY.DAIRY,
    ["milk", "yogurt", "yoghurt", "cheese", "cheddar", "butter", "cream", "custard"],
  ],
  [
    CATEGORY.GRAINS,
    [
      "rice", "bread", "loaf", "baguette", "bun", "roll", "toast", "pasta",
      "noodle", "oat", "cereal", "flour", "quinoa", "couscous", "barley", "grain",
    ],
  ],
  [
    CATEGORY.FRUIT_VEG,
    [
      "carrot", "tomato", "potato", "lettuce", "spinach", "kale", "cabbage",
      "rocket", "salad", "onion", "pepper", "cucumber", "broccoli", "cauliflower",
      "courgette", "zucchini", "pea", "bean", "corn", "mushroom", "celery",
      "leek", "garlic", "banana", "apple", "orange", "berry", "strawberr",
      "grape", "melon", "mango", "pear", "peach", "lemon", "lime", "kiwi",
      "pineapple", "avocado", "fruit", "veg",
    ],
  ],
];

// Resolve an item name to a category key, or null if it matches none.
export function categorize(name) {
  const n = (name || "").toLowerCase();
  for (const [key, keywords] of RULES) {
    if (keywords.some((k) => n.includes(k))) return key;
  }
  return null;
}

// Count the current items per category. Pure: derived entirely from `items`.
export function categoryCounts(items) {
  const counts = {
    [CATEGORY.FRUIT_VEG]: 0,
    [CATEGORY.GRAINS]: 0,
    [CATEGORY.DAIRY]: 0,
    [CATEGORY.PROTEINS]: 0,
  };
  for (const item of items || []) {
    const key = categorize(item.name);
    if (key) counts[key] += 1;
  }
  return counts;
}
