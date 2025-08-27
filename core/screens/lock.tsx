import { Text } from '@/components/ui';
import { useAlertPopup } from '@/core/context/AlertPopupProvider';
import { useApp } from '@/core/context/AppContext';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { useAppServicePlugin } from '@/plugins/pluginFactory';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHostService } from '../services/hostService';

export default function LockScreen() {
  const { wallet, setWallet, isLocked, setIsLocked } = useApp();
  const { showError, showInfo, showWarning } = useAlertPopup();
  const hostService = useHostService();
  const appService = useAppServicePlugin(hostService);

  const backgroundColor = useThemeColor({}, 'background');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onUnlock = async () => {};

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // useEffect(() => {
  //   if (isMounted && wallet === undefined) {
  //     router.replace('/wallet');
  //   }
  // }, [isMounted, wallet]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View
        className="flex-1 p-6 w-full self-center"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        {/* Centered logo */}
        <View
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
            alt="Rumsan Logo"
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.7 },
            { marginBottom: 40 },
          ]}
          onPress={async () => {
            if (!wallet) {
              const wallet = await hostService.getWallet('TODO_temp');
              setWallet(wallet);
            }
            try {
              const success = await appService.onUnlock();
              if (success) {
                setIsLocked(false);
              }
            } catch (error: any) {
              showError('Failed to unlock wallet', error.message);
            }
          }}
          disabled={isLoading}
        >
          <Ionicons size={20} name="wallet" />
          <Text className="ml-4 text-black font-medium">Unlock Wallet</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
