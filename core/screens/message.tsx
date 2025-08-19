import { Button, Card, Center, Heading, Text, View } from '@/components/ui';
import { router } from 'expo-router';
import React from 'react';

interface MessageScreenProps {
  message: string;
  type?: 'success' | 'error';
  button?: {
    text: string;
    url: string;
  };
}

export default function MessageScreen({
  type = 'success',
  message = 'Operation completed successfully!',
  button = { text: 'Go to Home', url: '/(tabs)/home' },
}: MessageScreenProps) {
  const isSuccess = type === 'success';
  const icon = isSuccess ? '✓' : '✗';
  const iconBg = isSuccess ? 'bg-success-50' : 'bg-error-50';
  const iconText = isSuccess ? 'text-success-600' : 'text-error-600';
  const headingText = isSuccess ? 'Success!' : 'Error!';

  return (
    <Center className="flex-1 p-5">
      <Card className="w-full max-w-md items-center p-6">
        <View
          className={`${iconBg} w-20 h-20 rounded-full justify-center items-center mb-4`}
        >
          <Text className={`${iconText} text-5xl`}>{icon}</Text>
        </View>
        <Heading size="lg" className="mb-4 text-center">
          {headingText}
        </Heading>
        <Text className="text-base text-center mb-6">{message}</Text>
        <Button
          action="primary"
          className="w-full text-white mt-2"
          onPress={() => router.replace(button.url as any)}
        >
          {button.text}
        </Button>
      </Card>
    </Center>
  );
}
