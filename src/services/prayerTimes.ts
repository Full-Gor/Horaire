import {
  Location,
  CalculationMethod,
  Madhab,
  DailyPrayerTimes,
  PrayerName,
  PrayerTimeInfo,
  QiblaDirection,
  HijriDate,
  CalculationMethodInfo,
} from '../types';

// Calculation method parameters
const CALCULATION_METHODS: Record<CalculationMethod, CalculationMethodInfo> = {
  uoif: { id: 'uoif', name: 'UOIF / Institut Sounnah', fajrAngle: 12, ishaAngle: 12 },
  mwl: { id: 'mwl', name: 'Muslim World League', fajrAngle: 18, ishaAngle: 17 },
  isna: { id: 'isna', name: 'ISNA', fajrAngle: 15, ishaAngle: 15 },
  egypt: { id: 'egypt', name: 'Egyptian Authority', fajrAngle: 19.5, ishaAngle: 17.5 },
  makkah: { id: 'makkah', name: 'Umm al-Qura', fajrAngle: 18.5, ishaAngle: 90 }, // 90 minutes after Maghrib
  karachi: { id: 'karachi', name: 'University of Karachi', fajrAngle: 18, ishaAngle: 18 },
  tehran: { id: 'tehran', name: 'Tehran', fajrAngle: 17.7, ishaAngle: 14 },
  jafari: { id: 'jafari', name: 'Shia Ithna Ashari', fajrAngle: 16, ishaAngle: 14 },
};

// Kaaba coordinates
const KAABA = {
  latitude: 21.4225,
  longitude: 39.8262,
};

// Convert degrees to radians
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Convert radians to degrees
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

// Calculate Julian Date
function getJulianDate(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

// Calculate sun position
function getSunPosition(julianDate: number): { declination: number; equation: number } {
  const d = julianDate - 2451545;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * Math.sin(toRadians(g)) + 0.02 * Math.sin(toRadians(2 * g))) % 360;
  const e = 23.439 - 0.00000036 * d;
  const declination = toDegrees(Math.asin(Math.sin(toRadians(e)) * Math.sin(toRadians(l))));
  const ra = toDegrees(Math.atan2(Math.cos(toRadians(e)) * Math.sin(toRadians(l)), Math.cos(toRadians(l)))) / 15;
  const equation = q / 15 - (ra % 24);

  return { declination, equation };
}

// Calculate prayer time for angle
function calculatePrayerTime(
  angle: number,
  latitude: number,
  declination: number,
  isRising: boolean
): number {
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);

  const cosHour =
    (Math.sin(toRadians(angle)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  if (cosHour > 1 || cosHour < -1) {
    return NaN;
  }

  const hour = toDegrees(Math.acos(cosHour)) / 15;
  return isRising ? 12 - hour : 12 + hour;
}

// Calculate Asr time
function calculateAsrTime(
  latitude: number,
  declination: number,
  madhab: Madhab
): number {
  const factor = madhab === 'hanafi' ? 2 : 1;
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);

  const asrAngle = -toDegrees(
    Math.atan(1 / (factor + Math.tan(Math.abs(latRad - decRad))))
  );

  return calculatePrayerTime(asrAngle, latitude, declination, false);
}

// Format time as HH:mm (normalize to 0-24 range)
function formatTime(hours: number): string {
  // Normalize to 0-24 range
  let h = hours;
  while (h < 0) h += 24;
  while (h >= 24) h -= 24;

  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);

  // Handle edge case where rounding gives 60 minutes
  if (min === 60) {
    return `${(hour + 1).toString().padStart(2, '0')}:00`;
  }

  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// Main calculation function
