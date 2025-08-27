import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { Image, Text } from './ui';

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen = ({
  message = 'Loading...',
}: LoadingScreenProps) => {
  const theme = useColorScheme();
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="items-center flex-1 justify-center">
        <Image
          source={
            theme === 'dark'
              ? require('@/assets/images/icon-white.png')
              : require('@/assets/images/icon-white.png')
          }
          className="h-32 w-32 mb-8"
          style={{
            width: 128,
            height: 128,
            resizeMode: 'contain',
          }}
        />
        <ActivityIndicator size="large" color="#4285F4" />
        {message && (
          <Text className="mt-4 text-center text-gray-600">{message}</Text>
        )}
      </View>
    </View>
  );
};
