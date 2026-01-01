import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, neuShadow, borderRadius } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'raised' | 'pressed' | 'floating' | 'subtle';
  disabled?: boolean;
}

export function NeuCard({ children, style, onPress, variant = 'raised', disabled }: Props) {
  const shadowStyle = neuShadow[variant];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          shadowStyle,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, shadowStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  pressed: {
    backgroundColor: colors.cardBgDark,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
