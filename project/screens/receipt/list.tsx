import { Header } from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import React from 'react';
import { PlusCircleIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReceiptList } from '../../queries/invoice.query';
import { Invoice } from '../../types/invoice.type';

const formatAmount = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusStyle = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'REIMBURSED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const capitalizeStatus = (status?: string): string => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ReceiptCard: React.FC<{ receipt: Invoice }> = ({ receipt }) => {
  const handlePress = () => {
    router.push(`/(tabs)/receipt/detail?id=${receipt.cuid}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <Card className="mb-4 mx-4 p-4 bg-white border border-gray-200">
        <HStack className="flex-1 items-center space-x-4">
          {/* Left side - Receipt details */}
          <VStack className="flex-1 space-y-3">
            {/* Amount - larger text */}
            <Text className="text-2xl font-bold text-gray-700">
              {formatAmount(receipt.amount)}
            </Text>

            {/* Category */}
            <Text className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              {receipt.Category?.name || 'Uncategorized'}
            </Text>

            {/* Description */}
            <Text
              className="text-base text-gray-700 leading-6"
              numberOfLines={2}
            >
              {receipt.description}
            </Text>

            {/* Date */}
            <Text className="text-sm text-gray-500">
              {formatDate(receipt.date)}
            </Text>
          </VStack>

          {/* Right side - Receipt image */}
          <VStack className="ml-4 items-end space-y-2">
            {/* Status pill */}
            <Box
              className={`px-2 py-1 mb-2 rounded-full border ${getStatusStyle(
                receipt.status,
              )}`}
            >
              <Text className="text-xs font-semibold">
                {capitalizeStatus(receipt.status)}
              </Text>
            </Box>

            {/* Image */}
            <Image
              source={{
                uri:
                  receipt.attachments?.[0]?.url ||
                  'https://via.placeholder.com/80x100/f3f4f6/6b7280?text=Receipt',
              }}
              className="w-20 h-24 rounded-lg border border-gray-200"
              alt={`Receipt for ${receipt.description}`}
              resizeMode="cover"
            />
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
};

export default function ReceiptListScreen() {
  const { data, isLoading } = useReceiptList({
    pagination: { page: 1, limit: 20 },
  });

  const receipts = data?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        {/* Header */}
        <Header
          title="Receipts"
          Action={<PlusCircleIcon size={30} />}
          onActionPress={() => router.push('/(tabs)/receipt/create')}
        />

        {/* Receipt list */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {isLoading ? (
            <Box className="flex-1 items-center justify-center px-4">
              <Text className="text-gray-500 text-center text-lg">
                Loading receipts...
              </Text>
            </Box>
          ) : receipts.length > 0 ? (
            receipts.map((receipt: Invoice) => (
              <ReceiptCard key={receipt.cuid} receipt={receipt} />
            ))
          ) : (
            <Box className="flex-1 items-center justify-center px-4">
              <Text className="text-gray-500 text-center text-lg">
                No receipts found
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                Your receipts will appear here
              </Text>
            </Box>
          )}
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}
