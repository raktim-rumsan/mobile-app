import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { CalendarDaysIcon, Icon } from '@/components/ui/icon';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLeaveRequest } from '@/context/TimeoffRequestContext';
import { useTimeOffRequestAdd } from '@/queries/timeoff-req.query';
import { TimeOffDuration } from '@/rumsan/types/raman/enums';
import { CreateTimeOffRequest } from '@/rumsan/types/raman/timeOffRequest.type';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export default function TimeoffRequestItemized() {
  const navigation = useNavigation();
  const router = useRouter();
  const { leaveData, setLeaveData } = useLeaveRequest();

  useEffect(() => {
    navigation.setOptions({ title: 'Request Leave' });
  }, [navigation]);

  const typedLeaveData = leaveData as CreateTimeOffRequest;

  const startDateStr = typeof typedLeaveData.startDate === 'string'
    ? typedLeaveData.startDate
    : typedLeaveData.startDate?.toISOString().slice(0, 10) || '';
  const endDateStr = typeof typedLeaveData.endDate === 'string'
    ? typedLeaveData.endDate
    : typedLeaveData.endDate?.toISOString().slice(0, 10) || '';

  const getDateRange = (start: string, end: string) => {
    const arr: dayjs.Dayjs[] = [];
    let dt = dayjs.utc(start);
    const endDt = dayjs.utc(end);
    while (dt.isSameOrBefore(endDt, 'day')) {
      arr.push(dt);
      dt = dt.add(1, 'day');
    }
    return arr;
  };

  const dateRange = startDateStr && endDateStr ? getDateRange(startDateStr, endDateStr) : [];

  // Pre-fill daysDetails as an object with FULL_DAY for each date in range if empty
  useEffect(() => {
    if (dateRange.length > 0) {
      const filledDays: Record<string, { timeOffDuration: TimeOffDuration }> = {};
      dateRange.forEach((dt) => {
        const key = dt.format('YYYY-MM-DD');
        filledDays[key] = typedLeaveData.daysDetails?.[key] || { timeOffDuration: 'FULL_DAY' };
      });
      setLeaveData((prev) => ({
        ...prev,
        daysDetails: filledDays,
      }));
    }
  }, [dateRange, setLeaveData]);

  // Handler to update the daysDetails in context on user selection
  const handleDurationChange = (date: string, duration: TimeOffDuration) => {
    setLeaveData((prev) => ({
      ...prev,
      daysDetails: {
        ...(prev.daysDetails || {}),
        [date]: { timeOffDuration: duration },
      },
    }));
  };

  // Prepare payload for API
  const preparePayload = (leaveData: CreateTimeOffRequest, userId: string) => {
    // Calculate total days
    const daysDetailsObj = leaveData.daysDetails || {};
    const totalDays = Object.values(daysDetailsObj).reduce((sum, item: any) => {
      if (item.timeOffDuration === 'FULL_DAY') return sum + 1;
      if (item.timeOffDuration === 'FIRST_HALF' || item.timeOffDuration === 'SECOND_HALF') return sum + 0.5;
      return sum;
    }, 0);

    return {
      ...leaveData,
      userId,
      totalDays,
      startDate: new Date(leaveData.startDate).toISOString(),
      endDate: new Date(leaveData.endDate).toISOString(),
      status: 'PENDING',
      isPaid: false,
      approvalChallenge: '',
      approvalDetails: { isApproved: false, remarks: '', approvedBy: '' },
      attachments: {},
      extras: {},
    };
  };

  const { mutateAsync: addTimeOffRequest } = useTimeOffRequestAdd();

  const handleSubmit = async () => {
    try {
      const userId = 'j050larasfexkl6zannowu4v'; // Replace with actual userId from auth context
      const payload = preparePayload(typedLeaveData, userId);
      await addTimeOffRequest(payload);

      router.push('/TimeOff')
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  return (
    <Box className="flex-1 bg-gray-50 px-4 py-4">
      <VStack className="flex-1">

        {dateRange.length === 0 ? (
          <Text className="text-gray-500 mb-4">No dates selected.</Text>
        ) : (
          dateRange.map((dt) => {
            const dateKey = dt.format('YYYY-MM-DD'); // YYYY-MM-DD
            const currentDuration = typedLeaveData.daysDetails?.[dateKey]?.timeOffDuration || 'FULL_DAY';
            return (
              <HStack
                key={dateKey}
                className="bg-white rounded-md p-3 mb-3 items-center"
              >
                <Icon as={CalendarDaysIcon} size="md" className="mr-2" />
                <Text className="flex-1 font-medium">{dateKey}</Text>
                <Box className="flex-1">
                  <Select
                    defaultValue={currentDuration}
                    onValueChange={(val) =>
                      handleDurationChange(dateKey, val as TimeOffDuration)
                    }
                  >
                    <SelectTrigger variant="outline">
                      <SelectInput />
                      <SelectIcon />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectItem label="First Half" value="FIRST_HALF" />
                        <SelectItem label="Second Half" value="SECOND_HALF" />
                        <SelectItem label="Full Day" value="FULL_DAY" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </Box>
              </HStack>
            );
          })
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
          <Button
            className="bg-blue-500 text-white font-bold py-3 flex-1 rounded-md"
            onPress={handleSubmit}
          >
            <Text className="text-[1rem] text-white">Submit</Text>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
