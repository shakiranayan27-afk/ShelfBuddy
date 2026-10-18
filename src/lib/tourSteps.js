// The four onboarding tour steps. Copy and target selectors live here so the
// Tour component stays purely about behaviour.
//
// `view` tells the tour which Pantry/Calendar view must be active for the
// target to exist ("pantry" or "calendar"). The tour switches to it before
// highlighting, then resets to "pantry" when it finishes or is skipped.

export const TOUR_STEPS = [
  {
    id: "use-first",
    target: '[data-tour="use-first"]',
    view: "pantry",
    title: "Use First",
    body: "ShelfBuddy highlights the ingredients you should use first, so nothing gets forgotten before it expires.",
  },
  {
    id: "quick-add",
    target: '[data-tour="quick-add"]',
    view: "pantry",
    title: "Quick Add from Photo",
    body: "Snap or upload a photo. ShelfBuddy suggests the food and any printed details — you review and confirm before anything is added.",
  },
  {
    id: "calendar",
    target: '[data-tour="calendar"]',
    view: "calendar",
    title: "Expiry Calendar",
    body: "See what expires on each date at a glance, colour-coded by how soon it needs using.",
  },
  {
    id: "dietary",
    target: '[data-tour="dietary"]',
    view: "pantry",
    title: "Dietary Preferences",
    body: "Choose a dietary preference before generating a meal. ShelfBuddy will respect it when creating your suggestion.",
  },
  {
    id: "smart-meal",
    target: '[data-tour="smart-meal"]',
    view: "pantry",
    title: "Smart Meal Suggestion",
    body: "Generate an AI recipe that prioritises the ingredients that need using first, while respecting your dietary preference.",
  },
];
