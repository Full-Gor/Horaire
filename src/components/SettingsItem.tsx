import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showChevron?: boolean;
}

export function SettingsItem({
  icon,
  iconColor = colors.primary,
  title,
  subtitle,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  showChevron = true,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isSwitch}
      style={({ pressed }) => [
        styles.container,
        pressed && !isSwitch && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.cardBgDark, true: colors.primaryMuted }}
          thumbColor={switchValue ? colors.primary : colors.textDim}
        />
      ) : (
        <View style={styles.rightSection}>
          {value && <Text style={styles.value}>{value}</Text>}
          {showChevron && (
            <Feather name="chevron-right" size={20} color={colors.textDim} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  pressed: {
    backgroundColor: colors.cardBgDark,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontSize: 15,
  },
  subtitle: {
    ...typography.small,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    ...typography.small,
    color: colors.primary,
    marginRight: 8,
  },
});
