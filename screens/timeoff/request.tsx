import dayjs from 'dayjs';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DatePickerComponent from '@/components/DatePickerComponent';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { CalendarDaysIcon, CircleIcon, Icon } from '@/components/ui/icon';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@/components/ui/radio';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';

import { useLeaveRequest } from '@/context/TimeoffRequestContext';
import { TimeOffType } from '@/rumsan/types/raman/enums';
import { DateType } from 'react-native-ui-datepicker';

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'PERSONAL', label: 'Personal Leave' },
  { value: 'OTHER', label: 'Vacation' },
];

const formatDate = (date: DateType | undefined) =>
  date
    ? dayjs.isDayjs(date)
      ? date.format('MMM DD, YYYY')
      : dayjs(date).format('MMM DD, YYYY')
    : null;

export default function TimeoffRequest() {
  const [selectedStartDate, setSelectedStartDate] = useState<DateType>();
  const [selectedEndDate, setSelectedEndDate] = useState<DateType>();
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const { leaveData, setLeaveData } = useLeaveRequest();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ title: 'Request Leave' });
  }, [navigation]);

  const handleDateChange = (
    type: 'startDate' | 'endDate',
    date: DateType,
    setVisible: (v: boolean) => void,
    setDate: (v: DateType) => void
  ) => {
    setDate(date);
    setLeaveData((prev) => ({
      ...prev,
      [type]: new Date(dayjs(date).format('YYYY-MM-DD')),
    }));
    setVisible(false);
  };

  const renderDatePickerField = (
    label: string,
    selectedDate: DateType | undefined,
    isVisible: boolean,
    toggleVisible: () => void,
    onDateChange: (date: DateType) => void
  ) => (
    <Box className="border border-gray-300 rounded-md p-4 bg-white mt-2">
      <TouchableOpacity onPress={toggleVisible}>
        <View className="flex-row justify-between items-center">
          <Text className="text-black">
            {formatDate(selectedDate) || label}
          </Text>
          <Icon as={CalendarDaysIcon} size="md" />
        </View>
      </TouchableOpacity>
      {isVisible && (
        <DatePickerComponent
          visible={isVisible}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      )}
    </Box>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Box className="px-4 py-4 flex-1">
            <VStack className="flex-1">
              {/* Leave Type */}
              <VStack>
                <Text className="text-gray-600 font-bold">Leave Type</Text>
                <Box className="border border-gray-300 rounded-md p-6 mt-2">
                  <RadioGroup
                    className="flex flex-col gap-y-4"
                    value={leaveData.type}
                    onChange={(value) =>
                      setLeaveData((prev) => ({
                        ...prev,
                        type: value.toUpperCase() as TimeOffType,
                      }))
                    }
                  >
                    {LEAVE_TYPES.map(({ value, label }) => (
                      <Radio key={value} value={value} size="lg" className="mb-2">
                        <RadioIndicator>
                          <RadioIcon as={CircleIcon} />
                        </RadioIndicator>
                        <RadioLabel className="text-md">{label}</RadioLabel>
                      </Radio>
                    ))}
                  </RadioGroup>
                </Box>
              </VStack>

              {/* Description */}
              <VStack>
                <Text className="text-gray-600 font-bold mt-4">Description</Text>
                <Box className="mt-2">
                  <Textarea size="md" className="w-full h-16">
                    <TextareaInput
                      placeholder="Your text goes here..."
                      value={leaveData.description}
                      onChangeText={(text) =>
                        setLeaveData((prev) => ({ ...prev, description: text }))
                      }
                    />
                  </Textarea>
                </Box>
              </VStack>

              {/* Dates */}
              <VStack>
                <Text className="text-gray-600 font-bold mt-4">Select Dates</Text>
                <Text className="text-gray-500 mt-1">
                  Select the start and end dates for your leave
                </Text>

                {renderDatePickerField(
                  'Pick a Start Date',
                  selectedStartDate,
                  isStartPickerVisible,
                  () => setStartPickerVisible(!isStartPickerVisible),
                  (date) =>
                    handleDateChange('startDate', date, setStartPickerVisible, setSelectedStartDate)
                )}

                {renderDatePickerField(
                  'Pick an End Date',
                  selectedEndDate,
                  isEndPickerVisible,
                  () => setEndPickerVisible(!isEndPickerVisible),
                  (date) =>
                    handleDateChange('endDate', date, setEndPickerVisible, setSelectedEndDate)
                )}
              </VStack>

              {/* Buttons */}
              <HStack className="mt-4">
                <Button
                  variant="outline"
                  className="text-gray-200 py-3 flex-1 rounded-md mr-3"
                  onPress={() => router.back()}
                >
                  <Text className="text-[1rem]">Cancel</Text>
                </Button>
                <Button
                  className="bg-blue-500 text-white font-bold py-3 flex-1 rounded-md"
                  onPress={() => router.push('/timeoff/request-itemized')}
                >
                  <Text className="text-[1rem] text-white">Next</Text>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

