import * as ExpoLocation from 'expo-location';
import { Location } from '../types';

// Request location permissions
export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === 'granted';
}

// Get current location
export async function getCurrentLocation(): Promise<Location | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.log('Location permission not granted');
      return null;
    }

    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocode to get city name
    const [address] = await ExpoLocation.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return {
      latitude,
      longitude,
      city: address?.city || address?.subregion || undefined,
      country: address?.country || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

// Check if location services are enabled
export async function isLocationEnabled(): Promise<boolean> {
  return ExpoLocation.hasServicesEnabledAsync();
}

// Get location from coordinates
export async function getLocationFromCoords(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  try {
    const [address] = await ExpoLocation.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return {
      latitude,
      longitude,
      city: address?.city || address?.subregion || undefined,
      country: address?.country || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return {
      latitude,
      longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// Search for location by city name
export async function searchLocation(query: string): Promise<Location[]> {
  try {
    const results = await ExpoLocation.geocodeAsync(query);

    const locations: Location[] = await Promise.all(
      results.slice(0, 5).map(async (result) => {
        const [address] = await ExpoLocation.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        });

        return {
          latitude: result.latitude,
          longitude: result.longitude,
          city: address?.city || address?.subregion || query,
          country: address?.country || undefined,
        };
      })
    );

    return locations;
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
}

// Watch location changes
export async function watchLocation(
  callback: (location: Location) => void
): Promise<ExpoLocation.LocationSubscription | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    return ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.Balanced,
        distanceInterval: 100, // Update every 100 meters
      },
      async (location) => {
        const loc = await getLocationFromCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        if (loc) {
          callback(loc);
        }
      }
    );
  } catch (error) {
    console.error('Error watching location:', error);
    return null;
  }
}

// Default locations (major cities)
export const defaultLocations: Location[] = [
  { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France' },
  { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' },
  { latitude: 24.4539, longitude: 39.6142, city: 'Medina', country: 'Saudi Arabia' },
  { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
  { latitude: 41.0082, longitude: 28.9784, city: 'Istanbul', country: 'Turkey' },
  { latitude: 33.8886, longitude: 35.4955, city: 'Beirut', country: 'Lebanon' },
  { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK' },
  { latitude: 40.7128, longitude: -74.006, city: 'New York', country: 'USA' },
  { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' },
  { latitude: 1.3521, longitude: 103.8198, city: 'Singapore', country: 'Singapore' },
];
