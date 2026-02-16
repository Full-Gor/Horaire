import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Magnetometer } from 'expo-sensors';

import { GlassCard, NeuCard } from '../components';
import { colors, borderRadius, neuShadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { calculateQiblaDirection } from '../services/prayerTimes';
import { getCurrentLocation } from '../services/location';
import { getSettings } from '../services/storage';
import { Location, QiblaDirection } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPASS_SIZE = SCREEN_WIDTH * 0.75;

function getHeadingFromMagnetometer(data: { x: number; y: number; z: number }): number {
  let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
  // Adjust for device orientation (magnetometer returns bearing from East)
  angle = angle - 90;
  if (angle < 0) angle += 360;
  return angle;
}

export function QiblaScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [qibla, setQibla] = useState<QiblaDirection | null>(null);
  const [heading, setHeading] = useState(0);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true);
  const compassRotation = useRef(new Animated.Value(0)).current;
  const lastHeading = useRef(0);

  const loadQibla = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getSettings();
      let loc = settings.location;

      if (!loc) {
        loc = await getCurrentLocation();
      }

      if (loc) {
        setLocation(loc);
        const direction = calculateQiblaDirection(loc);
        setQibla(direction);
      }
    } catch (error) {
      console.error('Error calculating qibla:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup magnetometer
  useEffect(() => {
    let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;

    const startMagnetometer = async () => {
      const available = await Magnetometer.isAvailableAsync();
      if (!available) {
        setMagnetometerAvailable(false);
        return;
      }

      Magnetometer.setUpdateInterval(100);

      subscription = Magnetometer.addListener((data) => {
        const newHeading = getHeadingFromMagnetometer(data);
        setHeading(newHeading);

        // Smooth animation: handle 360°→0° wrap-around
        let diff = newHeading - lastHeading.current;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        const currentVal = lastHeading.current + diff;
        lastHeading.current = newHeading;

        Animated.timing(compassRotation, {
          toValue: -currentVal,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    };

    startMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [compassRotation]);

  useEffect(() => {
    loadQibla();
  }, [loadQibla]);

  // Compass rotation: the dial rotates opposite to phone heading
  // so that "N" always points to actual North
  const compassRotateStyle = {
    transform: [
      {
        rotate: compassRotation.interpolate({
          inputRange: [-720, 720],
          outputRange: ['-720deg', '720deg'],
        }),
      },
    ],
  };

  // Qibla pointer rotation: fixed offset from North = qibla direction
  // Combined with compass rotation so pointer always points to Qibla
  const qiblaAngle = qibla ? qibla.direction : 0;
  const qiblaRotateStyle = {
    transform: [
      {
        rotate: compassRotation.interpolate({
          inputRange: [-720, 720],
          outputRange: [
            `${-720 + qiblaAngle}deg`,
            `${720 + qiblaAngle}deg`,
          ],
        }),
      },
    ],
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.background, '#151518', colors.background]}
        style={styles.backgroundGradient}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('qibla.title')}</Text>
          {location && (
            <Text style={styles.locationText}>
              {location.city}, {location.country}
            </Text>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <GlassCard style={styles.compassCard} intensity="strong">
            <View style={styles.compassInner}>
              {/* Outer glow */}
              <View style={styles.compassGlow} />

              {/* Compass dial - rotates with phone */}
              <Animated.View style={[styles.compassDial, compassRotateStyle]}>
                <Svg
                  width={COMPASS_SIZE}
                  height={COMPASS_SIZE}
                  viewBox="0 0 200 200"
                >
                  {/* Outer circle */}
                  <Circle
                    cx="100"
                    cy="100"
                    r="95"
                    stroke={colors.cardBgLight}
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Direction marks */}
                  {[...Array(72)].map((_, i) => {
                    const angle = i * 5;
                    const isMain = angle % 90 === 0;
                    const isSecondary = angle % 45 === 0;
                    const innerRadius = isMain ? 75 : isSecondary ? 80 : 85;
                    const x1 =
                      100 + innerRadius * Math.sin((angle * Math.PI) / 180);
                    const y1 =
                      100 - innerRadius * Math.cos((angle * Math.PI) / 180);
                    const x2 = 100 + 90 * Math.sin((angle * Math.PI) / 180);
                    const y2 = 100 - 90 * Math.cos((angle * Math.PI) / 180);

                    return (
                      <Line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={
                          isMain
                            ? colors.primary
                            : isSecondary
                            ? colors.textMuted
                            : colors.textDim
                        }
                        strokeWidth={isMain ? 2 : 1}
                      />
                    );
                  })}

                  {/* Cardinal directions */}
                  <SvgText
                    x="100"
                    y="30"
                    textAnchor="middle"
                    fill={colors.primary}
                    fontSize="16"
                    fontWeight="bold"
                  >
                    N
                  </SvgText>
                  <SvgText
                    x="170"
                    y="105"
                    textAnchor="middle"
                    fill={colors.textMuted}
                    fontSize="14"
                  >
                    E
                  </SvgText>
                  <SvgText
                    x="100"
                    y="180"
                    textAnchor="middle"
                    fill={colors.textMuted}
                    fontSize="14"
                  >
                    S
                  </SvgText>
                  <SvgText
                    x="30"
                    y="105"
                    textAnchor="middle"
                    fill={colors.textMuted}
                    fontSize="14"
                  >
                    W
                  </SvgText>

                  {/* Center circle */}
                  <Circle
                    cx="100"
                    cy="100"
                    r="8"
                    fill={colors.cardBg}
                    stroke={colors.primary}
                    strokeWidth="2"
                  />
                </Svg>
              </Animated.View>

              {/* Kaaba pointer - rotates to always point toward Qibla */}
              <Animated.View style={[styles.kaabaPointerAnimated, qiblaRotateStyle]}>
                <View style={styles.kaabaIcon}>
                  <Text style={styles.kaabaEmoji}>🕋</Text>
                </View>
                <View style={styles.pointerLine} />
              </Animated.View>
            </View>
          </GlassCard>
        </View>

        {/* Info cards */}
        {qibla && (
          <View style={styles.infoContainer}>
            <NeuCard style={styles.infoCard}>
              <Feather name="compass" size={24} color={colors.primary} />
              <Text style={styles.infoValue}>{qibla.direction}°</Text>
              <Text style={styles.infoLabel}>{t('qibla.direction')}</Text>
            </NeuCard>

            <NeuCard style={styles.infoCard}>
              <Feather name="map-pin" size={24} color={colors.gold} />
              <Text style={styles.infoValue}>{qibla.distance.toLocaleString()}</Text>
              <Text style={styles.infoLabel}>{t('qibla.km')}</Text>
            </NeuCard>
          </View>
        )}

        {/* Instructions / Calibration warning */}
        <GlassCard style={styles.instructionCard} intensity="light">
          <Feather
            name={magnetometerAvailable ? 'info' : 'alert-triangle'}
            size={20}
            color={magnetometerAvailable ? colors.textMuted : colors.gold}
          />
          <Text style={styles.instructionText}>
            {magnetometerAvailable
              ? 'Tenez votre téléphone à plat. La boussole suit votre orientation — alignez la Kaaba 🕋 devant vous.'
              : 'Magnétomètre indisponible. La direction est calculée mais la boussole ne suivra pas votre orientation.'}
          </Text>
        </GlassCard>
      </View>
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
    marginTop: 16,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
  },
  locationText: {
    ...typography.bodyMuted,
    marginTop: 4,
  },
  compassContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  compassCard: {
    padding: 24,
    borderRadius: COMPASS_SIZE / 2 + 24,
  },
  compassInner: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.primary,
    opacity: 0.05,
  },
  compassDial: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  kaabaPointerAnimated: {
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    left: COMPASS_SIZE / 2 - 22,
    width: 44,
    height: COMPASS_SIZE / 2,
    transformOrigin: `22px ${COMPASS_SIZE / 2}px`,
  },
  kaabaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...neuShadow.raised,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  kaabaEmoji: {
    fontSize: 24,
  },
  pointerLine: {
    width: 3,
    height: 40,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginTop: -4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  infoCard: {
    alignItems: 'center',
    padding: 20,
    minWidth: 120,
  },
  infoValue: {
    ...typography.h2,
    marginTop: 8,
  },
  infoLabel: {
    ...typography.small,
    marginTop: 4,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 'auto',
    marginBottom: 100,
  },
  instructionText: {
    ...typography.small,
    marginLeft: 12,
    flex: 1,
  },
});
