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
import { Alert, Linking, Platform } from 'react-native';
import {
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  MapPinIcon,
  SignalIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';

// Simple network detection without external dependencies
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
};

const getDeviceInfo = () => {
  const info: any = {};

  if (Platform.OS === 'web') {
    // Web-specific info
    info.userAgent = navigator.userAgent;
    info.platform = navigator.platform;
    info.language = navigator.language;
    info.cookieEnabled = navigator.cookieEnabled;
    info.onLine = navigator.onLine;
  }

  return info;
};

interface DeviceInfo {
  internet: {
    isConnected: boolean;
    type: string;
    isWifiEnabled: boolean;
    isInternetReachable: boolean;
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
  network: {
    ipAddress: string | null;
    networkState: string;
  };
}

export default function DeviceInfoScreen() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    internet: {
      isConnected: false,
      type: 'unknown',
      isWifiEnabled: false,
      isInternetReachable: false,
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
    network: {
      ipAddress: null,
      networkState: 'unknown',
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeviceInfo = async () => {
    try {
      // Basic network connectivity check
      const isConnected = await checkInternetConnection();
      const deviceInfo = getDeviceInfo();

      const networkInfo = {
        isConnected,
        type: Platform.OS,
        isWifiEnabled: Platform.OS === 'web' ? deviceInfo.onLine : false,
        isInternetReachable: isConnected,
      };

      // Basic device IP (not available in most mobile environments due to security)
      let ipAddress = null;
      if (Platform.OS === 'web') {
        // In web, we can't get the actual IP due to security restrictions
        ipAddress = 'Not available in browser';
      } else {
        ipAddress = 'Not available (requires native module)';
      }

      // WiFi Information (very limited without native modules)
      const wifiInfo = {
        ssid:
          Platform.OS === 'web'
            ? deviceInfo.onLine
              ? 'Connected (details not available)'
              : 'Not connected'
            : 'Requires native WiFi module',
        bssid: null,
        ipAddress,
      };

      // Location Information (using universal browser geolocation API)
      let locationInfo = {
        latitude: null as number | null,
        longitude: null as number | null,
        accuracy: null as number | null,
        address: null as string | null,
        permission: 'unknown',
      };

      // Check if geolocation is available (works on web, iOS, Android)
      if ('geolocation' in navigator) {
        try {
          // Check current permission state
          if ('permissions' in navigator) {
            const permissionStatus = await navigator.permissions.query({
              name: 'geolocation',
            });
            locationInfo.permission = permissionStatus.state;
          }

          // Try to get current position
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
              });
            },
          );

          locationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: 'Reverse geocoding not available',
            permission: 'granted',
          };
        } catch (error: any) {
          console.log('Location error:', error);
          // Determine permission status from error
          if (error.code === 1) {
            // PERMISSION_DENIED
            locationInfo.permission = 'denied';
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE
            locationInfo.permission = 'granted';
            locationInfo.address = 'Position unavailable';
          } else if (error.code === 3) {
            // TIMEOUT
            locationInfo.permission = 'granted';
            locationInfo.address = 'Request timed out';
          } else {
            locationInfo.permission = 'denied';
          }
        }
      } else {
        locationInfo.permission = 'not supported';
      }

      setDeviceInfo({
        internet: networkInfo,
        wifi: wifiInfo,
        location: locationInfo,
        network: {
          ipAddress,
          networkState: isConnected ? 'connected' : 'disconnected',
        },
      });
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

      // Request location permission by trying to get current position
      // This automatically triggers the permission request dialog
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0, // Force fresh location request
          });
        },
      );

      // If we get here, permission was granted
      Alert.alert(
        'Permission Granted',
        'Location permission has been granted. Refreshing device information...',
        [
          {
            text: 'OK',
            onPress: () => {
              setRefreshing(true);
              fetchDeviceInfo();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error requesting location permission:', error);

      let message = 'Failed to get location permission.';
      if (error.code === 1) {
        // PERMISSION_DENIED
        message =
          'Location permission was denied. You can enable it manually in your browser or device settings.';
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE
        message =
          'Location is unavailable. Please check your GPS and network connection.';
      } else if (error.code === 3) {
        // TIMEOUT
        message = 'Location request timed out. Please try again.';
      }

      Alert.alert('Location Request Failed', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
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
              label="Connection Type"
              value={deviceInfo.internet.type.toUpperCase()}
            />
            <InfoRow
              label="Internet Reachable"
              value={deviceInfo.internet.isInternetReachable ? 'Yes' : 'No'}
              badge={getStatusBadge(
                deviceInfo.internet.isInternetReachable,
                'Reachable',
                'Not Reachable',
              )}
            />
          </VStack>
        </InfoCard>

        {/* WiFi Information */}
        <InfoCard title="WiFi Information" icon={WifiIcon}>
          <VStack space="sm">
            <InfoRow
              label="WiFi Enabled"
              value={deviceInfo.internet.isWifiEnabled ? 'Yes' : 'No'}
              badge={getStatusBadge(
                deviceInfo.internet.isWifiEnabled,
                'Enabled',
                'Disabled',
              )}
            />
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

        {/* Network Information */}
        <InfoCard title="Network Details" icon={SignalIcon}>
          <VStack space="sm">
            <InfoRow
              label="Network State"
              value={deviceInfo.network.networkState}
              badge={getStatusBadge(
                deviceInfo.network.networkState === 'connected',
              )}
            />
            <InfoRow
              label="Device IP"
              value={deviceInfo.network.ipAddress || 'Not available'}
            />
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
            <InfoRow label="Platform" value={Platform.OS} />
            <InfoRow
              label="Version"
              value={Platform.Version?.toString() || 'Unknown'}
            />
            {Platform.OS === 'web' && (
              <>
                <InfoRow
                  label="User Agent"
                  value={getDeviceInfo().userAgent || 'Not available'}
                />
                <InfoRow
                  label="Language"
                  value={getDeviceInfo().language || 'Not available'}
                />
                <InfoRow
                  label="Cookies Enabled"
                  value={getDeviceInfo().cookieEnabled ? 'Yes' : 'No'}
                />
              </>
            )}
          </VStack>
        </InfoCard>

        <Box className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Text className="text-blue-800 dark:text-blue-200 text-sm text-center mb-2">
            Universal device information using standard web APIs - no native
            modules required!
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-xs text-center">
            • Location: Browser geolocation API (works on all platforms){'\n'}•
            Network: Standard fetch API for connectivity testing{'\n'}•
            Platform: React Native Platform API for device detection
          </Text>
        </Box>
      </VStack>
    </ScrollView>
  );
}
