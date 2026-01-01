import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, defaultSettings, DailyPrayerTimes, Location } from '../types';

const KEYS = {
  SETTINGS: '@horaire_settings',
  PRAYER_TIMES: '@horaire_prayer_times',
  LOCATION: '@horaire_location',
  LAST_SYNC: '@horaire_last_sync',
};

// Settings
export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error reading settings:', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  await saveSettings(updated);
  return updated;
}

// Prayer times cache
export async function getCachedPrayerTimes(date: string): Promise<DailyPrayerTimes | null> {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.PRAYER_TIMES}_${date}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading cached prayer times:', error);
    return null;
  }
}

export async function cachePrayerTimes(prayerTimes: DailyPrayerTimes): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${KEYS.PRAYER_TIMES}_${prayerTimes.date}`,
      JSON.stringify(prayerTimes)
    );
  } catch (error) {
    console.error('Error caching prayer times:', error);
  }
}

// Location
export async function getStoredLocation(): Promise<Location | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.LOCATION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading stored location:', error);
    return null;
  }
}

export async function storeLocation(location: Location): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LOCATION, JSON.stringify(location));
  } catch (error) {
    console.error('Error storing location:', error);
  }
}

// Last sync timestamp
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    console.error('Error reading last sync time:', error);
    return null;
  }
}

export async function setLastSyncTime(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, timestamp.toString());
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const horaireKeys = keys.filter(key => key.startsWith('@horaire'));
    await AsyncStorage.multiRemove(horaireKeys);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
