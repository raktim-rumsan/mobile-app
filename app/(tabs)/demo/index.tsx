import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ChatBubbleLeftIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  SignalIcon,
} from 'react-native-heroicons/outline';

export default function HomeScreen() {
  const links = [
    {
      title: 'NFC Reader',
      icon: SignalIcon,
      onPress: () => router.push('/demo/nfc'),
    },
    {
      title: 'NFC Writer',
      icon: SignalIcon,
      onPress: () => router.push('/demo/nfc-write'),
    },
    {
      title: 'Device Info',
      icon: DevicePhoneMobileIcon,
      onPress: () => router.push('/demo/device-info'),
    },
    {
      title: 'Location Info',
      icon: MapPinIcon,
      onPress: () => router.push('/demo/location'),
    },
    {
      title: 'Chat',
      icon: ChatBubbleLeftIcon,
      onPress: () => router.push('/chat'),
    },
  ];
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 pt-14"
    >
      {/* Quick Actions */}
      <Box className="rounded-xl p-2 mt-4">
        <VStack className="space-y-2">
          {links.map((link, index) => (
            <Pressable key={index} onPress={link.onPress}>
              {(pressableProps: { pressed: boolean }) => (
                <HStack
                  className={`items-center border border-gray-200 p-3 ${
                    index > 0 ? 'mt-2' : ''
                  } rounded-lg ${
                    pressableProps.pressed ? 'bg-primary-50' : 'bg-background-0'
                  }`}
                >
                  <Box className="rounded-md mr-2">
                    <link.icon className="text-primary-500" size={20} />
                  </Box>
                  <Text className="flex-1 font-medium">{link.title}</Text>
                  <FontAwesome name="angle-right" size={18} color="#A0AEC0" />
                </HStack>
              )}
            </Pressable>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}
