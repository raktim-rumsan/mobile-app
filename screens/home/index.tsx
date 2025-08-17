import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@/components/ui/modal';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ChatBubbleLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import QRCode from 'react-native-qrcode-svg';

export default function HomeScreen() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfoContent, setCurrentInfoContent] = useState({
    title: '',
    description: '',
  });

  // Function to open info modal with specific content
  const openInfoModal = (title: string, description: string) => {
    setCurrentInfoContent({ title, description });
    setShowInfoModal(true);
  };

  // Info content for each card
  const cardInfo = {
    timeOff: {
      title: 'Time Off',
      description:
        'This shows your available time off days for the current year. Includes vacation, sick leave, and personal days.',
    },
    rewards: {
      title: 'Rewards',
      description:
        'Points earned through achievements, completing tasks, and team contributions. These points can be redeemed for various rewards.',
    },
    bonus: {
      title: 'Bonus',
      description:
        'Your quarterly performance bonus based on individual and company objectives. Updated at the end of each quarter.',
    },
    goals: {
      title: 'Goals',
      description:
        'Progress on your monthly objectives. Shows completed goals out of total assigned goals for the current month.',
    },
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 pt-14"
    >
      {/* Header */}
      <HStack className="items-center justify-between">
        <Box className="mt-4 ml-4">
          <Text className="text-2xl font-bold">Hello, Siyah</Text>
        </Box>
        <Box className="bg-success-100 rounded-xl px-3 py-1">
          <Text className="text-success-900 font-bold text-sm">Active</Text>
        </Box>
      </HStack>

      <Box className="flex-1 items-center rounded-xl p-5 my-[30px]">
        <Box className="bg-white rounded-xl p-3">
          <QRCode value="https://rumsan.com/user/12345" size={120} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <VStack className="space-y-4">
        <HStack className="space-x-4">
          <Box className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Time Off</Text>
              <Box className="p-1.5">
                <ClockIcon size={24} className="text-green-500" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">12 days</Text>
            <Text className="text-typography-500 text-sm">This year</Text>
          </Box>
          <Box className="flex-1 bg-white border border-gray-200 rounded-xl ml-2 p-5">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Rewards</Text>
              <Box className="p-1.5">
                <ShieldCheckIcon size={24} className="text-red-500" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">2,450</Text>
            <Text className="text-typography-500 text-sm">Points</Text>
          </Box>
        </HStack>
        <HStack className="space-x-4 space-y-4">
          <Box className="flex-1 bg-white border border-gray-200 rounded-xl p-5 mt-2">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Bonus</Text>
              <Box className="p-1.5">
                <CurrencyDollarIcon size={24} className="text-blue-500" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">$1,200</Text>
            <Text className="text-typography-500 text-sm">This quarter</Text>
          </Box>
          <Box className="flex-1 bg-white border border-gray-200 rounded-xl p-5 ml-2 mt-2">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Goals</Text>
              <Box className="p-1.5">
                <PaperAirplaneIcon size={24} className="text-orange-500" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">8/10</Text>
            <Text className="text-typography-500 text-sm">This month</Text>
          </Box>
        </HStack>
      </VStack>

      {/* Quick Actions */}
      <Box className="rounded-xl p-2 mt-4">
        <Text className="font-bold text-base mb-3">Quick Actions</Text>
        <VStack className="space-y-2">
          <Pressable
            onPress={() => {
              router.push('/chat');
            }}
          >
            {(pressableProps: { pressed: boolean }) => (
              <HStack
                className={`items-center border border-gray-200 p-3 rounded-lg ${
                  pressableProps.pressed ? 'bg-primary-50' : 'bg-background-0'
                }`}
              >
                <Box className="rounded-md mr-2">
                  <ChatBubbleLeftIcon className="text-primary-500" size={20} />
                </Box>
                <Text className="flex-1 font-medium">Ask Bhunte</Text>
                <FontAwesome name="angle-right" size={18} color="#A0AEC0" />
              </HStack>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              router.push('/demo');
            }}
          >
            {(pressableProps: { pressed: boolean }) => (
              <HStack
                className={`items-center border border-gray-200 p-3 mt-2 rounded-lg ${
                  pressableProps.pressed ? 'bg-success-50' : 'bg-background-0'
                }`}
              >
                <Box className="rounded-md mr-2">
                  <GiftIcon className="text-success-500" size={20} />
                </Box>
                <Text className="flex-1 font-medium">Demo</Text>
                <FontAwesome name="angle-right" size={18} color="#A0AEC0" />
              </HStack>
            )}
          </Pressable>
        </VStack>
      </Box>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        size="sm"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text className="font-bold">{currentInfoContent.title} Info</Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Text className="text-typography-600">
              {currentInfoContent.description}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </ScrollView>
  );
}
