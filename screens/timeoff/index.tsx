import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { Box } from '@/components/ui/box';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

import { Text } from '@/components/ui';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { PlusCircleIcon } from 'react-native-heroicons/outline';
import TimeoffDetails from './details';

const leaveRequests = [
  {
    type: 'Sick Leave',
    status: 'Pending',
    dates: [
      { date: '21 July, 2024', type: 'FULL DAY' },
      { date: '22 July, 2024', type: '1ST HALF' },
    ],
    reason:
      'This is a leave reason part. Jorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  {
    type: 'Personal Leave',
    status: 'Approved',
    dates: [
      { date: '21 July, 2024', type: 'FULL DAY' },
      { date: '22 July, 2024', type: '1ST HALF' },
    ],
    reason:
      'This is a leave reason part. Jorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  {
    type: 'Sick Leave',
    status: 'Pending',
    dates: [
      { date: '21 July, 2024', type: 'FULL DAY' },
      { date: '22 July, 2024', type: '1ST HALF' },
    ],
    reason:
      'This is a leave reason part. Jorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
];

export default function TimeoffScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HStack style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask Bhunte</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/timeoff/request')}
        >
          <PlusCircleIcon size={24} color="#000" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </HStack>

      <ScrollView className="flex-1 px-4 py-2">
        <VStack className="space-y-4">
          {leaveRequests.map((request, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                router.push({
                  pathname: '/timeoff/details',
                  params: {
                    type: request.type,
                    status: request.status,
                    reason: request.reason,
                    dates: JSON.stringify(request.dates),
                  },
                })
              }
              activeOpacity={0.8}
            >
              <TimeoffDetails {...request} />
            </TouchableOpacity>
          ))}
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
