import { Text } from '@/components/ui';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useTimeOffByUserId } from '@/queries/timeoff-req.query';
import { getUserIdFromAccessToken } from '@/utils/storage.utils';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { PlusCircleIcon } from 'react-native-heroicons/outline';

export default function TimeoffScreen() {
  const router = useRouter();
  const navigation = useNavigation();

const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  getUserIdFromAccessToken().then(setUserId);
}, []);

const { data, isLoading, error } = useTimeOffByUserId(userId ?? '', {
  page: 1,
  limit: 10,
  sort: 'startDate',
  order: 'desc',
});

  const renderRequestItem = (request: any, index: number) => {
    const dates = request.daysDetails
      ? Object.entries(request.daysDetails).map(([date, detail]) => ({
          date: format(new Date(date), 'dd MMMM, yyyy'),
          type: (detail as any).timeOffDuration
            ?.replace('_', ' ')
            .replace('FIRST HALF', '1ST HALF')
            .replace('SECOND HALF', '2ND HALF') || '',
        }))
      : [];

       const isApproved = request.status?.toUpperCase() === 'APPROVED';
  const statusColor = isApproved ? '#4CAF50' : '#FF5252';
  const statusBgColor = isApproved ? '#E8F5E9' : '#FFEBEE';
    return (
  <TouchableOpacity
    key={request.cuid || index}
    onPress={() => router.push({ pathname: '/timeoff/[cuid]', params: { cuid: request.cuid } })}
    activeOpacity={0.8}
  >
    <Box className="bg-white rounded-xl border border-gray-200 p-5 mb-3">
      <HStack className="justify-between items-center mb-2">
        <Text size="lg" className="font-bold text-gray-800">
          {request.type}
        </Text>
        <Box
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusBgColor }}
        >
          <Text
            style={{ color: statusColor }}
            className="font-semibold uppercase text-md"
          >
            {request.status}
          </Text>
        </Box>
      </HStack>
      {dates.map((d, i) => (
        <HStack key={i} className="items-center mb-1">
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text className="text-gray-700 ml-1">
            {d.date} {d.type}
          </Text>
        </HStack>
      ))}
      <Text className="text-gray-600" numberOfLines={1}>
        {request.description}
      </Text>
    </Box>
  </TouchableOpacity>
);
  };

  return (
    <Box style={styles.container}>
      <StatusBar />
      <HStack style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request TimeOff</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/timeoff/request')}
        >
          <HStack className="items-center">
            <PlusCircleIcon size={24} color="#000" style={{ marginLeft: 8 }} />
            <Text style={{ marginLeft: 6, fontSize: 16, color: '#000', fontWeight: '600' }}>
              New Request
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>

      <ScrollView className="flex-1 px-4 py-2">
        <VStack className="space-y-4">
          {isLoading && <ActivityIndicator />}
          {error && <Text>Error loading leave requests</Text>}
          {!isLoading && !error && data?.length === 0 && (
            <Text>No leave requests found.</Text>
          )}
          {data?.map(renderRequestItem)}
        </VStack>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  historyButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    backgroundColor: '#f8f9fa',
  },
  aiMessageContainer: {
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  messageActions: {
    justifyContent: 'space-between',
    marginTop: 12,
    width: '100%',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: 4,
    color: '#888',
    fontSize: 14,
  },
  reactionButtons: {
    flexDirection: 'row',
  },
  reactionButton: {
    marginLeft: 16,
    padding: 2,
  },
  inputContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 48,
  },
  searchIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  attachButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c4dff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
