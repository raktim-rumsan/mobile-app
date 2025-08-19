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
    <View className="flex-1 justify-start items-center">
      <View className="items-center mt-80">
        <Image
          source={
            theme === 'dark'
              ? require('@/assets/images/icon-white.png')
              : require('@/assets/images/icon-white.png')
          }
          className="h-48 w-48"
          style={{
            width: 600,
            height: 600,
            resizeMode: 'contain',
          }}
        />
      </View>
      <View className="items-center mt-auto mb-60">
        <ActivityIndicator size="large" color="#4285F4" />
        {message && <Text className="mt-4 text-center">{message}</Text>}
      </View>
    </View>
  );
};
