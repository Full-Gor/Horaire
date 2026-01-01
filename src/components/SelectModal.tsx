import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius, neuShadow } from '../theme/colors';
import { typography } from '../theme/typography';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SelectModal({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: Props) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['rgba(37, 37, 48, 0.98)', 'rgba(30, 30, 36, 0.98)']}
            style={styles.gradient}
          />

          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                  ]}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.subtitle && (
                      <Text style={styles.optionSubtitle}>
                        {option.subtitle}
                      </Text>
                    )}
                  </View>

                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Feather name="check" size={20} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...neuShadow.floating,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textDim,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  selectedOption: {
    backgroundColor: colors.primaryMuted,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...typography.body,
  },
  selectedLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.small,
    marginTop: 4,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});
