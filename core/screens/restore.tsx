import { LoadingScreen } from '@/components/LoadingScreen';
import { View } from '@/components/Themed';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Progress,
  ProgressFilledTrack,
  SafeAreaView,
  Text,
  VStack,
} from '@/components/ui';
import { WALLET_INFO } from '@/core/constants/wallet';
import { iWalletPlugin } from '@/core/types/iWalletPlugin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHostService } from '../services/hostService';
import {
  AsyncWalletDecryption,
  DecryptionProgress,
} from '../services/nonBlockingDecryption';
import { AppError } from '../utils/error';

export default function WalletRestore(props: {
  walletSetup: iWalletPlugin;
  address: string | null;
  createNewWallet: (archiveFileName?: string) => void;
}) {
  const { setWallet } = useHostService();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [encryptedWallet, setEncryptedWallet] = useState<{
    fileId: string;
    content: string;
  } | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const decryptionService = useRef(AsyncWalletDecryption.getInstance());

  const getEncryptedWallet = useCallback(async () => {
    setPendingMessage('Fetching wallet from backup...');
    const _encryptedWallet =
      await props.walletSetup.getEncryptedWalletFromBackup();
    if (!_encryptedWallet) return;

    setEncryptedWallet(_encryptedWallet);
    setPendingMessage(null);
  }, [props.walletSetup]);

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
    setIsDecrypting(true);
    setPendingMessage('Decrypting wallet...');
    setDecryptionProgress(0);

    try {
      const wallet = await decryptionService.current.decryptWallet(
        encryptedWallet.content,
        password,
        (progress: DecryptionProgress) => {
          setDecryptionProgress(progress.progress);
          setPendingMessage(progress.message || 'Decrypting wallet...');
        },
      );

      // Set the wallet in host service
      await setWallet(wallet);

      // Navigate to home
      router.push('/home');
    } catch (error) {
      if (error instanceof AppError) {
        if (error.isAuthenticationError) router.push('/');
      }
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'Failed to restore wallet. Please try again.',
      );
    } finally {
      setIsDecrypting(false);
      setPendingMessage(null);
    }
  };
  useEffect(() => {
    getEncryptedWallet();
  }, [getEncryptedWallet]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      decryptionService.current.cancel();
    };
  }, []);

  if (isDecrypting) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingScreen message={pendingMessage || 'Decrypting wallet...'} />
        <Box className="absolute bottom-24 left-5 right-5">
          <VStack space="md" className="items-center">
            <Progress
              value={Math.min(decryptionProgress, 100)}
              size="md"
              className="w-full"
            >
              <ProgressFilledTrack className="bg-green-500" />
            </Progress>
            <Text size="sm" className="text-typography-700 font-medium">
              {Math.round(decryptionProgress)}% Complete
            </Text>
          </VStack>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background-0 px-2 py-16">
      <VStack space="xl" className="flex-1 p-6">
        {/* Header Section */}
        <VStack space="md" className="items-center mt-8">
          <Box className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={32} color="#22C55E" />
          </Box>
          <Heading
            size="2xl"
            className="text-typography-900 text-center font-bold"
          >
            Restore Wallet
          </Heading>
          <Text
            size="md"
            className="text-typography-700 text-center leading-relaxed"
          >
            Enter your password to decrypt and restore your existing wallet
          </Text>
        </VStack>

        {/* Wallet Info Card */}
        {props.address && (
          <Box className="bg-white border border-gray-200 rounded-xl p-4">
            <VStack space="sm">
              <Text size="sm" className="text-green-600 font-medium">
                Wallet Address Found:
              </Text>
              <Text
                size="sm"
                className="text-typography-900 font-mono break-all"
              >
                {props.address}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Input Section */}
        <VStack space="lg" className="flex-1">
          <VStack space="md">
            <Box className="bg-white border border-gray-200 rounded-xl">
              <Input size="lg" variant="outline" className="border-0">
                <InputField
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                  }}
                  className="text-typography-900 p-4"
                />
              </Input>
            </Box>

            {passwordError ? (
              <HStack space="sm" className="items-center">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text size="sm" className="text-red-600 flex-1">
                  {passwordError}
                </Text>
              </HStack>
            ) : (
              <HStack space="sm" className="items-center">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#6B7280"
                />
                <Text size="sm" className="text-typography-500 flex-1">
                  Password must be at least 4 characters long
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Action Buttons */}
          <VStack space="md" className="mt-auto">
            <Button
              size="lg"
              action={
                !password || password.length < 4 ? 'secondary' : 'positive'
              }
              variant="solid"
              disabled={!password || isDecrypting || password.length < 4}
              onPress={handleRestoreWallet}
              className="rounded-xl bg-green-500 disabled:bg-gray-300"
            >
              {pendingMessage && !isDecrypting ? (
                <HStack space="sm" className="items-center">
                  <Ionicons name="hourglass-outline" size={20} color="white" />
                  <ButtonText className="font-semibold text-white">
                    {pendingMessage}
                  </ButtonText>
                </HStack>
              ) : (
                <HStack space="sm" className="items-center">
                  <Ionicons name="lock-open-outline" size={20} color="white" />
                  <ButtonText className="font-semibold text-white">
                    Decrypt Wallet
                  </ButtonText>
                </HStack>
              )}
            </Button>

            {attemptCount > 0 && (
              <VStack space="md">
                <Button
                  size="lg"
                  action="secondary"
                  variant="outline"
                  onPress={() =>
                    props.createNewWallet(
                      `${WALLET_INFO.BACKUP_FILE_NAME}|${props.address}`,
                    )
                  }
                  className="rounded-xl border-blue-500 bg-white"
                >
                  <HStack space="sm" className="items-center">
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#3B82F6"
                    />
                    <ButtonText className="font-semibold text-blue-500">
                      Create New Wallet
                    </ButtonText>
                  </HStack>
                </Button>

                <Box className="bg-white border border-gray-200 rounded-xl p-3">
                  <HStack space="sm" className="items-start">
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text
                      size="xs"
                      className="text-typography-500 flex-1 leading-relaxed"
                    >
                      The existing wallet will be renamed to{' '}
                      <Text className="font-semibold italic">
                        {WALLET_INFO.BACKUP_FILE_NAME}|{props.address}
                      </Text>
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </VStack>
        </VStack>
      </VStack>
    </View>
  );
}
