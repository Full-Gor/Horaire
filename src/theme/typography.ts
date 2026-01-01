import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,

  h4: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  } as TextStyle,

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,

  bodyMuted: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 24,
  } as TextStyle,

  // Small text
  small: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  } as TextStyle,

  tiny: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textDim,
  } as TextStyle,

  // Special styles
  prayerTime: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  } as TextStyle,

  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,

  countdown: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  } as TextStyle,

  // Arabic text
  arabic: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.gold,
    textAlign: 'right',
  } as TextStyle,

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  } as TextStyle,

  // Label
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
} as const;
