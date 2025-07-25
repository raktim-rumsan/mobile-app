import { Text } from '@/components/ui';
import { WALLET_INFO } from '@/constants/wallet';
import { iWalletBackup } from '@/plugins/wallet-setup/iWalletBackup';
import { Wallet } from 'ethers';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { setup } from './setup';

export default function WalletRestore(props: {
  walletSetup: iWalletBackup;
  createNewWallet: (archiveFileName?: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [address, setAddress] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [encryptedWallet, setEncryptedWallet] = useState<{
    fileId: string;
    content: string;
  } | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const getEncryptedWallet = useCallback(async () => {
    setPendingMessage('Fetching wallet from backup...');
    const _encryptedWallet =
      await props.walletSetup.getEncryptedWalletFromBackup();

    if (!_encryptedWallet) {
      console.log('No encrypted wallet found in backup.');
      return;
    }

    try {
      const encryptedWalletJson = JSON.parse(_encryptedWallet.content);
      setAddress(encryptedWalletJson.address);
    } catch (error) {
      console.error('Error parsing encrypted wallet JSON:', error);
      return;
    }

    setEncryptedWallet(_encryptedWallet);
    setPendingMessage(null);
  }, []);

  const handleRestoreWallet = async () => {
    if (!encryptedWallet) {
      setPasswordError('No encrypted wallet found in backup.');
      return;
    }
    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    setPasswordError('');
    setPendingMessage('Restoring wallet...');
    try {
      const wallet = Wallet.fromEncryptedJsonSync(
        encryptedWallet.content,
        password,
      );
      await setup.setWallet(wallet);
      router.push('/login');
    } catch {
      setAttemptCount((prev) => prev + 1);
      setPasswordError(
        'Failed to restore wallet. Please check your password. Attempt: ' +
          (attemptCount + 1),
      );
      setPendingMessage(null);
      return;
    }

    setPendingMessage(null);
  };

  const archiveWalletAndCreateNew = useCallback(async () => {
    if (!encryptedWallet) {
      console.error('No encrypted wallet to archive.');
      return;
    }
    if (!address) {
      console.error('No wallet address found to archive.');
      return;
    }
    const archiveName = await props.walletSetup.archiveEncryptedWallet(address);
    if (!archiveName) {
      console.error('Failed to archive the wallet.');
      return;
    }
    props.createNewWallet(archiveName);
  }, [address, encryptedWallet, props]);

  useEffect(() => {
    getEncryptedWallet();
  }, [getEncryptedWallet]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.heading}>Restore Existing Wallet</Text>
      <Text className="mt-4 text-center">
        Existing backup wallet found. Let&#39;s restore it.
      </Text>
      {address && (
        <Text className="m-2 text-center">
          Wallet Address: <Text className="font-medium">{address}</Text>
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter Password..."
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {passwordError ? (
        <Text style={{ color: 'red', marginTop: 5 }}>{passwordError}</Text>
      ) : (
        <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
          The password will be used to decrypt your wallet. It is more than 4
          characters long.
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          (pendingMessage && styles.disabledButton) ||
          !password ||
          password.length < 4
            ? styles.disabledButton
            : {},
        ]}
        onPress={handleRestoreWallet}
        disabled={pendingMessage !== null || !password}
      >
        <Text
          style={styles.buttonText}
          className="text-white font-medium text-center"
        >
          {pendingMessage ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.buttonText}>{pendingMessage + '...'}</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Decrypt Wallet</Text>
          )}
        </Text>
      </TouchableOpacity>

      {attemptCount > 2 && (
        <>
          <TouchableOpacity
            style={[styles.createButton]}
            onPress={archiveWalletAndCreateNew}
          >
            <Text
              style={styles.buttonText}
              className="text-white font-medium text-center"
            >
              <Text style={styles.buttonText}>Create New Wallet</Text>
            </Text>
          </TouchableOpacity>
          <Text
            style={{ fontSize: 12, color: '#666' }}
            className="mt-1 text-center"
          >
            The existing wallet will be renamed to{' '}
            <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
              {WALLET_INFO.BACKUP_FILE_NAME}|{address}
            </Text>
            .
          </Text>
        </>
      )}
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
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 16,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 48,
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
