import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import './src/i18n';
import { HomeScreen, QiblaScreen, SettingsScreen } from './src/screens';
import { TabBar } from './src/components';
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';
import { TabName } from './src/types';
import { getSettings } from './src/services/storage';
import { requestNotificationPermissions } from './src/services/notifications';
import i18n from './src/i18n';

// Splash screen component
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-finish after 2 seconds
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={splashStyles.container}>
      <LinearGradient
        colors={[colors.background, '#151518', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          splashStyles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={splashStyles.iconContainer}>
          <Feather name="moon" size={60} color={colors.primary} />
        </View>
        <Animated.Text style={splashStyles.title}>
          Horaire Prière
        </Animated.Text>
        <Animated.Text style={splashStyles.subtitle}>
          مواقيت الصلاة
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[splashStyles.loader, { opacity: fadeAnim }]}>
        <View style={splashStyles.loaderBar}>
          <Animated.View
            style={[
              splashStyles.loaderProgress,
              {
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: colors.gold,
  },
  loader: {
    position: 'absolute',
    bottom: 100,
    width: 100,
  },
  loaderBar: {
    height: 4,
    backgroundColor: colors.cardBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderProgress: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [slideAnim] = useState(new Animated.Value(0));

  const initialize = useCallback(async () => {
    try {
      // Load saved settings
      const settings = await getSettings();

      // Change language if saved
      if (settings.language) {
        i18n.changeLanguage(settings.language);
      }

      // Request notification permissions if enabled
      if (settings.notificationsEnabled) {
        await requestNotificationPermissions();
      }
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSplashFinish = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTabChange = useCallback(
    (tab: TabName) => {
      const tabIndex = { home: 0, qibla: 1, settings: 2 };
      const currentIndex = tabIndex[activeTab];
      const newIndex = tabIndex[tab];

      Animated.timing(slideAnim, {
        toValue: newIndex,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      setActiveTab(tab);
    },
    [activeTab, slideAnim]
  );

  const handleLocationPress = useCallback(() => {
    // Navigate to settings to change location
    handleTabChange('settings');
  }, [handleTabChange]);

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onLocationPress={handleLocationPress} />;
      case 'qibla':
        return <QiblaScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onLocationPress={handleLocationPress} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background, '#151518', colors.background]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.screenContainer}>{renderScreen()}</View>

        <TabBar activeTab={activeTab} onTabPress={handleTabChange} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
