import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { PrayerName, prayerColors, DailyReminder, reminderCategoryColors } from '../types';
import { getTodayReminder } from '../services/storage';
import { GlassCard } from './GlassCard';

interface Props {
  visible: boolean;
  prayer: PrayerName | null;
  prayerTime: string;
  onClose: () => void;
  onReminderPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PrayerModal({ visible, prayer, prayerTime, onClose, onReminderPress }: Props) {
  const { t, i18n } = useTranslation();
  const [reminder, setReminder] = useState<DailyReminder | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      loadReminder();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const loadReminder = async () => {
    const todayReminder = await getTodayReminder();
    setReminder(todayReminder);
  };

  if (!prayer) return null;

  const prayerColor = prayerColors[prayer];
  const prayerLabel = t(`prayers.${prayer}`);
  const isArabic = i18n.language === 'ar';

  const handleReminderPress = () => {
    onClose();
    onReminderPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Header with prayer info */}
              <View style={[styles.header, { backgroundColor: prayerColor }]}>
                <View style={styles.headerContent}>
                  <Text style={styles.prayerName}>{prayerLabel}</Text>
                  <Text style={styles.prayerTime}>{prayerTime}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Today's Reminder */}
              {reminder && (
                <TouchableOpacity
                  style={styles.reminderContainer}
                  onPress={handleReminderPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderTitleRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: reminderCategoryColors[reminder.category] },
                        ]}
                      >
                        <Text style={styles.categoryText}>
                          {t(`reminders.categories.${reminder.category}`)}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color={colors.textMuted} />
                    </View>
                    <Text style={styles.reminderTitle}>
                      {isArabic && reminder.titleAr ? reminder.titleAr : reminder.titleFr}
                    </Text>
                  </View>

                  <Text style={styles.reminderContent} numberOfLines={3}>
                    {isArabic && reminder.contentAr ? reminder.contentAr : reminder.contentFr}
                  </Text>

                  {reminder.source && (
                    <Text style={styles.reminderSource}>{reminder.source}</Text>
                  )}

                  <View style={styles.seeMoreContainer}>
                    <Text style={styles.seeMoreText}>
                      {t('reminders.seeMore') || 'Voir plus de rappels'}
                    </Text>
                    <Feather name="arrow-right" size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              )}

              {/* Quick actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleReminderPress}>
                  <Feather name="book-open" size={20} color={colors.primary} />
                  <Text style={styles.actionText}>
                    {t('reminders.dailyReminder') || 'Rappel du jour'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerContent: {
    flex: 1,
  },
  prayerName: {
    ...typography.h2,
    color: 'white',
    marginBottom: 4,
  },
  prayerTime: {
    ...typography.h1,
    color: 'white',
    fontSize: 36,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderHeader: {
    marginBottom: 12,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    color: 'white',
    fontWeight: '600',
  },
  reminderTitle: {
    ...typography.h3,
    color: colors.text,
  },
  reminderContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  reminderSource: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  seeMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  seeMoreText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.lg,
  },
  actionText: {
    ...typography.button,
    color: colors.primary,
  },
});
