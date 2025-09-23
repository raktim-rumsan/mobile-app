import { useThemeColor } from '@/core/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

type HeaderProps = {
  title: string;
  Action?: React.ReactNode;
  onBackPress?: () => void;
  onActionPress?: () => void;
};

export const Header = ({
  title,
  Action,
  onActionPress,
  onBackPress,
}: HeaderProps) => {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor =
    useThemeColor({}, 'background') === '#fff' ? '#e5e7eb' : '#374151';
  return (
    <View
      className="flex-row items-center justify-between px-4 py-2 border-b bg-gray-50"
      style={{ borderBottomColor: borderColor }}
    >
      <View className="flex-row items-center">
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} className="mr-3 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        ) : null}
        <View className="flex-row items-center">
          <View>
            <ThemedText
              className="font-semibold text-lg"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </ThemedText>
          </View>
        </View>
      </View>
      {Action ? (
        <TouchableOpacity onPress={onActionPress}>{Action}</TouchableOpacity>
      ) : null}
    </View>
  );
};
