import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useEffect, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  MapPinIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';
import { NetworkInfo } from 'react-native-network-info';

// Unified network and WiFi information getter
async function getNetworkInfo() {
  try {
    if (Platform.OS === 'android') {
      // Check location permission for WiFi SSID
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs location access to get WiFi information',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return {
            ssid: 'Permission denied',
            bssid: null,
            ipAddress: 'Permission required',
            error: 'Location permission denied',
          };
        }
      }

      // Get WiFi info for Android
      const ssid = await NetworkInfo.getSSID();
      const bssid = await NetworkInfo.getBSSID();
      const ipAddress = await NetworkInfo.getIPV4Address();

      return { ssid, bssid, ipAddress };
    } else if (Platform.OS === 'ios') {
      // Get WiFi info for iOS
      const ssid = await NetworkInfo.getSSID();
      const bssid = await NetworkInfo.getBSSID();
      const ipAddress = await NetworkInfo.getIPV4Address();

      return { ssid, bssid, ipAddress };
    } else if (Platform.OS === 'web') {
      // Web platform limitations
      return {
        ssid: navigator.onLine ? 'Connected (web browser)' : 'Not connected',
        bssid: 'Not available in browser',
        ipAddress: 'Not available in browser',
      };
    }

    return {
      ssid: 'Platform not supported',
      bssid: null,
      ipAddress: null,
    };
  } catch (error: any) {
    console.error('Error getting network info:', error);
    return {
      ssid: 'Error getting WiFi info',
      bssid: null,
      ipAddress: 'Error',
      error: error?.message || 'Unknown error',
    };
  }
}

// Simple internet connectivity check
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
};

// Get location information with proper platform handling and permission requests
const getLocationInfo = async () => {
  const defaultLocation = {
    latitude: null as number | null,
    longitude: null as number | null,
    accuracy: null as number | null,
    address: null as string | null,
    permission: 'unknown',
  };

  // Check if geolocation is available
  if (!('geolocation' in navigator)) {
    return { ...defaultLocation, permission: 'not supported' };
  }

  try {
    // Handle native platforms (iOS/Android) - request permission first
    if (Platform.OS === 'android') {
      // For Android, check location permission
      const hasLocationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (!hasLocationPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message:
              'This app needs location access to get your current location',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return {
            ...defaultLocation,
            permission: 'denied',
            address: 'Location permission denied',
          };
        }
      }
    }

    // For web platforms, check permission state if available
    if ('permissions' in navigator && Platform.OS === 'web') {
      const permissionStatus = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });

      if (permissionStatus.state === 'denied') {
        return {
          ...defaultLocation,
          permission: 'denied',
          address: 'Location permission denied in browser',
        };
      }

      defaultLocation.permission = permissionStatus.state;
    }

    // Get current position with proper error handling
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout for better reliability
          maximumAge: 30000, // Allow slightly cached location
        });
      },
    );

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      address: `${position.coords.latitude.toFixed(
        6,
      )}, ${position.coords.longitude.toFixed(6)}`,
      permission: 'granted',
    };
  } catch (error: any) {
    console.log('Location error:', error);

    // Handle different error types with more detailed responses
    if (error.code === 1) {
      return {
        ...defaultLocation,
        permission: 'denied',
        address: 'Location permission denied by user',
      };
    } else if (error.code === 2) {
      return {
        ...defaultLocation,
        permission: 'granted',
        address: 'Location unavailable - check GPS/network',
      };
    } else if (error.code === 3) {
      return {
        ...defaultLocation,
        permission: 'granted',
        address: 'Location request timed out - try again',
      };
    }

    // Handle Android permission errors specifically
    if (Platform.OS === 'android' && error.message?.includes('permission')) {
      return {
        ...defaultLocation,
        permission: 'denied',
        address: 'Android location permission required',
      };
    }

    return {
      ...defaultLocation,
      permission: 'error',
      address: `Error: ${error.message || 'Unknown location error'}`,
    };
  }
};

interface DeviceInfo {
  internet: {
    isConnected: boolean;
    type: string;
  };
  wifi: {
    ssid: string | null;
    bssid: string | null;
    ipAddress: string | null;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    address: string | null;
    permission: string;
  };
  platform: {
    os: string;
    version: string;
    userAgent?: string;
    language?: string;
    cookieEnabled?: boolean;
  };
}

