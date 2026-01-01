import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, gradients } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  intensity?: 'light' | 'medium' | 'strong';
  glowColor?: string;
  disabled?: boolean;
}

export function GlassCard({
  children,
  style,
  onPress,
  intensity = 'medium',
  glowColor,
  disabled,
}: Props) {
  const getOpacity = () => {
    switch (intensity) {
      case 'light':
        return 0.4;
      case 'strong':
        return 0.8;
      default:
        return 0.6;
    }
  };

  const content = (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[
          `rgba(37, 37, 48, ${getOpacity()})`,
          `rgba(30, 30, 36, ${getOpacity() - 0.1})`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.highlight} />
      <View style={styles.content}>{children}</View>
      {glowColor && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: glowColor,
              shadowColor: glowColor,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 16,
  },
  glow: {
    position: 'absolute',
    bottom: -20,
    left: '20%',
    right: '20%',
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
