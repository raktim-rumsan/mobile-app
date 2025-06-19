import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface LeaveRequestDetailProps {
  type: string;
  status: string;
  dates: { date: string; type: string }[];
  reason: string;
  isDetail?: boolean; 
}

const LeaveRequestCard = (props: Partial<LeaveRequestDetailProps>) => {
  const params = useLocalSearchParams();
  const dates = typeof params.dates === 'string' ? JSON.parse(params.dates) : props.dates || [];
  const type = params.type || props.type || '';
  const status = params.status || props.status || '';
  const reason = params.reason || props.reason || '';
const isFromParams = !!params?.type || !!params?.status || !!params?.reason || !!params?.dates;
const isDetail = isFromParams ? true : props.isDetail ?? false;

  const statusColor = status === 'Approved' ? '#4CAF50' : '#FF5252';
  const statusBgColor = status === 'Approved' ? '#E8F5E9' : '#FFEBEE';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Box className="flex-1 bg-white">
        <Box className="px-4 bg-white">
          <HStack className="space-x-4 items-center">
            {/* Optional Heading or Back Button */}
          </HStack>
        </Box>

        <Box className="flex-1 px-4 py-2">
          <VStack className="flex-1 space-y-4">
            <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <HStack className="justify-between items-center mb-4">
                <Text size="lg" className="font-bold text-gray-800">
                  {type || "Leave Type"}
                </Text>
                <Box
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: statusBgColor }}
                >
                  <Text style={{ color: statusColor }} className="text-bold">
                    {status || "Pending"}
                  </Text>
                </Box>
              </HStack>

              <VStack space="sm">
                {Array.isArray(dates) &&
                  dates.map((d, idx) => (
                    <HStack key={idx} space="sm" className="items-center">
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                      <Text className="text-gray-700">
                        {d.date} {d.type}
                      </Text>
                    </HStack>
                  ))}
              </VStack>

              <Text className="mt-3 text-gray-600">{reason || "No reason provided"}</Text>
            </Box>
          </VStack>

          {isDetail && status === 'Pending' && (
            <VStack className="space-y-2 w-full mb-4">
              <Button
                variant="outline"
                className="mt-4 border-red-500 rounded px-4 py-3"
                onPress={() => console.log('Cancel request')}
              >
                <Text className="text-red-500 text-[1rem]">Cancel Leave Request</Text>
              </Button>
            </VStack>
          )}
        </Box>
      </Box>
    </SafeAreaView>
  );
};
export default LeaveRequestCard;