export default function DeviceInfoScreen() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    internet: {
      isConnected: false,
      type: 'unknown',
    },
    wifi: {
      ssid: null,
      bssid: null,
      ipAddress: null,
    },
    location: {
      latitude: null,
      longitude: null,
      accuracy: null,
      address: null,
      permission: 'unknown',
    },
    platform: {
      os: Platform.OS,
      version: Platform.Version?.toString() || 'Unknown',
      userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
      language: Platform.OS === 'web' ? navigator.language : undefined,
      cookieEnabled:
        Platform.OS === 'web' ? navigator.cookieEnabled : undefined,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeviceInfo = async () => {
    try {
      // Check internet connectivity
      const isConnected = await checkInternetConnection();

      // Get network/WiFi information
      const networkData = await getNetworkInfo();

      // Get location information
      const locationData = await getLocationInfo();

      setDeviceInfo((prev) => ({
        ...prev,
        internet: {
          isConnected,
          type: Platform.OS,
        },
        wifi: {
          ssid: networkData.ssid,
          bssid: networkData.bssid,
          ipAddress: networkData.ipAddress,
        },
        location: locationData,
      }));
    } catch (error) {
      console.error('Error fetching device info:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeviceInfo();
  };

  const requestLocationPermission = async () => {
    try {
      if (!('geolocation' in navigator)) {
        Alert.alert(
          'Location Not Supported',
          'Geolocation is not supported on this device or browser.',
          [{ text: 'OK' }],
        );
        return;
      }

      setRefreshing(true);

      // Request location by trying to get current position
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0, // Force fresh location request
          });
        },
      );

      // Update location info immediately
      setDeviceInfo((prev) => ({
        ...prev,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: `${position.coords.latitude.toFixed(
            6,
          )}, ${position.coords.longitude.toFixed(6)}`,
          permission: 'granted',
        },
      }));

      Alert.alert(
        'Location Access Granted',
        'Location information has been updated successfully.',
        [{ text: 'OK' }],
      );
    } catch (error: any) {
      console.error('Error requesting location permission:', error);

      let message = 'Failed to get location permission.';
      if (error.code === 1) {
        message =
          'Location permission was denied. You can enable it in your device/browser settings.';
      } else if (error.code === 2) {
        message =
          'Location is unavailable. Please check your GPS and network connection.';
      } else if (error.code === 3) {
        message = 'Location request timed out. Please try again.';
      }

      Alert.alert('Location Request Failed', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const openLocationSettings = () => {
    Alert.alert(
      'Location Permission',
      'To get location information, please enable location permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
  };

  const getStatusBadge = (
    status: boolean,
    connectedText: string = 'Connected',
    disconnectedText: string = 'Disconnected',
  ) => (
    <Badge
      action={status ? 'success' : 'error'}
      variant="solid"
      className="ml-2"
    >
      <BadgeText>{status ? connectedText : disconnectedText}</BadgeText>
    </Badge>
  );

  const InfoCard = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Box className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <HStack className="items-center mb-3">
        <Icon as={icon} size="lg" className="text-blue-600 mr-2" />
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
      </HStack>
      {children}
    </Box>
  );

  const InfoRow = ({
    label,
    value,
    badge,
  }: {
    label: string;
    value: string;
    badge?: React.ReactNode;
  }) => (
    <HStack className="justify-between items-center py-2">
      <Text className="text-gray-600 dark:text-gray-300 font-medium">
        {label}:
      </Text>
      <HStack className="items-center">
        <Text className="text-gray-900 dark:text-white">{value}</Text>
        {badge}
      </HStack>
    </HStack>
  );

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <Text className="mt-4 text-gray-600 dark:text-gray-300">
          Loading device information...
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <VStack className="p-4">
        <HStack className="justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Device Information
          </Text>
          <Pressable
            onPress={handleRefresh}
            className="bg-blue-600 px-4 py-2 rounded-lg"
            disabled={refreshing}
          >
            {refreshing ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Refresh</Text>
            )}
          </Pressable>
        </HStack>

        {/* Internet Connectivity */}
        <InfoCard title="Internet Connectivity" icon={GlobeAltIcon}>
          <VStack space="sm">
            <InfoRow
              label="Status"
              value={
                deviceInfo.internet.isConnected ? 'Connected' : 'Disconnected'
              }
              badge={getStatusBadge(deviceInfo.internet.isConnected)}
            />
            <InfoRow
              label="Platform"
              value={deviceInfo.internet.type.toUpperCase()}
            />
          </VStack>
        </InfoCard>

        {/* WiFi Information */}
        <InfoCard title="WiFi Information" icon={WifiIcon}>
          <VStack space="sm">
            <InfoRow
              label="SSID"
              value={deviceInfo.wifi.ssid || 'Not available'}
            />
            <InfoRow
              label="IP Address"
              value={deviceInfo.wifi.ipAddress || 'Not available'}
            />
            {deviceInfo.wifi.bssid && (
              <InfoRow label="BSSID" value={deviceInfo.wifi.bssid} />
            )}
          </VStack>
        </InfoCard>

        {/* Location Information */}
        <InfoCard title="Location Information" icon={MapPinIcon}>
          <VStack space="sm">
            <InfoRow
              label="Permission"
              value={deviceInfo.location.permission}
              badge={getStatusBadge(
                deviceInfo.location.permission === 'granted',
                'Granted',
                'Denied',
              )}
            />
            {deviceInfo.location.permission !== 'granted' ? (
              <VStack space="sm" className="mt-2">
                <Pressable
                  onPress={requestLocationPermission}
                  className="bg-green-600 p-3 rounded-lg"
                >
                  <HStack className="items-center justify-center">
                    <Icon
                      as={MapPinIcon}
                      size="sm"
                      className="text-white mr-2"
                    />
                    <Text className="text-white font-medium">
                      Request Location Permission
                    </Text>
                  </HStack>
                </Pressable>
                <Pressable
                  onPress={openLocationSettings}
                  className="bg-orange-500 p-3 rounded-lg"
                >
                  <HStack className="items-center justify-center">
                    <Icon
                      as={ExclamationTriangleIcon}
                      size="sm"
                      className="text-white mr-2"
                    />
                    <Text className="text-white font-medium">
                      Open Device Settings
                    </Text>
                  </HStack>
                </Pressable>
              </VStack>
            ) : (
              <>
                <InfoRow
                  label="Latitude"
                  value={
                    deviceInfo.location.latitude?.toFixed(6) || 'Not available'
                  }
                />
                <InfoRow
                  label="Longitude"
                  value={
                    deviceInfo.location.longitude?.toFixed(6) || 'Not available'
                  }
                />
                <InfoRow
                  label="Accuracy"
                  value={
                    deviceInfo.location.accuracy
                      ? `${deviceInfo.location.accuracy.toFixed(0)}m`
                      : 'Not available'
                  }
                />
                <InfoRow
                  label="Address"
                  value={deviceInfo.location.address || 'Not available'}
                />
              </>
            )}
          </VStack>
        </InfoCard>

        {/* Bluetooth Information */}
        <InfoCard title="Bluetooth Information" icon={DevicePhoneMobileIcon}>
          <VStack space="sm">
            <Box className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <HStack className="items-center">
                <Icon
                  as={ExclamationTriangleIcon}
                  size="sm"
                  className="text-yellow-600 mr-2"
                />
                <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Bluetooth information requires additional native modules and
                  permissions
                </Text>
              </HStack>
            </Box>
            <InfoRow
              label="Status"
              value="Feature requires native implementation"
            />
          </VStack>
        </InfoCard>

        {/* Platform Information */}
        <InfoCard title="Platform Information" icon={DevicePhoneMobileIcon}>
          <VStack space="sm">
            <InfoRow label="Platform" value={deviceInfo.platform.os} />
            <InfoRow label="Version" value={deviceInfo.platform.version} />
            {Platform.OS === 'web' && (
              <>
                <InfoRow
                  label="User Agent"
                  value={deviceInfo.platform.userAgent || 'Not available'}
                />
                <InfoRow
                  label="Language"
                  value={deviceInfo.platform.language || 'Not available'}
                />
                <InfoRow
                  label="Cookies Enabled"
                  value={deviceInfo.platform.cookieEnabled ? 'Yes' : 'No'}
                />
              </>
            )}
          </VStack>
        </InfoCard>

        <Box className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Text className="text-blue-800 dark:text-blue-200 text-sm text-center mb-2">
            📱 Cross-Platform Device Information
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-xs text-center">
            • Location: Uses native geolocation API (works on web, iOS, Android)
            {'\n'}• Network: WiFi details with proper permission handling{'\n'}•
            Platform: Detects web, iOS, or Android with version info{'\n'}•
            Internet: Real connectivity testing via network requests
          </Text>
        </Box>
      </VStack>
    </ScrollView>
  );
}
