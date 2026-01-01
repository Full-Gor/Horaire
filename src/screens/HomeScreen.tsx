import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import {
  GlassCard,
  PrayerCard,
  CountdownTimer,
  DateDisplay,
  LocationDisplay,
} from '../components';
import { colors, borderRadius, neuShadow, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  calculatePrayerTimes,
  getPrayerTimeInfo,
  getNextPrayer,
  gregorianToHijri,
} from '../services/prayerTimes';
import { getCurrentLocation } from '../services/location';
import { getSettings, updateSettings } from '../services/storage';
import {
  PrayerName,
  PrayerTimeInfo,
  DailyPrayerTimes,
  HijriDate,
  Location,
  AppSettings,
  prayerColors,
} from '../types';

interface Props {
  onLocationPress: () => void;
}

export function HomeScreen({ onLocationPress }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<DailyPrayerTimes | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerTimeInfo[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTimeInfo | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);

      let loc = savedSettings.location;
      if (!loc) {
        loc = await getCurrentLocation();
        if (loc) {
          await updateSettings({ location: loc });
        }
      }
      setLocation(loc);

      if (loc) {
        const today = new Date();
        const times = calculatePrayerTimes(
          today,
          loc,
          savedSettings.calculationMethod,
          savedSettings.madhab,
          savedSettings.manualAdjustments
        );
        setPrayerTimes(times);

        const info = getPrayerTimeInfo(times, today);
        setPrayerInfo(info);

        const next = getNextPrayer(times, today);
        setNextPrayer(next);

        const hijri = gregorianToHijri(today);
        setHijriDate(hijri);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Update prayer info when time changes
  useEffect(() => {
    if (prayerTimes) {
      const info = getPrayerTimeInfo(prayerTimes, currentDate);
      setPrayerInfo(info);

      const next = getNextPrayer(prayerTimes, currentDate);
      setNextPrayer(next);
    }
  }, [currentDate, prayerTimes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getPrayerLabel = (name: PrayerName): string => {
    return t(`prayers.${name}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={40} color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.background, '#151518', colors.background]}
        style={styles.backgroundGradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>{t('app.name')}</Text>
          <Text style={styles.appSubtitle}>{t('app.subtitle')}</Text>
        </View>

        {/* Location */}
        <LocationDisplay
          location={location}
          onPress={onLocationPress}
          loading={!location && loading}
        />

        {/* Date Display */}
        {hijriDate && (
          <DateDisplay gregorianDate={currentDate} hijriDate={hijriDate} />
        )}

        {/* Next Prayer Countdown */}
        {nextPrayer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.nextPrayer')}</Text>
              <View
                style={[
                  styles.prayerBadge,
                  { backgroundColor: prayerColors[nextPrayer.name] },
                ]}
              >
                <Text style={styles.prayerBadgeText}>
                  {getPrayerLabel(nextPrayer.name)}
                </Text>
              </View>
            </View>

            <CountdownTimer
              targetTime={nextPrayer.time}
              prayerName={getPrayerLabel(nextPrayer.name)}
              prayerColor={prayerColors[nextPrayer.name]}
            />
          </View>
        )}

        {/* Prayer Times List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.today')}</Text>

          <GlassCard style={styles.prayerListCard}>
            {prayerInfo.map((prayer) => (
              <PrayerCard
                key={prayer.name}
                name={prayer.name}
                time={prayer.time}
                label={getPrayerLabel(prayer.name)}
                isNext={prayer.isNext}
                isCurrent={prayer.isCurrent}
                isPassed={prayer.isPassed}
              />
            ))}
          </GlassCard>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: 16,
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  appTitle: {
    ...typography.h1,
    fontSize: 28,
  },
  appSubtitle: {
    ...typography.bodyMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.label,
  },
  prayerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  prayerBadgeText: {
    ...typography.buttonSmall,
    color: colors.background,
    fontWeight: '700',
  },
  prayerListCard: {
    padding: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
