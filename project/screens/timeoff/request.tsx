import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { Textarea, TextareaInput } from '@/components/ui/textarea';

import DatePickerComponent from '@/components/DatePickerComponent';
import { CalendarDaysIcon, CircleIcon, Icon } from '@/components/ui/icon';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@/components/ui/radio';
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
import { DateType } from 'react-native-ui-datepicker';

export default function TimeoffRequest() {
  const [selectedStartDate, setSelectedStartDate] = useState<DateType>();
  const [selectedEndDate, setSelectedEndDate] = useState<DateType>();
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    navigation.setOptions({ title: 'Request Leave' });
  }, [navigation]);

  const toggleStartPicker = () => setStartPickerVisible(!isStartPickerVisible);
  const toggleEndPicker = () => setEndPickerVisible(!isEndPickerVisible);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Box className="px-4 py-4 flex-1">
            <VStack className="flex-1">
              <VStack>
                <Text className="text-gray-600 font-bold">Leave Type</Text>
              </VStack>
              <VStack space="sm" className="mt-2">
                <Box className="border border-gray-300 rounded-md p-6 min-h-48 w-full sm:w-96">
                  <RadioGroup className="flex flex-col gap-y-4">
                    <Radio value="sick" size="lg" className="mb-4">
                      <RadioIndicator>
                        <RadioIcon as={CircleIcon} />
                      </RadioIndicator>
                      <RadioLabel className="text-md">Sick Leave</RadioLabel>
                    </Radio>
                    <Radio value="personal" size="lg" className="mb-4">
                      <RadioIndicator>
                        <RadioIcon as={CircleIcon} />
                      </RadioIndicator>
                      <RadioLabel className="text-md">
                        Personal Leave
                      </RadioLabel>
                    </Radio>
                    <Radio value="vacation" size="lg">
                      <RadioIndicator>
                        <RadioIcon as={CircleIcon} />
                      </RadioIndicator>
                      <RadioLabel className="text-md">Vacation</RadioLabel>
                    </Radio>
                  </RadioGroup>
                </Box>
              </VStack>
              <VStack>
                <Text className="text-gray-600 font-bold mt-4">
                  Description
                </Text>
                <Box className="mt-2">
                  <Textarea
                    size="md"
                    isReadOnly={false}
                    isInvalid={false}
                    isDisabled={false}
                    className="w-full h-16"
                  >
                    <TextareaInput placeholder="Your text goes here..." />
                  </Textarea>
                </Box>
              </VStack>
              <VStack>
                <Text className="text-gray-600 font-bold mt-4">
                  Select Dates
                </Text>
                <Text className="text-gray-500 mt-1">
                  Select the start and end dates for your leave
                </Text>
                <Box className="border border-gray-300 rounded-md p-4 bg-white mt-2">
                  <TouchableOpacity onPress={toggleStartPicker}>
                    <View className="flex-row justify-between items-center">
                      <Box>
                        {!isStartPickerVisible && (
                          <Text className="text-black">
                            {selectedStartDate
                              ? dayjs.isDayjs(selectedStartDate)
                                ? selectedStartDate.format('MMM DD, YYYY')
                                : new Date(
                                    selectedStartDate,
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                  })
                              : 'Pick a Start Date'}
                          </Text>
                        )}
                      </Box>
                      {!isStartPickerVisible && (
                        <Icon as={CalendarDaysIcon} size="md" />
                      )}
                    </View>
                  </TouchableOpacity>
                  {isStartPickerVisible && (
                    <DatePickerComponent
                      visible={isStartPickerVisible}
                      selectedDate={selectedStartDate}
                      onDateChange={(date) => {
                        setSelectedStartDate(date);
                        setStartPickerVisible(false);
                      }}
                    />
                  )}
                </Box>
                <Box className="border border-gray-300 rounded-md p-4 bg-white mt-2">
                  <TouchableOpacity onPress={toggleEndPicker}>
                    <View className="flex-row justify-between items-center">
                      <Box>
                        {!isEndPickerVisible && (
                          <Text className="text-black">
                            {selectedEndDate
                              ? dayjs.isDayjs(selectedEndDate)
                                ? selectedEndDate.format('MMM DD, YYYY')
                                : new Date(selectedEndDate).toLocaleDateString(
                                    'en-US',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: '2-digit',
                                    },
                                  )
                              : 'Pick an End Date'}
                          </Text>
                        )}
                      </Box>
                      {!isEndPickerVisible && (
                        <Icon as={CalendarDaysIcon} size="md" />
                      )}
                    </View>
                  </TouchableOpacity>
                  {isEndPickerVisible && (
                    <DatePickerComponent
                      visible={isEndPickerVisible}
                      selectedDate={selectedEndDate}
                      onDateChange={(date) => {
                        setSelectedEndDate(date);
                        setEndPickerVisible(false);
                      }}
                    />
                  )}
                </Box>
              </VStack>
            </VStack>
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
                onPress={() => {
                  router.push({
                    pathname: '/timeoff/request-itemized',
                    params: {
                      selectedStartDate: selectedStartDate
                        ? dayjs.isDayjs(selectedStartDate)
                          ? selectedStartDate.toISOString()
                          : new Date(selectedStartDate).toISOString()
                        : '',
                      selectedEndDate: selectedEndDate
                        ? dayjs.isDayjs(selectedEndDate)
                          ? selectedEndDate.toISOString()
                          : new Date(selectedEndDate).toISOString()
                        : '',
                    },
                  });
                }}
              >
                <Text className="text-[1rem] text-white">Next</Text>
              </Button>
            </HStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
