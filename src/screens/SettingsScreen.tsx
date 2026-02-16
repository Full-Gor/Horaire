import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { GlassCard, SettingsItem, SelectModal } from '../components';
import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { getSettings, updateSettings } from '../services/storage';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  cancelAllNotifications,
} from '../services/notifications';
import { getCalculationMethods, calculatePrayerTimes } from '../services/prayerTimes';
import { AppSettings, CalculationMethod, Madhab, PrayerName } from '../types';
import { supportedLanguages } from '../i18n';
import i18n from '../i18n';

export function SettingsScreen() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showMadhabModal, setShowMadhabModal] = useState(false);

  const loadSettings = useCallback(async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingChange = async (key: keyof AppSettings, value: unknown) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    await updateSettings(newSettings);
    setSettings(newSettings);

    // Handle language change
    if (key === 'language' && typeof value === 'string') {
      i18n.changeLanguage(value);
    }

    // Handle notification toggle
    if (key === 'notificationsEnabled') {
      if (value) {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission && settings.location) {
          const today = new Date();
          const prayerTimes = calculatePrayerTimes(
            today,
            settings.location,
            settings.calculationMethod,
            settings.madhab,
            settings.manualAdjustments
          );

          const labels: Record<PrayerName, string> = {
            fajr: t('prayers.fajr'),
            sunrise: t('prayers.sunrise'),
            dhuhr: t('prayers.dhuhr'),
            asr: t('prayers.asr'),
            maghrib: t('prayers.maghrib'),
            isha: t('prayers.isha'),
          };

          await scheduleDailyNotifications(
            prayerTimes,
            today,
            labels,
            settings.notificationMinutesBefore
          );
        }
      } else {
        await cancelAllNotifications();
      }
    }
  };

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const calculationMethods = getCalculationMethods();
  const currentMethod = calculationMethods.find(
    (m) => m.id === settings.calculationMethod
  );

  const languageOptions = supportedLanguages.map((lang) => ({
    value: lang.code,
    label: lang.nativeName,
    subtitle: lang.name !== lang.nativeName ? lang.name : undefined,
  }));

  const methodOptions = calculationMethods.map((method) => ({
    value: method.id,
    label: t(`calculationMethods.${method.id}`),
    subtitle: `Fajr: ${method.fajrAngle}° | Isha: ${
      method.ishaAngle === 90 ? '90 min' : `${method.ishaAngle}°`
    }`,
  }));

  const madhabOptions = [
    { value: 'shafi', label: t('madhabs.shafi'), subtitle: 'Asr à ombre = longueur objet' },
    { value: 'hanafi', label: t('madhabs.hanafi'), subtitle: 'Asr à ombre = 2x longueur objet' },
  ];

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === settings.language
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.background, '#151518', colors.background]}
        style={styles.backgroundGradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Général</Text>

          <GlassCard style={styles.sectionCard}>
            <SettingsItem
              icon="globe"
              title={t('settings.language')}
              value={currentLanguage?.nativeName}
              onPress={() => setShowLanguageModal(true)}
            />

            <SettingsItem
              icon="bell"
              iconColor={colors.gold}
              title={t('settings.notifications')}
              subtitle={t('settings.notificationsDesc')}
              isSwitch
              switchValue={settings.notificationsEnabled}
              onSwitchChange={(value) =>
                handleSettingChange('notificationsEnabled', value)
              }
            />

            <SettingsItem
              icon="map-pin"
              iconColor={colors.info}
              title={t('settings.location')}
              subtitle={t('settings.locationDesc')}
              value={settings.location?.city || 'Non défini'}
              showChevron={false}
            />
          </GlassCard>
        </View>

        {/* Calculation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calcul des prières</Text>

          <GlassCard style={styles.sectionCard}>
            <SettingsItem
              icon="settings"
              title={t('settings.calculationMethod')}
              value={currentMethod?.name}
              onPress={() => setShowMethodModal(true)}
            />

            <SettingsItem
              icon="book"
              iconColor={colors.gold}
              title={t('settings.madhab')}
              value={t(`madhabs.${settings.madhab}`)}
              onPress={() => setShowMadhabModal(true)}
            />
          </GlassCard>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>

          <GlassCard style={styles.sectionCard}>
            <SettingsItem
              icon="info"
              iconColor={colors.textMuted}
              title={t('settings.version')}
              value="1.0.0"
              showChevron={false}
            />
          </GlassCard>
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <SelectModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('settings.language')}
        options={languageOptions}
        selectedValue={settings.language}
        onSelect={(value) => handleSettingChange('language', value)}
      />

      <SelectModal
        visible={showMethodModal}
        onClose={() => setShowMethodModal(false)}
        title={t('settings.calculationMethod')}
        options={methodOptions}
        selectedValue={settings.calculationMethod}
        onSelect={(value) =>
          handleSettingChange('calculationMethod', value as CalculationMethod)
        }
      />

      <SelectModal
        visible={showMadhabModal}
        onClose={() => setShowMadhabModal(false)}
        title={t('settings.madhab')}
        options={madhabOptions}
        selectedValue={settings.madhab}
        onSelect={(value) => handleSettingChange('madhab', value as Madhab)}
      />
    </SafeAreaView>
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
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 4,
  },
  bottomSpacer: {
    height: 100,
  },
});
