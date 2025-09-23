import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../../hooks/useLocation';
import MapComponent from './MapComponent';

export default function LocationScreen() {
  const {
    locationInfo,
    loading,
    loadLocationData,
    requestPermissionAndReload,
  } = useLocation();

  useEffect(() => {
    loadLocationData();
  }, [loadLocationData]);

  const handleRefresh = () => {
    loadLocationData();
  };

  const handleRequestPermission = () => {
    requestPermissionAndReload();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <VStack className="flex-1 p-4" space="lg">
        <Card className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <VStack space="md">
            <Heading size="md" className="text-gray-900 dark:text-white">
              Current Location
            </Heading>

            {loading ? (
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                Loading location...
              </Text>
            ) : locationInfo?.permissionStatus === 'granted' ? (
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    Latitude:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {locationInfo.latitude?.toFixed(6) || 'Not available'}
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    Longitude:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {locationInfo.longitude?.toFixed(6) || 'Not available'}
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    Accuracy:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {locationInfo.accuracy
                      ? `${locationInfo.accuracy.toFixed(2)}m`
                      : 'Not available'}
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    Altitude:
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {locationInfo.altitude
                      ? `${locationInfo.altitude.toFixed(2)}m`
                      : 'Not available'}
                  </Text>
                </HStack>

                {locationInfo.latitude && locationInfo.longitude && (
                  <Box className="mt-4">
                    <MapComponent
                      latitude={locationInfo.latitude}
                      longitude={locationInfo.longitude}
                    />
                  </Box>
                )}
              </VStack>
            ) : (
              <VStack space="sm">
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  {locationInfo?.error ||
                    'Location permission required to show current location'}
                </Text>
                <Button
                  onPress={handleRequestPermission}
                  className="bg-blue-600 dark:bg-blue-700"
                >
                  <ButtonText className="text-white">
                    Request Location Permission
                  </ButtonText>
                </Button>
              </VStack>
            )}

            <Button
              onPress={handleRefresh}
              variant="outline"
              className="mt-4 border-blue-200 dark:border-blue-800"
            >
              <ButtonText className="text-blue-600 dark:text-blue-400">
                Refresh Location
              </ButtonText>
            </Button>
          </VStack>
        </Card>
      </VStack>
    </SafeAreaView>
  );
}
