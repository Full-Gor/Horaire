import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { GlassCard } from '../components';
import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { DailyReminder, ReminderCategory, reminderCategoryColors } from '../types';
import {
  getReminders,
  getTodayReminder,
  verifyAdminPin,
  addReminder,
  updateReminder,
  deleteReminder,
} from '../services/storage';

interface Props {
  onBack: () => void;
  onAdminAccess?: () => void;
}

export function RemindersScreen({ onBack, onAdminAccess }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [todayReminder, setTodayReminder] = useState<DailyReminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | 'all'>('all');

  const isArabic = i18n.language === 'ar';

  const loadData = useCallback(async () => {
    try {
      const [allReminders, today] = await Promise.all([
        getReminders(),
        getTodayReminder(),
      ]);
      setReminders(allReminders);
      setTodayReminder(today);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAdminAccess = async () => {
    const isValid = await verifyAdminPin(adminPin);
    if (isValid) {
      setShowAdminPrompt(false);
      setAdminPin('');
      if (onAdminAccess) {
        onAdminAccess();
      }
    } else {
      Alert.alert(
        t('admin.error') || 'Erreur',
        t('admin.wrongPin') || 'Code PIN incorrect'
      );
    }
  };

  const categories: (ReminderCategory | 'all')[] = ['all', 'quran', 'hadith', 'dua', 'wisdom', 'fiqh', 'sira', 'general'];

  const filteredReminders = selectedCategory === 'all'
    ? reminders.filter(r => r.isActive)
    : reminders.filter(r => r.category === selectedCategory && r.isActive);

  const getCategoryLabel = (category: ReminderCategory | 'all'): string => {
    if (category === 'all') return t('reminders.allCategories') || 'Tous';
    return t(`reminders.categories.${category}`) || category;
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
          { paddingTop: insets.top + 10 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('reminders.title') || 'Rappels'}</Text>
          <TouchableOpacity
            onPress={() => setShowAdminPrompt(true)}
            style={styles.adminButton}
          >
            <Feather name="settings" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Today's Reminder Highlight */}
        {todayReminder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('reminders.todayReminder') || "Rappel du jour"}
            </Text>
            <GlassCard style={styles.todayCard}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: reminderCategoryColors[todayReminder.category] },
                ]}
              >
                <Text style={styles.categoryBadgeText}>
                  {getCategoryLabel(todayReminder.category)}
                </Text>
              </View>

              <Text style={styles.todayTitle}>
                {isArabic && todayReminder.titleAr
                  ? todayReminder.titleAr
                  : todayReminder.titleFr}
              </Text>

              <Text style={styles.todayContent}>
                {isArabic && todayReminder.contentAr
                  ? todayReminder.contentAr
                  : todayReminder.contentFr}
              </Text>

              {todayReminder.source && (
                <Text style={styles.source}>{todayReminder.source}</Text>
              )}
            </GlassCard>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
                category !== 'all' && {
                  borderColor: reminderCategoryColors[category as ReminderCategory],
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reminders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('reminders.allReminders') || 'Tous les rappels'}
          </Text>

          {filteredReminders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {t('reminders.noReminders') || 'Aucun rappel dans cette catégorie'}
              </Text>
            </View>
          ) : (
            filteredReminders.map((reminder) => (
              <GlassCard key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View
                    style={[
                      styles.smallBadge,
                      { backgroundColor: reminderCategoryColors[reminder.category] },
                    ]}
                  />
                  <Text style={styles.reminderCategory}>
                    {getCategoryLabel(reminder.category)}
                  </Text>
                </View>

                <Text style={styles.reminderTitle}>
                  {isArabic && reminder.titleAr ? reminder.titleAr : reminder.titleFr}
                </Text>

                <Text style={styles.reminderContent} numberOfLines={3}>
                  {isArabic && reminder.contentAr
                    ? reminder.contentAr
                    : reminder.contentFr}
                </Text>

                {reminder.source && (
                  <Text style={styles.reminderSource}>{reminder.source}</Text>
                )}
              </GlassCard>
            ))
          )}
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Admin PIN Modal */}
      {showAdminPrompt && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.pinModal}>
            <Text style={styles.pinTitle}>
              {t('admin.enterPin') || 'Entrez le code PIN admin'}
            </Text>
            <TextInput
              style={styles.pinInput}
              value={adminPin}
              onChangeText={setAdminPin}
              placeholder="••••"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            <View style={styles.pinButtons}>
              <TouchableOpacity
                style={styles.pinButtonCancel}
                onPress={() => {
                  setShowAdminPrompt(false);
                  setAdminPin('');
                }}
              >
                <Text style={styles.pinButtonCancelText}>
                  {t('common.cancel') || 'Annuler'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinButtonConfirm}
                onPress={handleAdminAccess}
              >
                <Text style={styles.pinButtonConfirmText}>
                  {t('common.ok') || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
  },
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: 12,
  },
  todayCard: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: 'white',
    fontWeight: '600',
  },
  todayTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  todayContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  source: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  categoryFilter: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  reminderCard: {
    padding: 16,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  reminderCategory: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reminderTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 8,
  },
  reminderContent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reminderSource: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinModal: {
    width: 280,
    padding: 24,
    alignItems: 'center',
  },
  pinTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    width: '100%',
    height: 50,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  pinButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  pinButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  pinButtonCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  pinButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  pinButtonConfirmText: {
    ...typography.button,
    color: colors.background,
  },
});