export function calculatePrayerTimes(
  date: Date,
  location: Location,
  method: CalculationMethod,
  madhab: Madhab,
  adjustments?: Record<PrayerName, number>
): DailyPrayerTimes {
  const jd = getJulianDate(date);
  const { declination, equation } = getSunPosition(jd);
  const methodParams = CALCULATION_METHODS[method];

  // Calculate midday (solar noon)
  const timezone = -date.getTimezoneOffset() / 60;
  const midday = 12 + timezone - location.longitude / 15 - equation;

  // Calculate sunrise and sunset
  const sunrise = calculatePrayerTime(-0.833, location.latitude, declination, true) + timezone - location.longitude / 15 - equation;
  const sunset = calculatePrayerTime(-0.833, location.latitude, declination, false) + timezone - location.longitude / 15 - equation;

  // Calculate Fajr
  const fajr = calculatePrayerTime(-methodParams.fajrAngle, location.latitude, declination, true) + timezone - location.longitude / 15 - equation;

  // Calculate Isha
  let isha: number;
  if (methodParams.ishaAngle === 90) {
    // Umm al-Qura: 90 minutes after Maghrib
    isha = sunset + 1.5;
  } else {
    isha = calculatePrayerTime(-methodParams.ishaAngle, location.latitude, declination, false) + timezone - location.longitude / 15 - equation;
  }

  // Calculate Asr
  const asr = calculateAsrTime(location.latitude, declination, madhab) + timezone - location.longitude / 15 - equation;

  // Apply adjustments
  const adj = adjustments || { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

  return {
    date: date.toISOString().split('T')[0],
    fajr: formatTime(fajr + adj.fajr / 60),
    sunrise: formatTime(sunrise + adj.sunrise / 60),
    dhuhr: formatTime(midday + adj.dhuhr / 60),
    asr: formatTime(asr + adj.asr / 60),
    maghrib: formatTime(sunset + adj.maghrib / 60),
    isha: formatTime(isha + adj.isha / 60),
  };
}

// Get current/next prayer info
export function getPrayerTimeInfo(
  prayerTimes: DailyPrayerTimes,
  currentDate: Date
): PrayerTimeInfo[] {
  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

  const result: PrayerTimeInfo[] = [];
  let nextFound = false;

  for (let i = 0; i < prayers.length; i++) {
    const name = prayers[i];
    const timeStr = prayerTimes[name];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;

    const timestamp = new Date(currentDate);
    timestamp.setHours(hours, minutes, 0, 0);

    const isPassed = currentTime > prayerMinutes;
    const isNext = !isPassed && !nextFound;

    if (isNext) {
      nextFound = true;
    }

    // Current prayer is the previous one if not passed yet
    const isCurrent = i > 0 && !isPassed && result[i - 1]?.isPassed;

    result.push({
      name,
      time: timeStr,
      timestamp: timestamp.getTime(),
      isNext,
      isCurrent: isCurrent || false,
      isPassed,
    });
  }

  return result;
}

// Get next prayer
export function getNextPrayer(prayerTimes: DailyPrayerTimes, currentDate: Date): PrayerTimeInfo | null {
  const info = getPrayerTimeInfo(prayerTimes, currentDate);
  return info.find(p => p.isNext) || null;
}

// Calculate time until next prayer
export function getTimeUntilPrayer(prayerTime: string, currentDate: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
  const prayerDate = new Date(currentDate);
  prayerDate.setHours(prayerHours, prayerMinutes, 0, 0);

  // If prayer time has passed, assume it's for tomorrow
  if (prayerDate.getTime() < currentDate.getTime()) {
    prayerDate.setDate(prayerDate.getDate() + 1);
  }

  const diff = prayerDate.getTime() - currentDate.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

// Calculate Qibla direction
export function calculateQiblaDirection(location: Location): QiblaDirection {
  const lat1 = toRadians(location.latitude);
  const lon1 = toRadians(location.longitude);
  const lat2 = toRadians(KAABA.latitude);
  const lon2 = toRadians(KAABA.longitude);

  const dLon = lon2 - lon1;

  const x = Math.sin(dLon);
  const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);

  let qibla = toDegrees(Math.atan2(x, y));
  if (qibla < 0) {
    qibla += 360;
  }

  // Calculate distance using Haversine formula
  const a =
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // Earth's radius in km

  return {
    direction: Math.round(qibla * 10) / 10,
    distance: Math.round(distance),
  };
}

// Convert Gregorian to Hijri date
export function gregorianToHijri(date: Date): HijriDate {
  const jd = getJulianDate(date);
  const l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
  ];

  return {
    day,
    month,
    monthName: hijriMonths[month - 1] || '',
    year,
    designation: 'AH',
    formatted: `${day} ${hijriMonths[month - 1]} ${year} AH`,
  };
}

// Get calculation methods list
export function getCalculationMethods(): CalculationMethodInfo[] {
  return Object.values(CALCULATION_METHODS);
}
