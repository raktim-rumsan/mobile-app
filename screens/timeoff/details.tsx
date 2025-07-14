import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTimeOffById, useTimeoffRequestDelete } from '@/queries/timeoff-req.query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, SafeAreaView } from 'react-native';

const TimeoffDetails = () => {
  const router = useRouter();
  const { mutateAsync: deleteTimeOff } = useTimeoffRequestDelete();

  const handleDelete = async (cuid: string) => {
  try {
    await deleteTimeOff(cuid);

    Alert.alert('Leave Canceled', 'Your leave request has been canceled.');

    setTimeout(() => {
      router.push('/TimeOff');
    }, 2000);
  } catch (error) {
    console.error('Error deleting time off request:', error);
    Alert.alert('Error', 'Something went wrong while canceling.');
  }
};

  const { cuid } = useLocalSearchParams() as { cuid: string };
  const { data, isLoading, error } = useTimeOffById(cuid);

  if (isLoading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        {isLoading ? <ActivityIndicator /> : <Text>Error loading details.</Text>}
      </SafeAreaView>
    );
  }

  const {
    type,
    status,
    description: reason,
    daysDetails,
  } = data;

  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';

  const statusColor = isApproved ? '#4CAF50' : '#FF5252';
  const statusBgColor = isApproved ? '#E8F5E9' : '#FFEBEE';

  const formattedDates = Object.entries(daysDetails || {}).map(([date, detail]) => ({
    date: format(new Date(date), 'dd MMMM, yyyy'),
    type: (detail as any).timeOffDuration
      ?.replace('_', ' ')
      .replace('FIRST HALF', '1ST HALF')
      .replace('SECOND HALF', '2ND HALF') || '',
  }));

  


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Box className="flex-1 bg-white px-4 py-2">
        <VStack className="space-y-4">
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <HStack className="justify-between items-center mb-4">
              <Text size="lg" className="font-bold text-gray-800">{type}</Text>
              <Box
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: statusBgColor }}
              >
                <Text style={{ color: statusColor }} className="font-semibold uppercase text-md">
                  {status}
                </Text>
              </Box>
            </HStack>

            <VStack space="sm">
              {formattedDates.map((d, idx) => (
                <HStack key={idx} space="sm" className="items-center">
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text className="text-gray-700">{d.date} {d.type}</Text>
                </HStack>
              ))}
            </VStack>

            <Text className="mt-3 text-gray-600">
              {reason || 'No reason provided'}
            </Text>
          </Box>

          {isPending && (
          
             <Box style={{ marginTop: 16, marginBottom: 8 }}>
    <Button
      variant="outline"
      className="border-red-500 rounded px-4 py-3"
      style={{ minHeight: 48, justifyContent: 'center' }} 
      onPress={() => handleDelete(cuid)} 
    >
      <Text className="text-red-500" style={{ fontSize: 16, textAlign: 'center' }}>
        Cancel Leave Request
      </Text>
    </Button>
  </Box>
          )}
        </VStack>
      </Box>
    </SafeAreaView>
  );
};

export default TimeoffDetails;
