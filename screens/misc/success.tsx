import { Button, Card, Center, Heading, Text, View } from '@/components/ui';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function SuccessScreen() {
  const { message = 'Operation completed successfully!' } =
    useLocalSearchParams<{ message: string }>();

  return (
    <Center className="flex-1 p-5">
      <Card className="w-full max-w-md items-center p-6">
        <View className="bg-success-50 w-20 h-20 rounded-full justify-center items-center mb-4">
          <Text className="text-success-600 text-5xl">✓</Text>
        </View>
        <Heading size="lg" className="mb-4 text-center">
          Success!
        </Heading>
        <Text className="text-base text-center mb-6">{message}</Text>
        <Button
          action="primary"
          className="w-full text-white mt-2"
          onPress={() => router.replace('/(tabs)/home')}
        >
          Go to Home
        </Button>
      </Card>
    </Center>
  );
}
