import { Header } from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  FolderIcon,
  PencilIcon,
  TagIcon,
} from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetInvoice } from '../../queries/invoice.query';

const formatAmount = (amount: number, currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NPR: 'रू',
  };
  const symbol = currencySymbols[currency.toUpperCase()] || '$';
  return `${symbol}${amount.toFixed(2)}`;
};

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isLarge?: boolean;
}> = ({ icon, label, value, isLarge = false }) => (
  <HStack className="items-start space-x-4 py-3">
    <Box className="mt-1 mr-2">{icon}</Box>
    <VStack className="flex-1 space-y-1">
      <Text className="text-sm font-medium text-gray-600">{label}</Text>
      <Text
        className={`${
          isLarge ? 'text-2xl font-bold' : 'text-base'
        } text-gray-900`}
      >
        {value}
      </Text>
    </VStack>
  </HStack>
);

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: receipt, isLoading, error } = useGetInvoice(id as string);

  const handleEdit = () => {
    // Navigate to edit screen
    router.push(`/(tabs)/receipt/edit?id=${receipt?.cuid}`);
  };

  const handleImagePress = () => {
    // Navigate to full-screen image view
    const imageUrl =
      receipt?.attachments?.[0]?.url ||
      'https://via.placeholder.com/400x600/f3f4f6/6b7280?text=Receipt+Image';
    router.push(
      `/(tabs)/receipt/preview?imageUrl=${encodeURIComponent(imageUrl)}`,
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <VStack className="flex-1">
          <Header
            title="Receipt Details"
            onBackPress={() => router.push('/receipt/list')}
          />
          <Box className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-center text-lg">
              Loading receipt...
            </Text>
          </Box>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error || !receipt) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <VStack className="flex-1">
          <Header
            title="Receipt Details"
            onBackPress={() => router.push('/receipt/list')}
          />
          <Box className="flex-1 items-center justify-center">
            <Text className="text-red-500 text-center text-lg">
              Error loading receipt
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Please try again later
            </Text>
          </Box>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        {/* Header */}
        <Header
          title="Receipt Details"
          Action={<PencilIcon size={24} />}
          onActionPress={handleEdit}
          onBackPress={() => router.push('/receipt/list')}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Receipt Image */}
          <Box className="mx-4 mb-6">
            <Pressable onPress={handleImagePress}>
              <Card className="p-4 bg-white border border-gray-200">
                <VStack className="items-center space-y-3">
                  <Image
                    source={{
                      uri:
                        receipt.attachments?.[0]?.url ||
                        'https://via.placeholder.com/400x600/f3f4f6/6b7280?text=Receipt+Image',
                    }}
                    className="w-full h-64 rounded-lg border border-gray-200"
                    alt="Receipt image"
                    resizeMode="contain"
                  />
                  <Text className="text-sm text-gray-500 text-center">
                    Tap to view full size
                  </Text>
                </VStack>
              </Card>
            </Pressable>
          </Box>

          {/* Status Badge */}
          <Box className="mx-4 mb-6">
            <HStack className="justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">
                Status
              </Text>
              <Box
                className={`px-3 py-2 rounded-full border ${getStatusStyle(
                  receipt.status,
                )}`}
              >
                <Text className="text-sm font-semibold">
                  {capitalizeStatus(receipt.status)}
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Receipt Details */}
          <Box className="mx-4">
            <Card className="p-4 bg-white border border-gray-200">
              <VStack className="space-y-2">
                {/* Amount - Featured */}
                <DetailRow
                  icon={<CurrencyDollarIcon size={24} color="#059669" />}
                  label="Amount"
                  value={formatAmount(receipt.amount, receipt.currency)}
                  isLarge={true}
                />

                <Box className="border-b border-gray-100" />

                {/* Date */}
                <DetailRow
                  icon={<CalendarIcon size={20} color="#6b7280" />}
                  label="Date"
                  value={formatDate(receipt.date)}
                />

                <Box className="border-b border-gray-100" />

                {/* Category */}
                <DetailRow
                  icon={<TagIcon size={20} color="#6b7280" />}
                  label="Category"
                  value={receipt.Category?.name || 'Uncategorized'}
                />

                <Box className="border-b border-gray-100" />

                {/* Project */}
                {receipt.Project?.name && (
                  <>
                    <DetailRow
                      icon={<FolderIcon size={20} color="#6b7280" />}
                      label="Project"
                      value={receipt.Project.name}
                    />
                    <Box className="border-b border-gray-100" />
                  </>
                )}

                {/* Invoice Type */}
                {receipt.invoiceType && (
                  <>
                    <DetailRow
                      icon={<DocumentTextIcon size={20} color="#6b7280" />}
                      label="Invoice Type"
                      value={receipt.invoiceType}
                    />
                    <Box className="border-b border-gray-100" />
                  </>
                )}

                {/* Description */}
                <VStack className="py-3 space-y-2">
                  <HStack className="items-start space-x-4">
                    <Box className="mt-1 mr-2">
                      <DocumentTextIcon size={20} color="#6b7280" />
                    </Box>
                    <VStack className="flex-1 space-y-2">
                      <Text className="text-sm font-medium text-gray-600">
                        Description
                      </Text>
                      <Text className="text-base text-gray-900 leading-6">
                        {receipt.description}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </Card>
          </Box>

          {/* Action Buttons */}
          <Box className="mx-4 mt-8 mb-6">
            <VStack className="space-y-3">
              <Button
                variant="solid"
                className="bg-red-600"
                onPress={handleEdit}
              >
                <Text className="text-white font-semibold">Delete Receipt</Text>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}
