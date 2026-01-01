import { ViewStyle } from 'react-native';

export const colors = {
  // Backgrounds
  background: '#1a1a1f',
  cardBg: '#1e1e24',
  cardBgLight: '#252530',
  cardBgDark: '#16161a',

  // Glass effect backgrounds
  glassBg: 'rgba(30, 30, 36, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',

  // Accent colors
  primary: '#4ade80',
  primaryDark: '#22c55e',
  primaryLight: '#86efac',
  primaryMuted: 'rgba(74, 222, 128, 0.2)',

  // Secondary accent (gold for Islamic theme)
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  goldMuted: 'rgba(245, 158, 11, 0.2)',

  // Text colors
  text: '#f8f8f8',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  textDisabled: '#4b5563',

  // Status colors
  success: '#4ade80',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Gradient colors
  gradientStart: '#4ade80',
  gradientEnd: '#22c55e',

  // Shadow colors
  shadowDark: '#0f0f12',
  shadowLight: '#2a2a35',

  // Prayer specific colors
  fajr: '#6366f1',
  sunrise: '#f59e0b',
  dhuhr: '#eab308',
  asr: '#f97316',
  maghrib: '#ec4899',
  isha: '#8b5cf6',
} as const;

export const gradients = {
  primary: ['#4ade80', '#22c55e'] as const,
  gold: ['#f59e0b', '#d97706'] as const,
  fajr: ['#6366f1', '#4f46e5'] as const,
  sunrise: ['#f59e0b', '#d97706'] as const,
  dhuhr: ['#eab308', '#ca8a04'] as const,
  asr: ['#f97316', '#ea580c'] as const,
  maghrib: ['#ec4899', '#db2777'] as const,
  isha: ['#8b5cf6', '#7c3aed'] as const,
  glass: ['rgba(30, 30, 36, 0.8)', 'rgba(22, 22, 26, 0.6)'] as const,
  card: ['rgba(37, 37, 48, 0.9)', 'rgba(30, 30, 36, 0.7)'] as const,
} as const;

// Neumorphic shadow presets
export const neuShadow = {
  raised: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  pressed: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,

  floating: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  } as ViewStyle,

  subtle: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,

  goldGlow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  } as ViewStyle,
};

// Glass morphism styles
export const glassStyle = {
  container: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
  } as ViewStyle,

  card: {
    backgroundColor: 'rgba(37, 37, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    overflow: 'hidden' as const,
  } as ViewStyle,

  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
  } as ViewStyle,
};

// Border radius presets
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// Spacing presets
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
