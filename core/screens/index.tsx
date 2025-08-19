import {
  Box,
  Button,
  Card,
  Center,
  HStack,
  Image,
  ScrollView,
  Text,
  VStack,
} from '@/components/ui';
import { useApp } from '@/core/context/AppContext';
import { getWalletBackupProvider } from '@/plugins/pluginFactory';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions } from 'react-native';
import { hostService } from './hostService';

export default function LandingScreen() {
  const useWalletSetup = getWalletBackupProvider(hostService);
  const walletSetup = useWalletSetup();
  const { wallet } = useApp();
  const screenWidth = Dimensions.get('window').width;
  const logoSize = Math.min(screenWidth * 0.5, 200); // Responsive logo size
  console.log('test');

  // Redirect to home if already authenticated
  // React.useEffect(() => {
  //   if (isAuthenticated) {
  //     router.replace('/wallet');
  //   }
  // }, [isAuthenticated]);

  return (
    <LinearGradient colors={['#333333', '#eaf0ff']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack className="relative flex-1 min-h-screen justify-center items-center p-8">
          <Center className="w-full mb-12">
            <Card className="w-full px-10 py-20 items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xs">
              {/* App logo */}
              <Image
                source={{
                  uri: 'https://api.v1.jobejee.com/v2/resource/employer-logo/a6f393161624355541779.png',
                }}
                alt="Rumsan Logo"
                resizeMode="contain"
                className="w-40 h-40 mb-2"
              />

              <Text
                size="3xl"
                className="text-center font-bold text-primary-700 mb-2"
              >
                Rumsan
              </Text>

              <Text className="text-center text-gray-600 mt-20">
                Digital Office Assistant
              </Text>

              {/* Google login button */}
              <Button
                onPress={walletSetup.signIn}
                isDisabled={walletSetup.isLoading}
                variant="solid"
                size="xl"
                className="w-full max-w-xs bg-primary-600 hover:bg-primary-700 text-white shadow-md rounded-xl mt-8"
              >
                <HStack className="items-center justify-center">
                  <Image
                    source={require('@/assets/images/google-icon.png')}
                    className="h-5 w-5 mr-2"
                    resizeMode="contain"
                    alt="Google Icon"
                  />
                  <Text className="font-semibold text-white ml-2 text-sm">
                    {walletSetup.isLoading
                      ? 'Signing in...'
                      : 'Sign in with Google'}
                  </Text>
                </HStack>
              </Button>

              {/* Error message */}
              {walletSetup.error && (
                <Box className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                  <Text className="text-red-500 text-center">
                    {walletSetup.error.message}
                  </Text>
                </Box>
              )}
            </Card>
          </Center>
          <Text className="absolute bottom-20 text-gray-400 text-xs italic">
            © {new Date().getFullYear()} Rumsan. All rights reserved.
          </Text>
        </VStack>
      </ScrollView>
    </LinearGradient>
  );
}
