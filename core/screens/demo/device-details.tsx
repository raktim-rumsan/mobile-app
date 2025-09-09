import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  MapPinIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';
import { NetworkInfo } from 'react-native-network-info';
import { check, PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
interface LocationInfo {
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

interface NetworkConnectivity {
  isConnected: boolean;
  connectionType: string;
  isInternetReachable: boolean | null;
}

interface WiFiInfo {
  ssid: string | null;
  bssid: string | null;
  ipAddress: string | null;
  frequency: number | null;
  signalStrength: number | null;
  permissionStatus:
    | 'granted'
    | 'denied'
    | 'not-determined'
    | 'blocked'
    | 'unavailable';
  error?: string;
}

interface PlatformInfo {
  os: string;
  osVersion: string;
  deviceModel: string;
  deviceName: string;
  brand: string;
  manufacturer: string;
  deviceId: string;
  isEmulator: boolean;
  isTablet: boolean;
}

// Utility functions
const getLocationPermission = async (): Promise<string> => {
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

const requestLocationPermission = async (): Promise<string> => {
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

const DeviceDetailsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkConnectivity | null>(
    null,
  );
  const [wifiInfo, setWifiInfo] = useState<WiFiInfo | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);

  // Check internet connectivity
  const checkInternetConnection = async (): Promise<NetworkConnectivity> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        isConnected: true,
        connectionType: 'unknown',
        isInternetReachable: true,
      };
    } catch {
      return {
        isConnected: false,
        connectionType: 'none',
        isInternetReachable: false,
      };
    }
  };

  // Get WiFi information
  const getWiFiInfo = async (): Promise<WiFiInfo> => {
    try {
      if (Platform.OS === 'web') {
        return {
          ssid: navigator.onLine ? 'Connected (Web)' : 'Disconnected',
          bssid: 'Not available in browser',
          ipAddress: 'Not available in browser',
          frequency: null,
          signalStrength: null,
          permissionStatus: 'unavailable',
        };
      }

      // Check location permission for WiFi info (required on Android)
      const permissionStatus = await getLocationPermission();

      if (permissionStatus !== 'granted') {
        return {
          ssid: null,
          bssid: null,
          ipAddress: null,
          frequency: null,
          signalStrength: null,
          permissionStatus: permissionStatus as any,
          error: 'Location permission required for WiFi info on Android',
        };
      }

      const ssid = await NetworkInfo.getSSID();
      const bssid = await NetworkInfo.getBSSID();
      const ipAddress = await NetworkInfo.getIPV4Address();

      // Debug information
      console.log('WiFi Debug Info:', {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        ssid,
        bssid,
        bssidType: typeof bssid,
        bssidLength: bssid?.length,
        ipAddress,
      });

      // Check if BSSID looks like a MAC address (format: XX:XX:XX:XX:XX:XX)
      const isMacFormat =
        bssid && /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(bssid);

      let processedBssid = bssid;
      if (bssid && !isMacFormat) {
        // On iOS 14+, BSSID might be scrambled for privacy
        if (Platform.OS === 'ios' && parseFloat(Platform.Version) >= 14) {
          processedBssid = `${bssid} (Privacy Protected)`;
        } else if (bssid === '02:00:00:00:00:00') {
          processedBssid = 'Generic/Hidden BSSID';
        } else if (bssid.includes('unknown') || bssid.includes('null')) {
          processedBssid = 'Not available';
        }
      }

      return {
        ssid,
        bssid: processedBssid,
        ipAddress,
        frequency: null,
        signalStrength: null,
        permissionStatus: 'granted',
      };
    } catch (error: any) {
      console.error('WiFi info error:', error);
      return {
        ssid: null,
        bssid: null,
        ipAddress: null,
        frequency: null,
        signalStrength: null,
        permissionStatus: 'unavailable',
        error: error?.message || 'Error getting WiFi info',
      };
    }
  };

  // Get location information
  const getLocationInfo = async (): Promise<LocationInfo> => {
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

  // Get platform information
  const getPlatformInfo = (): PlatformInfo => {
    if (Platform.OS === 'web') {
      return {
        os: Platform.OS,
        osVersion: Platform.Version.toString(),
        deviceModel: navigator.userAgent,
        deviceName: 'Web Browser',
        brand: 'Browser',
        manufacturer: 'Browser',
        deviceId: 'Web',
        isEmulator: false,
        isTablet: window.innerWidth > 768,
      };
    } else {
      // Try expo-device first, fallback to basic Platform info
      try {
        return {
          os: Platform.OS,
          osVersion: Platform.Version.toString(),
          deviceModel: Device.modelName || 'Unknown',
          deviceName: Device.deviceName || 'Unknown',
          brand: Device.brand || 'Unknown',
          manufacturer: Device.manufacturer || 'Unknown',
          deviceId: Device.osInternalBuildId || 'Unknown',
          isEmulator: Device.isDevice === false,
          isTablet: Device.deviceType === Device.DeviceType.TABLET,
        };
      } catch (deviceError) {
        console.log('Expo Device not available, using basic Platform info');
        return {
          os: Platform.OS,
          osVersion: Platform.Version.toString(),
          deviceModel: 'Unknown',
          deviceName: 'Unknown',
          brand: 'Unknown',
          manufacturer: 'Unknown',
          deviceId: 'Unknown',
          isEmulator: false,
          isTablet: false,
        };
      }
    }
  };

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [networkData, wifiData, locationData] = await Promise.all([
        checkInternetConnection(),
        getWiFiInfo(),
        getLocationInfo(),
      ]);

      setNetworkInfo(networkData);
      setWifiInfo(wifiData);
      setLocationInfo(locationData);
      setPlatformInfo(getPlatformInfo());
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // Request location permission and reload
  const handleLocationPermissionRequest = async () => {
    try {
      const result = await requestLocationPermission();
      if (result === 'granted') {
        const newLocationInfo = await getLocationInfo();
        setLocationInfo(newLocationInfo);
        // Also refresh WiFi info since it needs location permission
        const newWifiInfo = await getWiFiInfo();
        setWifiInfo(newWifiInfo);
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get location and WiFi information.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const renderInfoCard = (
    title: string,
    icon: any,
    children: React.ReactNode,
    loading: boolean = false,
  ) => (
    <Card className="p-5 mb-4 bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700">
      <VStack space="md">
        <HStack className="items-center justify-between">
          <HStack className="items-center" space="sm">
            <Box className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Icon
                as={icon}
                size="lg"
                className="text-blue-600 dark:text-blue-400"
              />
            </Box>
            <Heading
              size="md"
              className="text-gray-900 dark:text-white font-semibold"
            >
              {title}
            </Heading>
          </HStack>
          {loading && <Spinner size="small" className="text-blue-600" />}
        </HStack>
        <Divider className="my-2 bg-gray-100 dark:bg-gray-700" />
        <Box className="px-1">{children}</Box>
      </VStack>
    </Card>
  );

  const renderPermissionButton = (
    onPress: () => void,
    permissionStatus: string,
    permissionType: string,
  ) => {
    if (permissionStatus === 'granted') return null;

    return (
      <Button
        onPress={onPress}
        variant="outline"
        size="sm"
        className="mt-3 border-blue-200 dark:border-blue-800"
      >
        <ButtonText className="text-blue-600 dark:text-blue-400 text-xs">
          Request {permissionType} Permission
        </ButtonText>
      </Button>
    );
  };

  const getStatusBadge = (
    status: string,
    type: 'permission' | 'connection',
  ) => {
    let variant: 'outline' | 'solid' = 'outline';
    let text = status;
    let badgeClass = '';

    if (type === 'permission') {
      switch (status) {
        case 'granted':
          variant = 'solid';
          text = 'Granted';
          badgeClass =
            'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800';
          break;
        case 'denied':
          variant = 'outline';
          text = 'Denied';
          badgeClass =
            'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800';
          break;
        case 'blocked':
          variant = 'outline';
          text = 'Blocked';
          badgeClass =
            'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800';
          break;
        case 'unavailable':
          variant = 'outline';
          text = 'Unavailable';
          badgeClass =
            'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
          break;
        default:
          variant = 'outline';
          text = 'Unknown';
          badgeClass =
            'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      }
    } else {
      if (status === 'true' || status === 'Connected') {
        variant = 'solid';
        badgeClass =
          'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800';
      } else {
        variant = 'outline';
        badgeClass =
          'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800';
      }
    }

    return (
      <Badge
        variant={variant}
        size="sm"
        className={`rounded-full ${badgeClass}`}
      >
        <BadgeText className="text-xs font-medium">{text}</BadgeText>
      </Badge>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ScrollView className="flex-1 px-4 py-2">
        <VStack space="lg">
          {/* Header with refresh button */}
          <HStack className="items-center justify-between mb-6 pt-2">
            <Heading
              size="xl"
              className="text-gray-900 dark:text-white font-bold"
            >
              Device Details
            </Heading>
            <Pressable
              onPress={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 shadow-sm border border-blue-200 dark:border-blue-800"
            >
              <Icon
                as={ArrowPathIcon}
                size="md"
                className={`text-blue-600 dark:text-blue-400 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
            </Pressable>
          </HStack>

          {/* Internet Connectivity Card */}
          {renderInfoCard(
            'Internet Connectivity',
            GlobeAltIcon,
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Status:
                </Text>
                {getStatusBadge(
                  networkInfo?.isConnected ? 'Connected' : 'Disconnected',
                  'connection',
                )}
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Internet Reachable:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {networkInfo?.isInternetReachable === null
                    ? 'Unknown'
                    : networkInfo?.isInternetReachable
                    ? 'Yes'
                    : 'No'}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Connection Type:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {networkInfo?.connectionType || 'Unknown'}
                </Text>
              </HStack>
            </VStack>,
            loading,
          )}

          {/* WiFi Information Card */}
          {renderInfoCard(
            'WiFi Information',
            WifiIcon,
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Permission:
                </Text>
                {getStatusBadge(
                  wifiInfo?.permissionStatus || 'unknown',
                  'permission',
                )}
              </HStack>
              {wifiInfo?.permissionStatus === 'granted' ? (
                <>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      SSID:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {wifiInfo.ssid || 'Not available'}
                    </Text>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      BSSID:
                    </Text>
                    <VStack className="items-end">
                      <Text className="text-gray-900 dark:text-white text-xs">
                        {wifiInfo.bssid || 'Not available'}
                      </Text>
                      {wifiInfo.bssid &&
                        !wifiInfo.bssid.match(
                          /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                        ) && (
                          <Text className="text-gray-500 dark:text-gray-400 text-xs italic mt-1">
                            {Platform.OS === 'ios'
                              ? 'iOS privacy protected'
                              : 'May be scrambled for privacy'}
                          </Text>
                        )}
                    </VStack>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      IP Address:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {wifiInfo.ipAddress || 'Not available'}
                    </Text>
                  </HStack>
                </>
              ) : (
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                  {wifiInfo?.error ||
                    'Permission required to access WiFi information'}
                </Text>
              )}
              {renderPermissionButton(
                handleLocationPermissionRequest,
                wifiInfo?.permissionStatus || 'unknown',
                'Location',
              )}
            </VStack>,
            loading,
          )}

          {/* Location Information Card */}
          {renderInfoCard(
            'Location Information',
            MapPinIcon,
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Permission:
                </Text>
                {getStatusBadge(
                  locationInfo?.permissionStatus || 'unknown',
                  'permission',
                )}
              </HStack>
              {locationInfo?.permissionStatus === 'granted' ? (
                <>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      Latitude:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {locationInfo.latitude?.toFixed(6) || 'Not available'}
                    </Text>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      Longitude:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {locationInfo.longitude?.toFixed(6) || 'Not available'}
                    </Text>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      Accuracy:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {locationInfo.accuracy
                        ? `${locationInfo.accuracy.toFixed(2)}m`
                        : 'Not available'}
                    </Text>
                  </HStack>
                  <HStack className="items-center justify-between">
                    <Text className="text-gray-700 dark:text-gray-300 text-xs">
                      Altitude:
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-xs">
                      {locationInfo.altitude
                        ? `${locationInfo.altitude.toFixed(2)}m`
                        : 'Not available'}
                    </Text>
                  </HStack>
                </>
              ) : (
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                  {locationInfo?.error ||
                    'Permission required to access location information'}
                </Text>
              )}
              {renderPermissionButton(
                handleLocationPermissionRequest,
                locationInfo?.permissionStatus || 'unknown',
                'Location',
              )}
            </VStack>,
            loading,
          )}

          {/* Platform Information Card */}
          {renderInfoCard(
            'Platform Information',
            DevicePhoneMobileIcon,
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Operating System:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {platformInfo?.os || 'Unknown'}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  OS Version:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {platformInfo?.osVersion || 'Unknown'}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Name:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {platformInfo?.deviceName || 'Unknown'}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Model:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {`${platformInfo?.manufacturer} - ${platformInfo?.deviceModel}` ||
                    'Unknown'}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="text-gray-700 dark:text-gray-300 text-xs">
                  Is Tablet:
                </Text>
                <Text className="text-gray-900 dark:text-white text-xs">
                  {platformInfo?.isTablet ? 'Yes' : 'No'}
                </Text>
              </HStack>
            </VStack>,
            loading,
          )}
        </VStack>
        {/* Bottom padding for better scroll experience */}
        <Box className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceDetailsScreen;
