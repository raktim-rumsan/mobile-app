import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { check, PERMISSIONS, request } from 'react-native-permissions';

// Types
export interface LocationInfo {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  permissionStatus:
    | 'granted'
    | 'denied'
    | 'not-determined'
    | 'blocked'
    | 'unavailable';
  error?: string;
}

// Utility functions
export const getLocationPermission = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    try {
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        return permissionStatus.state;
      }
      return 'prompt';
    } catch {
      return 'unavailable';
    }
  } else if (Platform.OS === 'android') {
    try {
      // Use built-in PermissionsAndroid for Android
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return hasPermission ? 'granted' : 'denied';
    } catch (error) {
      console.error('Android permission check error:', error);
      return 'unavailable';
    }
  } else {
    // For iOS, try expo-location first, fallback to react-native-permissions
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (expoError) {
      console.log(
        'Expo Location not available, falling back to react-native-permissions',
      );
      try {
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result;
      } catch (permError) {
        console.error('Permission check error:', permError);
        return 'unavailable';
      }
    }
  }
};

export const requestLocationPermission = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    // For web, we'll use the geolocation API directly
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve('denied');
          } else {
            resolve('blocked');
          }
        },
        { timeout: 5000 },
      );
    });
  } else if (Platform.OS === 'android') {
    try {
      // Use built-in PermissionsAndroid for Android
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message:
            'This app needs location access to get location and WiFi information',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED
        ? 'granted'
        : 'denied';
    } catch (error) {
      console.error('Android permission request error:', error);
      return 'unavailable';
    }
  } else {
    // For iOS, try expo-location first, fallback to react-native-permissions
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status;
    } catch (expoError) {
      console.log(
        'Expo Location not available, falling back to react-native-permissions',
      );
      try {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result;
      } catch (permError) {
        console.error('Permission request error:', permError);
        return 'unavailable';
      }
    }
  }
};

// Get location information
export const getLocationInfo = async (): Promise<LocationInfo> => {
  try {
    const permissionStatus = await getLocationPermission();

    if (permissionStatus !== 'granted') {
      return {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
        speed: null,
        heading: null,
        timestamp: null,
        permissionStatus: permissionStatus as any,
        error: 'Location permission not granted',
      };
    }

    if (Platform.OS === 'web') {
      // Use web geolocation API
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000,
          });
        },
      );

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
        permissionStatus: 'granted',
      };
    } else {
      // Try expo-location first, fallback to web API for native platforms
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 1,
        });

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          heading: location.coords.heading,
          timestamp: location.timestamp,
          permissionStatus: 'granted',
        };
      } catch (expoError) {
        console.log(
          'Expo Location not available, falling back to web geolocation API',
        );
        // Fallback to web geolocation API even on native platforms
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 30000,
            });
          },
        );

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
          permissionStatus: 'granted',
        };
      }
    }
  } catch (error: any) {
    console.error('Location error:', error);
    return {
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      speed: null,
      heading: null,
      timestamp: null,
      permissionStatus: 'denied',
      error: error?.message || 'Error getting location',
    };
  }
};

// Custom hook for location functionality
export const useLocation = () => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLocationData = useCallback(async () => {
    setLoading(true);
    try {
      const locationData = await getLocationInfo();
      setLocationInfo(locationData);
    } catch (error) {
      console.error('Error loading location data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load location data on mount
  useEffect(() => {
    loadLocationData();
  }, [loadLocationData]);

  const requestPermissionAndReload = useCallback(async () => {
    try {
      const result = await requestLocationPermission();
      if (result === 'granted') {
        const newLocationInfo = await getLocationInfo();
        setLocationInfo(newLocationInfo);
        return { success: true, locationInfo: newLocationInfo };
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get location information.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return { success: false, locationInfo: null };
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
      return { success: false, locationInfo: null };
    }
  }, []);

  return {
    locationInfo,
    loading,
    loadLocationData,
    requestPermissionAndReload,
    getLocationPermission,
    requestLocationPermission,
    getLocationInfo,
  };
};
