import React from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, neuShadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { TabName } from '../types';
import { useTranslation } from 'react-i18next';

interface TabConfig {
  name: TabName;
  icon: keyof typeof Feather.glyphMap;
  labelKey: string;
}

const tabs: TabConfig[] = [
  { name: 'home', icon: 'home', labelKey: 'app.name' },
  { name: 'qibla', icon: 'compass', labelKey: 'qibla.title' },
  { name: 'settings', icon: 'settings', labelKey: 'settings.title' },
];

interface Props {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export function TabBar({ activeTab, onTabPress }: Props) {
  const { t } = useTranslation();

  const handlePress = (tab: TabName) => {
    Vibration.vibrate(10);
    onTabPress(tab);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(30, 30, 36, 0.95)', 'rgba(26, 26, 31, 0.98)']}
        style={styles.gradient}
      />

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <Pressable
              key={tab.name}
              onPress={() => handlePress(tab.name)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              {isActive && (
                <LinearGradient
                  colors={[colors.primaryMuted, 'transparent']}
                  style={styles.activeGradient}
                />
              )}

              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer,
                ]}
              >
                <Feather
                  name={tab.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.textDim}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                ]}
              >
                {t(tab.labelKey).split(' ')[0]}
              </Text>

              {isActive && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  activeTab: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  activeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: colors.primaryMuted,
  },
  label: {
    ...typography.tiny,
    marginTop: 4,
    color: colors.textDim,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
