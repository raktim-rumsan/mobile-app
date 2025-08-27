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
import { iWalletPlugin } from '@/core/types/iWalletPlugin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHostService } from '../services/hostService';
import { AppError } from '../utils/error';

export interface CreationProgress {
  progress: number;
  stage: 'preparing' | 'creating' | 'backing_up' | 'completed' | 'error';
  message?: string;
}

class WalletCreationService {
  private static instance: WalletCreationService;
  private isActive = false;
  private shouldCancel = false;
  private progressInterval: number | null = null;

  static getInstance(): WalletCreationService {
    if (!WalletCreationService.instance) {
      WalletCreationService.instance = new WalletCreationService();
    }
    return WalletCreationService.instance;
  }

  async createWallet(
    walletSetup: iWalletPlugin,
    password: string,
    onProgress: (progress: CreationProgress) => void,
  ): Promise<any> {
    this.cancel();
    this.isActive = true;
    this.shouldCancel = false;

    return new Promise((resolve, reject) => {
      this.performWalletCreation(
        walletSetup,
        password,
        onProgress,
        resolve,
        reject,
      );
    });
  }

  private performWalletCreation(
    walletSetup: iWalletPlugin,
    password: string,
    onProgress: (progress: CreationProgress) => void,
    resolve: (wallet: any) => void,
    reject: (error: any) => void,
  ): void {
    let currentProgress = 0;

    const messages = [
      'Initializing wallet creation...',
      'Generating cryptographic keys...',
      'Creating wallet structure...',
      'Encrypting wallet data...',
      'Preparing backup...',
      'Uploading to backup service...',
      'Finalizing wallet setup...',
    ];

    // Start immediate progress animation
    onProgress({
      progress: 0,
      stage: 'preparing',
      message: messages[0],
    });

    // Create smooth, continuous progress updates
    this.progressInterval = window.setInterval(() => {
      if (this.shouldCancel) {
        this.cleanup();
        reject(new Error('Cancelled'));
        return;
      }

      currentProgress += Math.random() * 2 + 1; // 1-3% increment

      if (currentProgress <= 90) {
        const messageIndex = Math.min(
          Math.floor((currentProgress / 90) * messages.length),
          messages.length - 1,
        );

        onProgress({
          progress: Math.round(currentProgress),
          stage:
            currentProgress < 30
              ? 'preparing'
              : currentProgress < 70
              ? 'creating'
              : 'backing_up',
          message: messages[messageIndex],
        });
      }
    }, 100);

    // Perform actual wallet creation after a small delay to show progress
    setTimeout(async () => {
      try {
        if (this.shouldCancel) {
          this.cleanup();
          reject(new Error('Cancelled'));
          return;
        }

        // Final progress update before actual creation
        onProgress({
          progress: 95,
          stage: 'backing_up',
          message: 'Creating and backing up wallet...',
        });

        const wallet = await walletSetup.createAndBackupWallet(password, {
          log: (message: string) => {
            onProgress({
              progress: 98,
              stage: 'backing_up',
              message,
            });
          },
        });

        if (!wallet) {
          throw new Error('Failed to create wallet');
        }

        // Completion
        onProgress({
          progress: 100,
          stage: 'completed',
          message: 'Wallet created successfully!',
        });

        this.cleanup();
        resolve(wallet);
      } catch (error) {
        onProgress({
          progress: 0,
          stage: 'error',
          message:
            error instanceof Error ? error.message : 'Failed to create wallet',
        });
        this.cleanup();
        reject(error);
      }
    }, 1000);
  }

  cancel(): void {
    this.shouldCancel = true;
    this.cleanup();
  }

  private cleanup(): void {
    this.isActive = false;
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export default function WalletCreateNew(props: { walletSetup: iWalletPlugin }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const creationService = useRef(WalletCreationService.getInstance());
  const { setWallet } = useHostService();

  const handleCreateWallet = useCallback(async () => {
    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    setPasswordError('');
    setIsCreating(true);
    setPendingMessage('Creating wallet...');
    setCreationProgress(0);

    try {
      const wallet = await creationService.current.createWallet(
        props.walletSetup,
        password,
        (progress: CreationProgress) => {
          setCreationProgress(progress.progress);
          setPendingMessage(progress.message || 'Creating wallet...');
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
          : 'Failed to create wallet. Please try again.',
      );
    } finally {
      setIsCreating(false);
      setPendingMessage(null);
    }
  }, [password, props.walletSetup]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      creationService.current.cancel();
    };
  }, []);

  if (isCreating) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingScreen message={pendingMessage || 'Creating wallet...'} />
        <Box className="absolute bottom-24 left-5 right-5">
          <VStack space="md" className="items-center">
            <Progress
              value={Math.min(creationProgress, 100)}
              size="md"
              className="w-full"
            >
              <ProgressFilledTrack className="bg-green-500" />
            </Progress>
            <Text size="sm" className="text-typography-700 font-medium">
              {Math.round(creationProgress)}% Complete
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
            <Ionicons name="add-circle-outline" size={32} color="#22C55E" />
          </Box>
          <Heading
            size="2xl"
            className="text-typography-900 text-center font-bold"
          >
            Create New Wallet
          </Heading>
          <Text
            size="md"
            className="text-typography-700 text-center leading-relaxed"
          >
            No wallet backups found. Let's create a new wallet and back it up to
            Google Drive.
          </Text>
        </VStack>

        {/* Input Section */}
        <VStack space="lg" className="flex-1">
          <VStack space="md">
            <Box className="bg-white border border-gray-200 rounded-xl">
              <Input size="lg" variant="outline" className="border-0">
                <InputField
                  placeholder="Create a strong password"
                  secureTextEntry
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
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
                  This password will be used to encrypt your wallet. Make sure
                  it's strong and you remember it.
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Action Button */}
          <VStack space="md" className="mt-auto">
            <Button
              size="lg"
              action={
                !password || password.length < 4 ? 'secondary' : 'positive'
              }
              variant="solid"
              disabled={!password || isCreating || password.length < 4}
              onPress={handleCreateWallet}
              className="rounded-xl bg-green-500 disabled:bg-gray-300"
            >
              {pendingMessage && !isCreating ? (
                <HStack space="sm" className="items-center">
                  <Ionicons name="hourglass-outline" size={20} color="white" />
                  <ButtonText className="font-semibold text-white">
                    {pendingMessage}
                  </ButtonText>
                </HStack>
              ) : (
                <HStack space="sm" className="items-center">
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <ButtonText className="font-semibold text-white">
                    Create Wallet
                  </ButtonText>
                </HStack>
              )}
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </View>
  );
}
