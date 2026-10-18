// Shared, application-authored icon component.
//
// Design contract (design.md §5 "Common icons"):
//   - A single stateless component owns every pictorial control/status icon.
//   - Primary (control) icons use a 20×20 viewBox; compact badge/status icons
//     use 16×16.
//   - Line icons use fill="none", stroke="currentColor", strokeWidth="2",
//     strokeLinecap/Linejoin="round". Colour comes from the surrounding text
//     colour via currentColor; sizing comes from the canonical `.icon`
//     primitive in styles.css.
//   - Icons are DECORATIVE BY DEFAULT (aria-hidden="true") because they sit
//     inside controls that already carry a visible label or an aria-label.
//   - Informative standalone icons may pass a `label`, which drops aria-hidden
//     and exposes the icon with role="img" + accessible text.
//
// No icon package or runtime dependency is introduced — the path map below is
// the only source of pictograms, and it is a small CLOSED set.

// Closed map of path content keyed by icon name. Each entry is the inner
// markup for a 24-unit coordinate space; the viewBox is normalised to the
// icon's coordinate system below so paths stay crisp at both 20 and 16.
const ICONS = {
  camera: (
    <>
      <path d="M3 9a2 2 0 0 1 2-2h2l1.5-2h7L19 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  utensils: (
    <>
      <path d="M6 3v7a2 2 0 0 0 2 2v9" />
      <path d="M10 3v4" />
      <path d="M18 3c-1.7 0-3 2-3 5s1.3 4 3 4v9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  pantry: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="12" y1="6" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="18" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9 12 3Z" />
      <path d="M18 15l.7 1.9L20.6 17.6 18.7 18.3 18 20.2 17.3 18.3 15.4 17.6 17.3 16.9 18 15Z" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3L2.5 20h19L12 3Z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-9 7-15 16-15 0 9-7 15-16 15Z" />
      <path d="M4 20C8 15 12 12 18 9" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M14 6l6 6-6 6" />
    </>
  ),
};

// Compact icons render inside small 16px status/badge contexts; everything
// else renders at the 20px control size supplied by the `.icon` primitive.
const COMPACT = new Set(["alert", "leaf", "clock"]);

export default function Icon({ name, label, compact, className = "", ...rest }) {
  const content = ICONS[name];
  if (!content) return null;

  const isCompact = compact ?? COMPACT.has(name);
  const size = isCompact ? 16 : 20;

  // Decorative by default: hidden from assistive tech because the surrounding
  // control already carries an accessible name. Pass `label` only for an
  // informative standalone icon.
  const accessibility = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": "true", focusable: "false" };

  return (
    <svg
      className={`icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...accessibility}
      {...rest}
    >
      {content}
    </svg>
  );
}
