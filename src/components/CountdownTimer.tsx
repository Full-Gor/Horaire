import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, gradients, neuShadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { useTranslation } from 'react-i18next';

interface Props {
  targetTime: string; // Format: "HH:mm"
  prayerName: string;
  prayerColor: string;
}

export function CountdownTimer({ targetTime, prayerName, prayerColor }: Props) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(targetHours, targetMinutes, 0, 0);

      // If target time has passed, assume it's for tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${prayerColor}15`, `${prayerColor}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <Text style={styles.label}>{t('home.timeRemaining')}</Text>

      <View style={styles.timerContainer}>
        <View style={styles.timeBlock}>
          <View style={[styles.timeBox, { borderColor: `${prayerColor}40` }]}>
            <Text style={[styles.timeValue, { color: prayerColor }]}>
              {formatNumber(timeRemaining.hours)}
            </Text>
          </View>
          <Text style={styles.timeLabel}>{t('common.hours')}</Text>
        </View>

        <Text style={[styles.separator, { color: prayerColor }]}>:</Text>

        <View style={styles.timeBlock}>
          <View style={[styles.timeBox, { borderColor: `${prayerColor}40` }]}>
            <Text style={[styles.timeValue, { color: prayerColor }]}>
              {formatNumber(timeRemaining.minutes)}
            </Text>
          </View>
          <Text style={styles.timeLabel}>{t('common.minutes')}</Text>
        </View>

        <Text style={[styles.separator, { color: prayerColor }]}>:</Text>

        <View style={styles.timeBlock}>
          <View style={[styles.timeBox, { borderColor: `${prayerColor}40` }]}>
            <Text style={[styles.timeValue, { color: prayerColor }]}>
              {formatNumber(timeRemaining.seconds)}
            </Text>
          </View>
          <Text style={styles.timeLabel}>{t('common.seconds')}</Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: `${prayerColor}20` }]}>
        <View
          style={[
            styles.progress,
            {
              backgroundColor: prayerColor,
              width: `${100 - (timeRemaining.seconds / 60) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...neuShadow.floating,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    ...typography.label,
    textAlign: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeBox: {
    backgroundColor: colors.cardBgDark,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  timeValue: {
    ...typography.countdown,
    fontSize: 36,
  },
  timeLabel: {
    ...typography.tiny,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  separator: {
    fontSize: 36,
    fontWeight: '700',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});
