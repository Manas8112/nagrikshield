'use client';

/**
 * XboxAvatar — Deterministic generative avatar component
 * Generates a unique, consistent avatar for each user based on their ID and name.
 * No image uploads needed — purely mathematical / generative.
 */

// Palette pairs: [background gradient start, gradient end, text color]
const PALETTES = [
  ['#1A3C2E', '#2D6A4F', '#A8EDBB'], // Forest green
  ['#7C3AED', '#4C1D95', '#DDD6FE'], // Violet
  ['#C4622D', '#9A3412', '#FED7AA'], // Terracotta
  ['#0E7490', '#164E63', '#A5F3FC'], // Cyan
  ['#B5860D', '#92400E', '#FDE68A'], // Gold amber
  ['#BE185D', '#831843', '#FBCFE8'], // Rose
  ['#1D4ED8', '#1E3A8A', '#BFDBFE'], // Blue
  ['#065F46', '#022C22', '#A7F3D0'], // Emerald
  ['#D97706', '#92400E', '#FEF3C7'], // Orange
  ['#7C2D12', '#431407', '#FDBA74'], // Rust
  ['#4338CA', '#312E81', '#C7D2FE'], // Indigo
  ['#0F766E', '#134E4A', '#99F6E4'], // Teal
  ['#9D174D', '#500724', '#FECDD3'], // Pink
  ['#374151', '#111827', '#D1D5DB'], // Slate
  ['#15803D', '#14532D', '#BBF7D0'], // Green
];

// Shape SVG paths (centered in 100x100 viewBox)
const SHAPES = [
  // Shield
  'M50 10 L80 25 L80 60 Q80 80 50 90 Q20 80 20 60 L20 25 Z',
  // Hexagon
  'M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z',
  // Diamond
  'M50 10 L85 50 L50 90 L15 50 Z',
  // Circle (approximated as octagon for SVG path)
  'M50 12 L76 20 L88 46 L80 74 L54 88 L26 80 L14 54 L22 26 Z',
  // Star (simplified)
  'M50 10 L61 35 L88 35 L67 52 L75 78 L50 62 L25 78 L33 52 L12 35 L39 35 Z',
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function XboxAvatar({ user, size = 48, className = '', style = {} }) {
  if (!user) return null;

  const seed = user.avatarSeed ?? hashCode(user.id || 'default');
  const nameHash = hashCode(user.name || 'U');

  const paletteIndex = seed % PALETTES.length;
  const shapeIndex = (seed + nameHash) % SHAPES.shape || (seed % SHAPES.length);
  const [bgStart, bgEnd, textColor] = PALETTES[paletteIndex];
  const shapePath = SHAPES[seed % SHAPES.length];

  // Get initials (up to 2 chars)
  const initials = (user.name || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fontSize = size * 0.35;
  const gradientId = `grad-${user.id || seed}`.replace(/[^a-zA-Z0-9-]/g, '-');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '4px', display: 'block', flexShrink: 0, ...style }}
      aria-label={`Avatar for ${user.name}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgStart} />
          <stop offset="100%" stopColor={bgEnd} />
        </linearGradient>
        <clipPath id={`clip-${gradientId}`}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      {/* Background rect (fills the whole avatar) */}
      <rect width="100" height="100" fill={bgEnd} />

      {/* Shape overlay */}
      <path d={shapePath} fill={`url(#${gradientId})`} opacity="0.9" />

      {/* Subtle inner highlight */}
      <path d={shapePath} fill="none" stroke={textColor} strokeWidth="2" opacity="0.3" />

      {/* Initials text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        fill={textColor}
        letterSpacing="1"
      >
        {initials}
      </text>
    </svg>
  );
}
