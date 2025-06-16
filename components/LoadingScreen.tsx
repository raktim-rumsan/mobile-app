import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen = ({
  message = 'Loading...',
}: LoadingScreenProps) => {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#4285F4" style={styles.spinner} />
      {message && <ThemedText style={styles.message}>{message}</ThemedText>}
    </ThemedView>
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
