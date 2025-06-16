import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAlertPopup } from '@/context/AlertPopupProvider';
import { useWallet } from '@/context/WalletContext';
import { getServerInfo, updateServerInfo } from '@/utils/storage.utils';
import { Ionicons } from '@expo/vector-icons';
import { RumsanClient } from '@rumsan/sdk/clients';
import { Wallet } from 'ethers';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

export default function LoginScreen() {
  const { wallet, setAccessToken, setClientId } = useWallet();
  const { showError, showInfo, showWarning } = useAlertPopup();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && wallet === undefined) {
      router.replace('/wallet');
    }
  }, [isMounted, wallet]);

  const getAccessToken = React.useCallback(async (wallet: Wallet) => {
    setIsLoading(true);
    const serverInfo = await getServerInfo();
    const rumsanClient = new RumsanClient({
      baseURL: serverInfo?.url || process.env.EXPO_PUBLIC_SERVER_URL,
    });
    try {
      const { data: ChallengeData } = await rumsanClient.Auth.getChallenge({
        clientId: serverInfo?.clientId || undefined,
      });
      const { challenge, clientId } = ChallengeData;
      const signature = await wallet.signMessage(challenge);
      const { data } = await rumsanClient.Auth.walletLogin({
        challenge,
        signature: signature as `0x${string}`,
      });
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setClientId(clientId);
        await updateServerInfo({
          accessToken: data.accessToken,
          clientId: clientId,
        });
        router.replace('/');
      } else {
        showError('Failed to retrieve access token. Please try again.');
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      showError(
        'An error occurred while logging in. Please try again.',
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : String(err),
      );
      console.error('Login error:', err);
    }
  }, []);

  // const handleLogin = React.useCallback(async () => {
  //   // Only navigate if wallet is explicitly null or empty, not while undefined (still loading)
  //   if (isMounted && wallet === undefined) {
  //     router.push('/wallet');
  //     return;
  //   } else if (isMounted && wallet) {
  //     await getAccessToken(wallet);
  //   }
  // }, [getAccessToken, isMounted, wallet]);

  return (
    <>
      {wallet ? (
        <ThemedView
          className="flex-1 p-6 w-full self-center"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Centered logo */}
          <ThemedView
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Image
              source={{
                uri: 'https://api.v1.jobejee.com/v2/resource/employer-logo/a6f393161624355541779.png',
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </ThemedView>
          {/* Login button at bottom */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
              { marginBottom: 40 },
            ]}
            onPress={() => {
              getAccessToken(wallet!);
            }}
            disabled={isLoading}
          >
            <Ionicons size={20} name="wallet" />
            <ThemedText className="ml-4 text-black font-medium">
              Unlock Wallet
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView className="flex-1 justify-center items-center p-6">
          <ThemedView className="w-full max-w-sm items-center">
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push('/wallet')}
              disabled={isLoading}
            >
              <ThemedText className="text-black font-medium">
                Connect Wallet
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
