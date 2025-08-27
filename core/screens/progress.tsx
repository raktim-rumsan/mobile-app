import {
  Badge,
  Box,
  Button,
  ButtonText,
  Card,
  Heading,
  HStack,
  Text,
  View,
  VStack,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

export default function SetupProgress(props: {
  walletFileId: string | null;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  progressLog: { title: string; isError?: boolean }[];
}) {
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Update animated values array when progressLog changes
    const newAnimatedValues = props.progressLog.map((_, index) => {
      if (animatedValues[index]) {
        return animatedValues[index];
      }
      return new Animated.Value(0);
    });
    setAnimatedValues(newAnimatedValues);

    // Animate each step appearance
    newAnimatedValues.forEach((animatedValue, index) => {
      if (animatedValue && index < props.progressLog.length) {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600,
          delay: index * 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });
  }, [props.progressLog]);

  const getStatusIcon = (
    step: { title: string; isError?: boolean },
    index: number,
  ) => {
    if (step.isError) {
      return (
        <Badge
          size="lg"
          variant="solid"
          action="error"
          className="rounded-full w-8 h-8 items-center justify-center"
        >
          <Text className="text-white font-bold text-sm">✕</Text>
        </Badge>
      );
    }

    return (
      <Badge
        size="lg"
        variant="solid"
        action="success"
        className="rounded-full w-8 h-8 items-center justify-center"
      >
        <Text className="text-white font-bold text-sm">✓</Text>
      </Badge>
    );
  };

  const getStepIndicator = (index: number, isError?: boolean) => {
    return (
      <Box className="relative">
        <Box
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isError
              ? 'bg-error-50 border-error-400'
              : 'bg-success-50 border-success-400'
          }`}
        >
          <Box
            className={`w-3 h-3 rounded-full ${
              isError ? 'bg-error-400' : 'bg-success-400'
            }`}
          />
        </Box>
        {index < props.progressLog.length - 1 && (
          <Box
            className={`absolute top-6 left-3 w-0.5 h-6 ${
              props.progressLog[index + 1]?.isError
                ? 'bg-error-200'
                : 'bg-success-200'
            }`}
          />
        )}
      </Box>
    );
  };

  return (
    <View className="flex-1 bg-background-0 px-2 py-16">
      <VStack space="lg" className="flex-1">
        {/* Header Section */}
        <VStack space="sm" className="items-center mb-4">
          <Heading size="xl" className="text-typography-900 text-center">
            Setup Progress
          </Heading>
          <Text className="text-typography-600 text-center text-base">
            Setting up your wallet securely
          </Text>
        </VStack>

        {/* Progress Steps */}
        <Card className="flex-1 p-4" variant="elevated">
          <VStack space="lg">
            {props.progressLog.map((step, index) => {
              const animatedValue = animatedValues[index];

              if (!animatedValue) {
                return (
                  <HStack key={index} space="md" className="items-center">
                    {/* Step Indicator */}
                    {getStepIndicator(index, step.isError)}

                    {/* Content */}
                    <VStack className="flex-1">
                      <HStack className="items-center justify-between">
                        <Text
                          className={`text-base font-medium ${
                            step.isError ? 'text-error-700' : 'text-success-700'
                          }`}
                        >
                          {step.title}
                        </Text>
                        {getStatusIcon(step, index)}
                      </HStack>
                    </VStack>
                  </HStack>
                );
              }

              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: animatedValue,
                    transform: [
                      {
                        translateY: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <HStack space="md" className="items-center">
                    {/* Step Indicator */}
                    {getStepIndicator(index, step.isError)}

                    {/* Content */}
                    <VStack className="flex-1">
                      <HStack className="items-center justify-between">
                        <Text
                          className={`text-base font-medium ${
                            step.isError ? 'text-error-700' : 'text-success-700'
                          }`}
                        >
                          {step.title}
                        </Text>
                        {getStatusIcon(step, index)}
                      </HStack>
                    </VStack>
                  </HStack>
                </Animated.View>
              );
            })}
          </VStack>
        </Card>

        {/* Footer Status */}
        <Card className="p-3" variant="elevated">
          <HStack space="sm" className="items-center justify-center">
            <Box
              className={`w-2 h-2 rounded-full ${
                props.progressLog.some((step) => step.isError)
                  ? 'bg-error-400'
                  : 'bg-success-400'
              }`}
            />
            <Text
              className={`text-sm font-medium ${
                props.progressLog.some((step) => step.isError)
                  ? 'text-error-700'
                  : 'text-success-700'
              }`}
            >
              {props.progressLog.some((step) => step.isError)
                ? 'Setup encountered issues'
                : 'Setup in progress...'}
            </Text>
          </HStack>
        </Card>

        {/* Action Buttons */}
        {props.walletFileId !== 'loading' && (
          <VStack space="md" className="mt-2">
            {props.walletFileId ? (
              <Button
                size="lg"
                variant="solid"
                action="primary"
                className="w-full bg-blue-500 disabled:bg-gray-300"
                onPress={() => {
                  props.setStep('wallet-restore');
                }}
              >
                <Ionicons name="wallet-outline" size={20} color="white" />
                <ButtonText>Restore Wallet from Backup</ButtonText>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="solid"
                action="primary"
                className="w-full bg-green-500 disabled:bg-gray-300"
                onPress={() => {
                  props.setStep('wallet-create');
                }}
              >
                <Ionicons name="wallet-outline" size={20} color="white" />
                <ButtonText>Create new Wallet</ButtonText>
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </View>
  );
}
