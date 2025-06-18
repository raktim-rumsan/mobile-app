import { Text } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function WalletSetupProgress(props: {
  progressLog: { title: string; isError?: boolean }[];
}) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {props.progressLog.map((step, index) => (
          <View
            key={index}
            style={{
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View>
              <Text
                style={
                  step.isError
                    ? { color: 'red', fontSize: 18 }
                    : styles.checkmark
                }
              >
                {step.isError ? '✗' : '✓'}
              </Text>
            </View>
            <Text style={{ marginLeft: 8, fontSize: 16 }}>{step.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
