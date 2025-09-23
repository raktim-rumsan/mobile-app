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
import { useLocation } from '@/core/hooks/useLocation';
import * as Device from 'expo-device';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';
import { NetworkInfo } from 'react-native-network-info';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
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

const DeviceDetailsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkConnectivity | null>(
    null,
  );
  const [wifiInfo, setWifiInfo] = useState<WiFiInfo | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);

  const { locationInfo, requestPermissionAndReload } = useLocation();

  // Enhanced location permission request with WiFi reload
  const handleRequestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      setLoading(true);
      const result = await requestPermissionAndReload();

      console.log('Permission request result:', result);

      if (result.success) {
        // Permission granted, also reload WiFi info immediately
        console.log('Location permission granted, reloading WiFi info...');
        await reloadWiFiInfo();
      } else {
        console.log('Location permission denied or failed');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    } finally {
      setLoading(false);
    }
  };

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
  const getWiFiInfo = useCallback(async (): Promise<WiFiInfo> => {
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
      console.log(
        'Current location permission status:',
        locationInfo?.permissionStatus,
      );

      if (locationInfo?.permissionStatus !== 'granted') {
        const permissionStatus =
          locationInfo?.permissionStatus || 'not-determined';
        let errorMessage = 'Location permission required for WiFi info';

        if (Platform.OS === 'android') {
          errorMessage =
            'Location permission is required to access WiFi information on Android devices';
        } else if (Platform.OS === 'ios') {
          errorMessage =
            'Location permission may be required for WiFi information';
        }

        return {
          ssid: null,
          bssid: null,
          ipAddress: null,
          frequency: null,
          signalStrength: null,
          permissionStatus: permissionStatus as any,
          error: errorMessage,
        };
      }

      console.log('Location permission granted, fetching WiFi info...');
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
  }, [locationInfo?.permissionStatus]);

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
      // Always load network and platform info
      const [networkData] = await Promise.all([checkInternetConnection()]);

      setNetworkInfo(networkData);
      setPlatformInfo(getPlatformInfo());

      // Load WiFi info - this will handle permission checking internally
      const wifiData = await getWiFiInfo();
      setWifiInfo(wifiData);
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setLoading(false);
    }
  }, [getWiFiInfo]);

  // Helper function to reload just WiFi data
  const reloadWiFiInfo = useCallback(async () => {
    try {
      console.log('Reloading WiFi info...');
      const wifiData = await getWiFiInfo();
      setWifiInfo(wifiData);
      console.log('WiFi info reloaded:', wifiData);
    } catch (error) {
      console.error('Error reloading WiFi info:', error);
    }
  }, [getWiFiInfo]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Monitor location permission changes and reload WiFi info
  useEffect(() => {
    console.log('Permission status check:', {
      locationPermission: locationInfo?.permissionStatus,
      wifiPermission: wifiInfo?.permissionStatus,
    });

    if (
      locationInfo?.permissionStatus === 'granted' &&
      wifiInfo?.permissionStatus !== 'granted'
    ) {
      // Permission was just granted, reload WiFi info
      console.log(
        'Location permission granted via useEffect, reloading WiFi info...',
      );
      reloadWiFiInfo();
    }
  }, [
    locationInfo?.permissionStatus,
    wifiInfo?.permissionStatus,
    reloadWiFiInfo,
  ]);

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
    isLoading: boolean = false,
  ) => {
    if (permissionStatus === 'granted') return null;

    return (
      <Button
        onPress={onPress}
        variant="outline"
        size="sm"
        className="mt-3 border-blue-200 dark:border-blue-800"
        disabled={isLoading}
      >
        <HStack space="xs" className="items-center">
          {isLoading && <Spinner size="small" className="text-blue-600" />}
          <ButtonText className="text-blue-600 dark:text-blue-400 text-xs">
            {isLoading
              ? 'Requesting...'
              : `Request ${permissionType} Permission`}
          </ButtonText>
        </HStack>
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
    <SafeAreaView className="flex-1">
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
                <VStack space="xs">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    {wifiInfo?.error ||
                      'Location permission is required to access WiFi information on Android devices.'}
                  </Text>
                  {wifiInfo?.permissionStatus === 'blocked' && (
                    <Text className="text-red-500 dark:text-red-400 text-xs italic">
                      Permission blocked. Please enable location permission in
                      device settings.
                    </Text>
                  )}
                </VStack>
              )}
              {renderPermissionButton(
                handleRequestLocationPermission,
                wifiInfo?.permissionStatus || 'unknown',
                'Location',
                loading,
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
