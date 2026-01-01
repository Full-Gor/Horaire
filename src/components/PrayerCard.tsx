import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius, gradients, neuShadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { PrayerName, prayerColors, arabicPrayerNames } from '../types';

interface Props {
  name: PrayerName;
  time: string;
  label: string;
  isNext?: boolean;
  isCurrent?: boolean;
  isPassed?: boolean;
  onPress?: () => void;
  notificationEnabled?: boolean;
}

export function PrayerCard({
  name,
  time,
  label,
  isNext,
  isCurrent,
  isPassed,
  onPress,
  notificationEnabled = true,
}: Props) {
  const prayerColor = prayerColors[name];
  const arabicName = arabicPrayerNames[name];

  const getPrayerIcon = (): keyof typeof Feather.glyphMap => {
    switch (name) {
      case 'fajr':
        return 'sunrise';
      case 'sunrise':
        return 'sun';
      case 'dhuhr':
        return 'sun';
      case 'asr':
        return 'sunset';
      case 'maghrib':
        return 'sunset';
      case 'isha':
        return 'moon';
      default:
        return 'clock';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isNext && styles.nextContainer,
        pressed && styles.pressed,
      ]}
    >
      {isNext && (
        <LinearGradient
          colors={[`${prayerColor}20`, `${prayerColor}05`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nextGradient}
        />
      )}

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${prayerColor}20` },
              isNext && { backgroundColor: `${prayerColor}30` },
            ]}
          >
            <Feather
              name={getPrayerIcon()}
              size={20}
              color={isNext ? prayerColor : colors.textMuted}
            />
          </View>

          <View style={styles.nameContainer}>
            <Text
              style={[
                styles.prayerName,
                isNext && { color: colors.text },
                isPassed && styles.passedText,
              ]}
            >
              {label}
            </Text>
            <Text style={[styles.arabicName, isPassed && styles.passedText]}>
              {arabicName}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text
            style={[
              styles.time,
              isNext && { color: prayerColor },
              isPassed && styles.passedText,
            ]}
          >
            {time}
          </Text>

          {isNext && (
            <View style={[styles.nextBadge, { backgroundColor: prayerColor }]}>
              <Text style={styles.nextBadgeText}>SUIVANT</Text>
            </View>
          )}

          {isCurrent && (
            <View style={[styles.currentBadge]}>
              <Text style={styles.currentBadgeText}>EN COURS</Text>
            </View>
          )}

          {isPassed && !isCurrent && !isNext && (
            <Feather name="check-circle" size={16} color={colors.textDim} />
          )}
        </View>
      </View>

      {isNext && (
        <View style={[styles.accentLine, { backgroundColor: prayerColor }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextContainer: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...neuShadow.raised,
  },
  pressed: {
    backgroundColor: colors.cardBgDark,
    transform: [{ scale: 0.99 }],
  },
  nextGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  prayerName: {
    ...typography.prayerName,
    color: colors.textMuted,
  },
  arabicName: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  time: {
    ...typography.prayerTime,
    fontSize: 22,
    color: colors.textMuted,
  },
  passedText: {
    color: colors.textDim,
    opacity: 0.6,
  },
  nextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.5,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: colors.primaryMuted,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});
