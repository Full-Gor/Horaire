// Prayer names
export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

// Prayer time for a single prayer
export interface PrayerTime {
  name: PrayerName;
  time: string; // Format: "HH:mm"
  timestamp: number; // Unix timestamp
}

// All prayer times for a day
export interface DailyPrayerTimes {
  date: string; // Format: "YYYY-MM-DD"
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

// Hijri date
export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  designation: string;
  formatted: string;
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
}

// Qibla direction
export interface QiblaDirection {
  direction: number; // Degrees from North
  distance: number; // Distance to Kaaba in km
}

// Calculation method
export type CalculationMethod =
  | 'uoif'     // UOIF / Institut Sounnah (France) - 12°/12°
  | 'mwl'      // Muslim World League
  | 'isna'     // Islamic Society of North America
  | 'egypt'    // Egyptian General Authority of Survey
  | 'makkah'   // Umm al-Qura University, Makkah
  | 'karachi'  // University of Islamic Sciences, Karachi
  | 'tehran'   // Institute of Geophysics, University of Tehran
  | 'jafari';  // Shia Ithna Ashari, Leva Institute, Qum

// Madhab (affects Asr calculation)
export type Madhab = 'shafi' | 'hanafi';

// App settings
export interface AppSettings {
  language: string;
  calculationMethod: CalculationMethod;
  madhab: Madhab;
  notificationsEnabled: boolean;
  notificationMinutesBefore: number;
  location: Location | null;
  manualAdjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

// Notification
export interface PrayerNotification {
  id: string;
  prayer: PrayerName;
  time: Date;
  type: 'adhan' | 'reminder';
}

// Prayer time with additional info
export interface PrayerTimeInfo {
  name: PrayerName;
  time: string;
  timestamp: number;
  isNext: boolean;
  isCurrent: boolean;
  isPassed: boolean;
}

// Screen tab
export type TabName = 'home' | 'qibla' | 'settings';

// Navigation
export interface TabConfig {
  name: TabName;
  icon: string;
  label: string;
}

// Calculation method details
export interface CalculationMethodInfo {
  id: CalculationMethod;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  description?: string;
}

// Default settings
export const defaultSettings: AppSettings = {
  language: 'fr',
  calculationMethod: 'uoif',
  madhab: 'shafi',
  notificationsEnabled: true,
  notificationMinutesBefore: 15,
  location: null,
  manualAdjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

// Prayer colors for UI
export const prayerColors: Record<PrayerName, string> = {
  fajr: '#6366f1',
  sunrise: '#f59e0b',
  dhuhr: '#eab308',
  asr: '#f97316',
  maghrib: '#ec4899',
  isha: '#8b5cf6',
};

// Arabic prayer names
export const arabicPrayerNames: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};
