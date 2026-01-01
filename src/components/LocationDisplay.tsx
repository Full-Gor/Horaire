import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { Location } from '../types';

interface Props {
  location: Location | null;
  onPress?: () => void;
  loading?: boolean;
}

export function LocationDisplay({ location, onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.iconContainer}>
        <Feather
          name={loading ? 'loader' : 'map-pin'}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.textContainer}>
        {location ? (
          <>
            <Text style={styles.city} numberOfLines={1}>
              {location.city || 'Unknown'}
            </Text>
            {location.country && (
              <Text style={styles.country} numberOfLines={1}>
                {location.country}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.placeholder}>
            {loading ? 'Localisation...' : 'Sélectionner la ville'}
          </Text>
        )}
      </View>

      <Feather name="chevron-right" size={18} color={colors.textDim} />
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  pressed: {
    backgroundColor: colors.cardBgDark,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  city: {
    ...typography.h4,
    fontSize: 16,
  },
  country: {
    ...typography.small,
    marginTop: 2,
  },
  placeholder: {
    ...typography.bodyMuted,
    fontStyle: 'italic',
  },
});
