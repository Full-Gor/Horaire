import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
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
  addReminder,
  updateReminder,
  deleteReminder,
} from '../services/storage';

interface Props {
  onBack: () => void;
}

type EditMode = 'list' | 'add' | 'edit';

const CATEGORIES: ReminderCategory[] = ['quran', 'hadith', 'dua', 'wisdom', 'fiqh', 'sira', 'general'];

export function AdminRemindersScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<EditMode>('list');
  const [editingReminder, setEditingReminder] = useState<DailyReminder | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState('');
  const [formTitleFr, setFormTitleFr] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formContentFr, setFormContentFr] = useState('');
  const [formContentAr, setFormContentAr] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formCategory, setFormCategory] = useState<ReminderCategory>('general');
  const [formIsActive, setFormIsActive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const allReminders = await getReminders();
      setReminders(allReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormDate('');
    setFormTitleFr('');
    setFormTitleAr('');
    setFormContentFr('');
    setFormContentAr('');
    setFormSource('');
    setFormCategory('general');
    setFormIsActive(true);
    setEditingReminder(null);
  };

  const handleAdd = () => {
    resetForm();
    setMode('add');
  };

  const handleEdit = (reminder: DailyReminder) => {
    setEditingReminder(reminder);
    setFormDate(reminder.date);
    setFormTitleFr(reminder.titleFr);
    setFormTitleAr(reminder.titleAr || '');
    setFormContentFr(reminder.contentFr);
    setFormContentAr(reminder.contentAr || '');
    setFormSource(reminder.source || '');
    setFormCategory(reminder.category);
    setFormIsActive(reminder.isActive);
    setMode('edit');
  };

  const handleDelete = (reminder: DailyReminder) => {
    Alert.alert(
      t('admin.deleteConfirm') || 'Supprimer',
      t('admin.deleteConfirmMessage') || 'Êtes-vous sûr de vouloir supprimer ce rappel ?',
      [
        { text: t('common.cancel') || 'Annuler', style: 'cancel' },
        {
          text: t('admin.delete') || 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteReminder(reminder.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formTitleFr.trim() || !formContentFr.trim()) {
      Alert.alert(
        t('admin.error') || 'Erreur',
        t('admin.fillRequired') || 'Veuillez remplir les champs obligatoires'
      );
      return;
    }

    try {
      if (mode === 'add') {
        await addReminder({
          date: formDate || new Date().toISOString().slice(5, 10), // Default to MM-DD
          titleFr: formTitleFr,
          titleAr: formTitleAr || undefined,
          contentFr: formContentFr,
          contentAr: formContentAr || undefined,
          source: formSource || undefined,
          category: formCategory,
          isActive: formIsActive,
        });
      } else if (mode === 'edit' && editingReminder) {
        await updateReminder(editingReminder.id, {
          date: formDate,
          titleFr: formTitleFr,
          titleAr: formTitleAr || undefined,
          contentFr: formContentFr,
          contentAr: formContentAr || undefined,
          source: formSource || undefined,
          category: formCategory,
          isActive: formIsActive,
        });
      }

      resetForm();
      setMode('list');
      loadData();
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert(
        t('admin.error') || 'Erreur',
        t('admin.saveError') || 'Erreur lors de la sauvegarde'
      );
    }
  };

  const handleCancel = () => {
    resetForm();
    setMode('list');
  };

  const getCategoryLabel = (category: ReminderCategory): string => {
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
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={mode === 'list' ? onBack : handleCancel}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'list'
              ? t('admin.manageReminders') || 'Gérer les rappels'
              : mode === 'add'
              ? t('admin.addReminder') || 'Ajouter un rappel'
              : t('admin.editReminder') || 'Modifier le rappel'}
          </Text>
          {mode === 'list' && (
            <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
              <Feather name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          {mode !== 'list' && <View style={{ width: 40 }} />}
        </View>

        {mode === 'list' ? (
          // List Mode
          <>
            <Text style={styles.countText}>
              {reminders.length} {t('admin.remindersCount') || 'rappels'}
            </Text>

            {reminders.map((reminder) => (
              <GlassCard key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: reminderCategoryColors[reminder.category] },
                    ]}
                  />
                  <Text style={styles.reminderDate}>{reminder.date}</Text>
                  <View style={styles.reminderActions}>
                    <Switch
                      value={reminder.isActive}
                      onValueChange={async (value) => {
                        await updateReminder(reminder.id, { isActive: value });
                        loadData();
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="white"
                    />
                    <TouchableOpacity
                      onPress={() => handleEdit(reminder)}
                      style={styles.iconButton}
                    >
                      <Feather name="edit-2" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(reminder)}
                      style={styles.iconButton}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.reminderTitle}>{reminder.titleFr}</Text>
                <Text style={styles.reminderContent} numberOfLines={2}>
                  {reminder.contentFr}
                </Text>
              </GlassCard>
            ))}
          </>
        ) : (
          // Add/Edit Mode
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.date') || 'Date (MM-DD ou YYYY-MM-DD)'}
              </Text>
              <TextInput
                style={styles.formInput}
                value={formDate}
                onChangeText={setFormDate}
                placeholder="01-15 ou 2026-01-15"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.titleFr') || 'Titre (Français) *'}
              </Text>
              <TextInput
                style={styles.formInput}
                value={formTitleFr}
                onChangeText={setFormTitleFr}
                placeholder="Titre du rappel"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.titleAr') || 'Titre (Arabe)'}
              </Text>
              <TextInput
                style={[styles.formInput, styles.rtlInput]}
                value={formTitleAr}
                onChangeText={setFormTitleAr}
                placeholder="عنوان التذكير"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.contentFr') || 'Contenu (Français) *'}
              </Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={formContentFr}
                onChangeText={setFormContentFr}
                placeholder="Contenu du rappel"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.contentAr') || 'Contenu (Arabe)'}
              </Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea, styles.rtlInput]}
                value={formContentAr}
                onChangeText={setFormContentAr}
                placeholder="محتوى التذكير"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.source') || 'Source (référence)'}
              </Text>
              <TextInput
                style={styles.formInput}
                value={formSource}
                onChangeText={setFormSource}
                placeholder="Coran 2:255, Sahih Bukhari..."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {t('admin.category') || 'Catégorie'}
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      formCategory === cat && {
                        backgroundColor: reminderCategoryColors[cat],
                        borderColor: reminderCategoryColors[cat],
                      },
                    ]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formCategory === cat && styles.categoryOptionTextActive,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>
                  {t('admin.isActive') || 'Actif'}
                </Text>
                <Switch
                  value={formIsActive}
                  onValueChange={setFormIsActive}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {t('common.save') || 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: 16,
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
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  reminderDate: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  reminderTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  reminderContent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    ...typography.label,
    color: colors.text,
  },
  formInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTextarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  rtlInput: {
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.background,
  },
  bottomSpacer: {
    height: 40,
  },
});
