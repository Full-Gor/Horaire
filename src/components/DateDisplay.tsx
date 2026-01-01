import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { HijriDate } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  gregorianDate: Date;
  hijriDate: HijriDate;
}

export function DateDisplay({ gregorianDate, hijriDate }: Props) {
  const { t, i18n } = useTranslation();

  const formatGregorianDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(i18n.language, options);
  };

  const getHijriMonthName = (): string => {
    return t(`months.hijri.${hijriDate.month}`) || hijriDate.monthName;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(37, 37, 48, 0.7)', 'rgba(30, 30, 36, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.row}>
        <View style={styles.dateBlock}>
          <View style={styles.labelRow}>
            <Feather name="calendar" size={14} color={colors.textDim} />
            <Text style={styles.label}>{t('home.gregorianDate')}</Text>
          </View>
          <Text style={styles.gregorianDate}>
            {formatGregorianDate(gregorianDate)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.dateBlock}>
          <View style={styles.labelRow}>
            <Feather name="moon" size={14} color={colors.gold} />
            <Text style={[styles.label, { color: colors.gold }]}>
              {t('home.hijriDate')}
            </Text>
          </View>
          <Text style={styles.hijriDate}>
            {hijriDate.day} {getHijriMonthName()} {hijriDate.year}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
  },
  dateBlock: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    ...typography.tiny,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gregorianDate: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  hijriDate: {
    ...typography.body,
    color: colors.goldLight,
    fontSize: 14,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
});
