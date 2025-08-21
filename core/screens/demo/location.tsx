import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface AddressData {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
}

const LocationScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if ('geolocation' in navigator) {
        // Check if geolocation is available
        setPermissionStatus('available');
      } else {
        setPermissionStatus('unavailable');
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
      setPermissionStatus('error');
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Check if geolocation is supported
      if (!('geolocation' in navigator)) {
        setErrorMsg('Geolocation is not supported by this browser');
        Alert.alert(
          'Not Supported',
          'Geolocation is not supported by this browser.',
          [{ text: 'OK' }],
        );
        return;
      }

      // Get current location using web geolocation API
      const getCurrentPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            },
          );
        });
      };

      try {
        const position = await getCurrentPosition();
        setPermissionStatus('granted');

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        };

        setLocation(locationData);

        // Try to get address using reverse geocoding (simplified for web)
        try {
          // For web, we'll use a simple approach or you can integrate with a geocoding service
          // For now, we'll just show coordinates
          setAddress({
            street: 'Address lookup not available in web version',
            city: 'Use a geocoding service for full address',
            region: '',
            country: '',
            postalCode: '',
            name: '',
          });
        } catch (geocodeError) {
          console.warn('Reverse geocoding not available:', geocodeError);
        }
      } catch (geoError) {
        const error = geoError as GeolocationPositionError;
        let errorMessage = 'Failed to get location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            setPermissionStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }

        setErrorMsg(errorMessage);
        Alert.alert('Location Error', errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to get location. Please try again.');
      Alert.alert(
        'Location Error',
        'Unable to retrieve your location. Please check your browser settings and try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    if (permissionStatus === 'granted' || permissionStatus === 'available') {
      requestLocationPermission();
    } else {
      requestLocationPermission();
    }
  };

  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Information</Text>

      <View style={styles.permissionContainer}>
        <Text style={styles.label}>Permission Status:</Text>
        <Text
          style={[
            styles.permissionStatus,
            { color: permissionStatus === 'granted' ? '#4CAF50' : '#F44336' },
          ]}
        >
          {permissionStatus.toUpperCase()}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={refreshLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Getting Location...' : 'Get Current Location'}
        </Text>
      </TouchableOpacity>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {location && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Coordinates</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Latitude:</Text>
            <Text style={styles.value}>
              {formatCoordinate(location.latitude)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Longitude:</Text>
            <Text style={styles.value}>
              {formatCoordinate(location.longitude)}
            </Text>
          </View>
          {location.altitude !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Altitude:</Text>
              <Text style={styles.value}>
                {location.altitude?.toFixed(2)} m
              </Text>
            </View>
          )}
          {location.accuracy !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Accuracy:</Text>
              <Text style={styles.value}>
                {location.accuracy?.toFixed(2)} m
              </Text>
            </View>
          )}
          {location.speed !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Speed:</Text>
              <Text style={styles.value}>
                {(location.speed * 3.6).toFixed(2)} km/h
              </Text>
            </View>
          )}
          {location.heading !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Heading:</Text>
              <Text style={styles.value}>{location.heading?.toFixed(2)}°</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Timestamp:</Text>
            <Text style={styles.value}>
              {formatTimestamp(location.timestamp)}
            </Text>
          </View>
        </View>
      )}

      {address && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Address</Text>
          {address.name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Place:</Text>
              <Text style={styles.value}>{address.name}</Text>
            </View>
          )}
          {address.street && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Street:</Text>
              <Text style={styles.value}>{address.street}</Text>
            </View>
          )}
          {address.city && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{address.city}</Text>
            </View>
          )}
          {address.region && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Region:</Text>
              <Text style={styles.value}>{address.region}</Text>
            </View>
          )}
          {address.country && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Country:</Text>
              <Text style={styles.value}>{address.country}</Text>
            </View>
          )}
          {address.postalCode && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Postal Code:</Text>
              <Text style={styles.value}>{address.postalCode}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
});

export default LocationScreen;
