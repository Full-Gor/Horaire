import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerName, DailyPrayerTimes } from '../types';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Horaires de prière',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4ade80',
      sound: 'adhan.wav',
    });

    await Notifications.setNotificationChannelAsync('prayer-reminders', {
      name: 'Rappels de prière',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4ade80',
    });
  }

  return true;
}

// Schedule notification for a prayer
export async function schedulePrayerNotification(
  prayer: PrayerName,
  time: Date,
  prayerLabel: string,
  isReminder: boolean = false,
  minutesBefore: number = 0
): Promise<string | undefined> {
  try {
    const triggerTime = new Date(time);
    if (isReminder && minutesBefore > 0) {
      triggerTime.setMinutes(triggerTime.getMinutes() - minutesBefore);
    }

    // Don't schedule if time has passed
    if (triggerTime.getTime() <= Date.now()) {
      return undefined;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: isReminder ? '🕌 Rappel de prière' : '🕌 Heure de prière',
        body: isReminder
          ? `${prayerLabel} dans ${minutesBefore} minutes`
          : `C'est l'heure de ${prayerLabel}`,
        data: { prayer, type: isReminder ? 'reminder' : 'adhan' },
        sound: isReminder ? 'default' : 'adhan.wav',
        categoryIdentifier: 'prayer',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
        channelId: isReminder ? 'prayer-reminders' : 'prayer-times',
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return undefined;
  }
}

// Schedule all prayer notifications for a day
export async function scheduleDailyNotifications(
  prayerTimes: DailyPrayerTimes,
  date: Date,
  prayerLabels: Record<PrayerName, string>,
  minutesBefore: number = 15,
  includeReminders: boolean = true
): Promise<void> {
  const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // Cancel existing notifications first
  await cancelAllNotifications();

  for (const prayer of prayers) {
    const timeStr = prayerTimes[prayer];
    const [hours, minutes] = timeStr.split(':').map(Number);

    const prayerDate = new Date(date);
    prayerDate.setHours(hours, minutes, 0, 0);

    // Schedule adhan notification
    await schedulePrayerNotification(prayer, prayerDate, prayerLabels[prayer], false);

    // Schedule reminder notification
    if (includeReminders && minutesBefore > 0) {
      await schedulePrayerNotification(
        prayer,
        prayerDate,
        prayerLabels[prayer],
        true,
        minutesBefore
      );
    }
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// Add notification listener
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Add notification response listener
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
