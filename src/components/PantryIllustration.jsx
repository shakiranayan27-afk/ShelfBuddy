// Custom, dependency-free pantry illustration for the hero's right column.
//
// A single inline SVG depicting a modern pantry cupboard: shelves, jars with
// dry goods, fresh produce, and leaves. Purely decorative (aria-hidden) and
// built only from palette-backed classes — no external image, embedded font,
// blurred blob, interactivity, or text. Colours come from styles.css via the
// `.pantry-illustration__*` classes so the scene stays on-brand.
export default function PantryIllustration() {
  return (
    <svg
      className="pantry-illustration"
      viewBox="0 0 560 420"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {/* Soft organic backdrop arch */}
      <path
        className="pi-backdrop"
        d="M80 70 C80 0 480 0 480 70 C540 120 540 340 480 372 C360 430 200 430 80 372 C20 340 20 120 80 70 Z"
      />

      {/* Floating leaves behind the cabinet */}
      <g className="pi-leaf pi-leaf--back" data-kind="leaf">
        <path d="M470 60 C505 48 540 60 548 96 C512 104 480 92 470 60 Z" />
        <path className="pi-leaf-vein" d="M470 60 C500 70 522 82 540 96" />
      </g>

      {/* Cabinet */}
      <g className="pi-cabinet">
        <rect className="pi-frame" x="120" y="86" width="320" height="286" rx="30" />
        <rect className="pi-frame-inner" x="140" y="106" width="280" height="246" rx="18" />

        {/* Shelves */}
        <rect className="pi-shelf" data-kind="shelf" x="140" y="200" width="280" height="12" rx="6" />
        <rect className="pi-shelf" data-kind="shelf" x="140" y="290" width="280" height="12" rx="6" />

        {/* Top shelf: two jars + a lemon */}
        <g className="pi-jar" data-kind="jar">
          <rect className="pi-jar-lid" x="168" y="128" width="46" height="16" rx="6" />
          <rect className="pi-jar-glass" x="166" y="142" width="50" height="54" rx="12" />
          <rect className="pi-jar-fill pi-fill-lentil" x="172" y="166" width="38" height="26" rx="8" />
        </g>
        <g className="pi-jar" data-kind="jar">
          <rect className="pi-jar-lid" x="236" y="122" width="46" height="16" rx="6" />
          <rect className="pi-jar-glass" x="234" y="136" width="50" height="60" rx="12" />
          <rect className="pi-jar-fill pi-fill-pasta" x="240" y="156" width="38" height="36" rx="8" />
        </g>
        <g className="pi-produce pi-lemon" data-kind="produce">
          <ellipse cx="360" cy="170" rx="30" ry="26" />
          <path className="pi-leaf-vein" d="M352 148 q10 -10 20 -2" />
        </g>

        {/* Bottom shelf: tall jar, tomato, carrot */}
        <g className="pi-jar" data-kind="jar">
          <rect className="pi-jar-lid" x="170" y="222" width="44" height="15" rx="6" />
          <rect className="pi-jar-glass" x="168" y="236" width="48" height="52" rx="12" />
          <rect className="pi-jar-fill pi-fill-herb" x="174" y="252" width="36" height="34" rx="8" />
        </g>
        <g className="pi-produce pi-tomato" data-kind="produce">
          <circle cx="268" cy="262" r="26" />
          <circle className="pi-tomato-shine" cx="259" cy="253" r="7" />
          <path className="pi-stem" d="M268 236 l-7 -9 m7 9 l7 -9 m-7 9 v-11" />
        </g>
        <g className="pi-produce pi-carrot" data-kind="produce">
          <path className="pi-carrot-root" d="M352 246 l26 6 -20 40 Z" />
          <path className="pi-carrot-top" d="M352 246 q-6 -16 6 -22 m-6 22 q-12 -10 -4 -22 m4 22 q2 -18 14 -18" />
        </g>
      </g>

      {/* Cabinet feet */}
      <rect className="pi-foot" x="150" y="372" width="22" height="20" rx="6" />
      <rect className="pi-foot" x="388" y="372" width="22" height="20" rx="6" />

      {/* Front floating leaf (gently animated) */}
      <g className="pi-leaf pi-leaf--front" data-kind="leaf">
        <path d="M96 118 C70 92 72 54 104 40 C120 74 122 104 96 118 Z" />
        <path className="pi-leaf-vein" d="M96 118 C92 92 96 66 104 44" />
      </g>
    </svg>
  );
}
