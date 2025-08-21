import { Text } from '@/components/ui';
import { iWalletPlugin } from '@/core/types/iWalletPlugin';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { hostService } from '../services/hostService';

export default function WalletCreateNew(props: { walletSetup: iWalletPlugin }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [log, setLog] = useState<{ message: string; isError: boolean } | null>(
    null,
  );

  const showLog = React.useCallback(
    (message: string, isError: boolean = false) => {
      setLog({ message, isError });
    },
    [],
  );

  const showError = React.useCallback((message: string) => {
    setLog({ message, isError: true });
  }, []);

  const handleCreateWallet = async () => {
    if (password.length < 4) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    setPasswordError('');
    setCreatingWallet(true);

    const wallet = await props.walletSetup.createAndBackupWallet(password, {
      log: showLog,
    });
    if (!wallet) {
      setCreatingWallet(false);
      showError('Failed to create wallet. Please try again.');
      return;
    }

    await hostService.setWallet(wallet);
    router.push('/home');
    setCreatingWallet(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.heading}>Create New Wallet</Text>
      <Text style={{ marginVertical: 10 }}>
        No wallet backups found. Let&#39;s create a new wallet and back it up to
        Google Drive.
      </Text>

      <Text style={{ marginBottom: 5 }}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a strong password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {passwordError ? (
        <Text style={{ color: 'red', marginTop: 5 }}>{passwordError}</Text>
      ) : (
        <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
          This password will be used to encrypt your wallet. Make sure it&#39;s
          strong and you remember it.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, creatingWallet && styles.disabledButton]}
        onPress={handleCreateWallet}
        disabled={creatingWallet}
      >
        <Text
          style={styles.buttonText}
          className="text-white font-medium text-center"
        >
          {creatingWallet ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.buttonText}>Creating Wallet...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Create Wallet</Text>
          )}
        </Text>
      </TouchableOpacity>
      <Text className="mt-4">{log?.message}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
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
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
});
