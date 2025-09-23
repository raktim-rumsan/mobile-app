import { Box } from '@/components/ui/box';
import React from 'react';
import { Platform, Text } from 'react-native';

// Conditional import for expo-maps (only on native platforms)
let AppleMaps: any = null;
let GoogleMaps: any = null;

if (Platform.OS !== 'web') {
  const ExpoMaps = require('expo-maps');
  AppleMaps = ExpoMaps.AppleMaps;
  GoogleMaps = ExpoMaps.GoogleMaps;
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude }) => {
  if (Platform.OS === 'web') {
    // For web, use OpenStreetMap embed
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
      longitude - 0.01
    },${latitude - 0.01},${longitude + 0.01},${
      latitude + 0.01
    }&layer=mapnik&marker=${latitude},${longitude}`;

    return (
      <Box className="h-48 w-full rounded-md overflow-hidden">
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Current Location Map"
        />
      </Box>
    );
  }

  // For mobile platforms, show interactive map with expo-maps
  if (Platform.OS === 'ios' && AppleMaps) {
    return (
      <Box className="h-48 w-full rounded-md overflow-hidden">
        <AppleMaps.View
          style={{ width: '100%', height: '100%' }}
          cameraPosition={{
            coordinates: { latitude, longitude },
            zoom: 15,
          }}
          properties={{
            isMyLocationEnabled: true,
          }}
          uiSettings={{
            myLocationButtonEnabled: true,
          }}
          markers={[
            {
              id: 'current-location',
              coordinates: { latitude, longitude },
              title: 'Current Location',
              tintColor: '#FF6B6B',
            },
          ]}
        />
      </Box>
    );
  } else if (Platform.OS === 'android' && GoogleMaps) {
    return (
      <Box className="h-48 w-full rounded-md overflow-hidden">
        <GoogleMaps.View
          style={{ width: '100%', height: '100%' }}
          cameraPosition={{
            coordinates: { latitude, longitude },
            zoom: 15,
          }}
          properties={{
            isMyLocationEnabled: true,
          }}
          uiSettings={{
            myLocationButtonEnabled: true,
          }}
          markers={[
            {
              id: 'current-location',
              coordinates: { latitude, longitude },
              title: 'Current Location',
              snippet: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
                6,
              )}`,
              showCallout: true,
            },
          ]}
        />
      </Box>
    );
  }

  // Fallback for other platforms
  return (
    <Box className="h-48 w-full rounded-md overflow-hidden bg-blue-50 flex items-center justify-center p-4">
      <Box className="items-center space-y-2">
        <Text className="text-gray-700 font-semibold text-lg">
          📍 Maps not supported
        </Text>
        <Text className="text-gray-600 text-center">
          Maps are only available on iOS and Android
        </Text>
      </Box>
    </Box>
  );
};

export default MapComponent;
