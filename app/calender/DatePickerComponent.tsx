import React from 'react';
import DateTimePicker, {
  DateType,
  useDefaultClassNames,
} from 'react-native-ui-datepicker';

import dayjs from 'dayjs';
import { View } from 'react-native';

interface DatePickerComponentProps {
  visible: boolean;
  selectedDate: DateType | undefined;
  onDateChange: (date: DateType) => void;
}

export default function DatePickerComponent({
  visible,
  selectedDate,
  onDateChange,
}: DatePickerComponentProps) {
  const defaultClassNames = useDefaultClassNames();

  if (!visible) return null;

  return (
    <View className="p-4 bg-blue-200 rounded-md">
      <DateTimePicker
        mode="single"
        date={selectedDate}
        onChange={({ date }) => onDateChange(date)}
        disabledDates={(date) => [0, 6].includes(dayjs(date).day())}
        classNames={{
          ...defaultClassNames,
          today: 'border-blue-500',
          selected: 'bg-blue-500 border-blue-500',
          selected_label: 'text-white',
          day: `${defaultClassNames.day} hover:bg-blue-100`,
          disabled: 'opacity-50',
          button_next: 'bg-blue-500',
          button_next_image: 'bg-blue-500',
          button_prev: 'bg-blue-500',
          button_prev_image: 'bg-blue-500',
        }}
      />
    </View>
  );
}
