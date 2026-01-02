import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, defaultSettings, DailyPrayerTimes, Location, DailyReminder, AdminCredentials } from '../types';

const KEYS = {
  SETTINGS: '@horaire_settings',
  PRAYER_TIMES: '@horaire_prayer_times',
  LOCATION: '@horaire_location',
  LAST_SYNC: '@horaire_last_sync',
  REMINDERS: '@horaire_reminders',
  ADMIN: '@horaire_admin',
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

// ============= REMINDERS =============

// Get all reminders
export async function getReminders(): Promise<DailyReminder[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.REMINDERS);
    return data ? JSON.parse(data) : getDefaultReminders();
  } catch (error) {
    console.error('Error reading reminders:', error);
    return getDefaultReminders();
  }
}

// Save all reminders
export async function saveReminders(reminders: DailyReminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminders:', error);
    throw error;
  }
}

// Add a reminder
export async function addReminder(reminder: Omit<DailyReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyReminder> {
  const reminders = await getReminders();
  const newReminder: DailyReminder = {
    ...reminder,
    id: Date.now().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  reminders.push(newReminder);
  await saveReminders(reminders);
  return newReminder;
}

// Update a reminder
export async function updateReminder(id: string, updates: Partial<DailyReminder>): Promise<DailyReminder | null> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === id);
  if (index === -1) return null;

  reminders[index] = {
    ...reminders[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await saveReminders(reminders);
  return reminders[index];
}

// Delete a reminder
export async function deleteReminder(id: string): Promise<boolean> {
  const reminders = await getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  if (filtered.length === reminders.length) return false;
  await saveReminders(filtered);
  return true;
}

// Get reminder for today
export async function getTodayReminder(): Promise<DailyReminder | null> {
  const reminders = await getReminders();
  const today = new Date();
  const monthDay = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const fullDate = today.toISOString().split('T')[0];

  // First check for specific date reminder
  let reminder = reminders.find(r => r.date === fullDate && r.isActive);

  // If not found, check for recurring reminder (MM-DD format)
  if (!reminder) {
    reminder = reminders.find(r => r.date === monthDay && r.isActive);
  }

  // If still not found, get a random active reminder
  if (!reminder) {
    const activeReminders = reminders.filter(r => r.isActive);
    if (activeReminders.length > 0) {
      // Use day of year as seed for consistent daily reminder
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      reminder = activeReminders[dayOfYear % activeReminders.length];
    }
  }

  return reminder || null;
}

// ============= ADMIN =============

// Get admin credentials
export async function getAdminCredentials(): Promise<AdminCredentials> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ADMIN);
    return data ? JSON.parse(data) : { isAdmin: false, adminPin: '1234' };
  } catch (error) {
    console.error('Error reading admin credentials:', error);
    return { isAdmin: false, adminPin: '1234' };
  }
}

// Save admin credentials
export async function saveAdminCredentials(credentials: AdminCredentials): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ADMIN, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error saving admin credentials:', error);
    throw error;
  }
}

// Verify admin PIN
export async function verifyAdminPin(pin: string): Promise<boolean> {
  const credentials = await getAdminCredentials();
  return credentials.adminPin === pin;
}

// Default reminders (sample data)
function getDefaultReminders(): DailyReminder[] {
  return [
    {
      id: '1',
      date: '01-01',
      titleFr: 'Bonne année Hijri',
      titleAr: 'سنة هجرية مباركة',
      contentFr: 'Que cette nouvelle année soit remplie de bénédictions et de bonnes actions.',
      contentAr: 'نسأل الله أن تكون هذه السنة مليئة بالبركات والأعمال الصالحة',
      source: 'Rappel annuel',
      category: 'general',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '2',
      date: '01-02',
      titleFr: 'L\'importance du Dhikr',
      titleAr: 'أهمية الذكر',
      contentFr: 'Le Prophète ﷺ a dit : "L\'exemple de celui qui invoque son Seigneur et de celui qui ne L\'invoque pas est comme l\'exemple du vivant et du mort."',
      contentAr: 'قال رسول الله ﷺ: مثل الذي يذكر ربه والذي لا يذكره مثل الحي والميت',
      source: 'Sahih al-Bukhari 6407',
      category: 'hadith',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '3',
      date: '01-03',
      titleFr: 'Sourate Al-Ikhlas',
      titleAr: 'سورة الإخلاص',
      contentFr: 'Dis : "Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n\'a jamais engendré, n\'a pas été engendré non plus. Et nul n\'est égal à Lui."',
      contentAr: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      source: 'Coran 112:1-4',
      category: 'quran',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '4',
      date: '01-04',
      titleFr: 'Invocation du matin',
      titleAr: 'دعاء الصباح',
      contentFr: 'Ô Allah, par Toi nous arrivons au matin et par Toi nous arrivons au soir, par Toi nous vivons et par Toi nous mourons et vers Toi est le retour.',
      contentAr: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
      source: 'Sunan At-Tirmidhi 3391',
      category: 'dua',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '5',
      date: '01-05',
      titleFr: 'La patience',
      titleAr: 'الصبر',
      contentFr: 'Allah est avec les patients. La patience est lumière, et la précipitation vient de Satan.',
      contentAr: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ - الصبر ضياء والعجلة من الشيطان',
      source: 'Sagesse islamique',
      category: 'wisdom',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}
