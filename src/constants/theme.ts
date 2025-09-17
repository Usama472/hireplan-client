// HirePlan Color Theme System
// Based on the established HirePlan design system

export const COLORS = {
  // Primary Brand Colors
  primary: {
    DEFAULT: 'oklch(0.205 0.05 240)', // Dark blue
    foreground: 'oklch(0.985 0 0)', // White
    50: 'oklch(0.95 0.01 240)',
    100: 'oklch(0.9 0.02 240)',
    200: 'oklch(0.8 0.03 240)',
    300: 'oklch(0.7 0.04 240)',
    400: 'oklch(0.5 0.045 240)',
    500: 'oklch(0.205 0.05 240)', // Default
    600: 'oklch(0.18 0.045 240)',
    700: 'oklch(0.15 0.04 240)',
    800: 'oklch(0.12 0.035 240)',
    900: 'oklch(0.1 0.03 240)',
  },

  // Secondary Brand Colors
  secondary: {
    DEFAULT: 'oklch(0.646 0.222 264.376)', // Blue-purple
    foreground: 'oklch(0.985 0 0)', // White
    50: 'oklch(0.95 0.044 264.376)',
    100: 'oklch(0.9 0.089 264.376)',
    200: 'oklch(0.8 0.133 264.376)',
    300: 'oklch(0.7 0.178 264.376)',
    400: 'oklch(0.6 0.2 264.376)',
    500: 'oklch(0.646 0.222 264.376)', // Default
    600: 'oklch(0.58 0.2 264.376)',
    700: 'oklch(0.52 0.178 264.376)',
    800: 'oklch(0.46 0.156 264.376)',
    900: 'oklch(0.4 0.133 264.376)',
  },

  // Accent Colors
  accent: {
    DEFAULT: 'oklch(0.6 0.18 264.376)', // Purple-blue
    foreground: 'oklch(0.985 0 0)', // White
    50: 'oklch(0.95 0.036 264.376)',
    100: 'oklch(0.9 0.072 264.376)',
    200: 'oklch(0.8 0.108 264.376)',
    300: 'oklch(0.7 0.144 264.376)',
    400: 'oklch(0.65 0.162 264.376)',
    500: 'oklch(0.6 0.18 264.376)', // Default
    600: 'oklch(0.55 0.162 264.376)',
    700: 'oklch(0.5 0.144 264.376)',
    800: 'oklch(0.45 0.126 264.376)',
    900: 'oklch(0.4 0.108 264.376)',
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status Colors
  status: {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    reviewed: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    shortlisted: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    hired: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
};

// Gradient Combinations
export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-primary to-secondary',
  rainbow: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  subtle: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
  hero: 'bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10',
  button: 'bg-gradient-to-r from-blue-500 to-purple-600',
  card: 'bg-gradient-to-br from-white to-gray-50/50',
};

// Common Component Styles
export const COMPONENT_STYLES = {
  // Buttons
  button: {
    primary: `bg-blue-600 hover:bg-blue-700 text-white border-0`,
    secondary: `bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200`,
    outline: `border-gray-300 text-gray-700 hover:bg-gray-50`,
    gradient: `bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0`,
  },

  // Cards
  card: {
    default: `bg-white border border-gray-200 rounded-lg shadow-sm`,
    hover: `bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow`,
    gradient: `bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg shadow-sm`,
  },

  // Status Badges
  badge: {
    pending: `${COLORS.status.pending.bg} ${COLORS.status.pending.text} ${COLORS.status.pending.border}`,
    reviewed: `${COLORS.status.reviewed.bg} ${COLORS.status.reviewed.text} ${COLORS.status.reviewed.border}`,
    shortlisted: `${COLORS.status.shortlisted.bg} ${COLORS.status.shortlisted.text} ${COLORS.status.shortlisted.border}`,
    rejected: `${COLORS.status.rejected.bg} ${COLORS.status.rejected.text} ${COLORS.status.rejected.border}`,
    hired: `${COLORS.status.hired.bg} ${COLORS.status.hired.text} ${COLORS.status.hired.border}`,
  },

  // Headers
  header: {
    main: `bg-background/80 backdrop-blur-md border-b border-border`,
    welcome: `bg-white border-b border-gray-200`,
  },

  // Backgrounds
  background: {
    page: `bg-gray-50`,
    auth: `bg-gradient-to-br from-gray-50 to-gray-100`,
    hero: `bg-primary`,
    card: `bg-white`,
  },

  // Text
  text: {
    primary: `text-gray-900`,
    secondary: `text-gray-600`,
    muted: `text-gray-500`,
    brand: `bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`,
    rainbow: `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`,
  },

  // Borders
  border: {
    default: `border-gray-200`,
    focus: `border-blue-500`,
    error: `border-red-500`,
  },
};

// Theme Variants
export const THEME_VARIANTS = {
  blue: {
    primary: 'oklch(0.646 0.222 264.376)',
    accent: 'oklch(0.6 0.18 264.376)',
  },
  green: {
    primary: 'oklch(0.769 0.188 142)',
    accent: 'oklch(0.769 0.188 142)',
  },
  purple: {
    primary: 'oklch(0.627 0.265 303.9)',
    accent: 'oklch(0.627 0.265 303.9)',
  },
};

// Utility Functions
export const getStatusColor = (status: string) => {
  return COMPONENT_STYLES.badge[status as keyof typeof COMPONENT_STYLES.badge] || COMPONENT_STYLES.badge.pending;
};

export const getThemeClass = (variant: keyof typeof THEME_VARIANTS) => {
  return `theme-color-${variant}`;
};
