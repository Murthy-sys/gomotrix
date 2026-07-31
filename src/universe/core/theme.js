// The look.
//
// Rewritten after the first pass turned into green haze. The rule now: surfaces
// are LIT, not emissive. Neutral graphite and white carry the image; the accent
// is an event, not a wash — it marks what is active, live or hovered, and should
// land on a small fraction of the frame. If a screenshot reads as "green", the
// accent is being overused.

export const COLORS = {
  void: '#08090B',
  text: '#F2F4F6',
  textDim: 'rgba(242,244,246,0.62)',
  textFaint: 'rgba(242,244,246,0.32)',
  accent: '#B7FF6A',
  glow: '#A8FF60',
  glass: 'rgba(255,255,255,0.06)',
  hairline: 'rgba(255,255,255,0.11)',
}

// Numeric forms for three.js (avoids re-parsing hex strings every frame).
export const C = {
  void: 0x08090b,
  accent: 0xb7ff6a,
  glow: 0xa8ff60,
  white: 0xffffff,

  // Material greys. Real surfaces need a value range to shade across; a single
  // near-black plus emission is what made everything read flat.
  surface: 0xd8dde2, // light plastic / glass body
  metal: 0x585f68, // brushed chassis
  graphite: 0x22262b, // dark body
  ink: 0x101317, // deepest panel fill

  // Light colours. Slightly cool key, warmer bounce — the standard trick for
  // making neutral objects look photographed rather than rendered.
  key: 0xf4f8ff,
  fill: 0x8fa6c4,
  rim: 0xcfe0ff,
}

// Fog sits far back now. It is for depth cueing at range, not for mood — the
// previous near plane was dissolving subjects at conversational distance.
export const FOG = { color: 0x08090b, near: 70, far: 340 }
