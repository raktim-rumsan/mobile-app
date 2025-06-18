import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from './ui';

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen = ({
  message = 'Loading...',
}: LoadingScreenProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4285F4" style={styles.spinner} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
