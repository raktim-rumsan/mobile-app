import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CalendarDaysIcon } from '@/components/ui/icon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Select, SelectBackdrop, SelectContent, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { useNavigation } from 'expo-router';

export default function RequestLeaveStep2() {
  const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({ title: 'Request Leave' });
    }, [navigation]);
  
  const router = useRouter();
  const { selectedStartDate, selectedEndDate } = useLocalSearchParams();

  const startDateStr = Array.isArray(selectedStartDate) ? selectedStartDate[0] : selectedStartDate;
  const endDateStr = Array.isArray(selectedEndDate) ? selectedEndDate[0] : selectedEndDate;

  const getDateRange = (start: string, end: string) => {
    const arr: Date[] = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt <= endDt) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };

  const dateRange = (startDateStr && endDateStr)
    ? getDateRange(startDateStr, endDateStr)
    : [];

  return (
    <Box className="flex-1 bg-gray-50 px-4 py-4">
      <VStack className="flex-1">
        <Text className="font-bold text-lg mb-4">Request Leave</Text>
        {dateRange.length === 0 ? (
          <Text className="text-gray-500 mb-4">No dates selected.</Text>
        ) : (
          dateRange.map((date, idx) => (
            <HStack key={date.toISOString()} className="bg-white rounded-md p-3 mb-3 items-center">
              <Icon as={CalendarDaysIcon} size="md" className="mr-2" />
              <Text className="flex-1 font-medium">
                {date.toLocaleDateString('en-CA')}
              </Text>
              <Box className="flex-1">
                <Select
                  defaultValue='Full Day'
                >
                  <SelectTrigger variant="outline">
                    <SelectInput />
                    <SelectIcon />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectItem label="First Half" value="firstHalf" />
                      <SelectItem label="Second Half" value="secondHalf" />
                      <SelectItem label="Full Day" value="fullDay" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>
            </HStack>
          ))
        )}
        <HStack className="mt-4">
          <Button
            variant="outline"
            className="text-gray-200 py-3 flex-1 rounded-md"
            style={{ marginRight: 12 }}
            onPress={() => router.back()}
          >
            <Text className="text-[1rem]">Cancel</Text>
          </Button>
          <Button className="bg-blue-500 text-white font-bold py-3 flex-1 rounded-md">
            <Text className="text-[1rem]">Submit</Text>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

