import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import {
  Box,
  Button,
  HStack,
  Image,
  ScrollView,
  Text,
  VStack,
} from '@/components/ui';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { useCamera } from '@/context/CameraContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Platform, Pressable, StyleSheet } from 'react-native';
// @ts-ignore
import { View } from '@/components/Themed';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const projects = [
  { label: 'Project 1', value: 'project1' },
  { label: 'Project 2', value: 'project2' },
  { label: 'Project 3', value: 'project3' },
];

const categories = [
  { label: 'Food', value: 'food' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Accommodation', value: 'accommodation' },
  { label: 'Office Supplies', value: 'office_supplies' },
  { label: 'Transportation', value: 'transportation1' },
  { label: 'Accommodation', value: 'accommodation1' },
  { label: 'Office Supplies', value: 'office_supplies1' },
  { label: 'Transportation', value: 'transportation2' },
  { label: 'Accommodation', value: 'accommodation2' },
  { label: 'Office Supplies', value: 'office_supplies2' },
  { label: 'Transportation', value: 'transportation3' },
  { label: 'Accommodation', value: 'accommodation3' },
  { label: 'Office Supplies', value: 'office_supplies3' },
];

const invoiceTypes = [
  { label: 'Receipt', value: 'receipt' },
  { label: 'Invoice', value: 'invoice' },
  { label: 'Bill', value: 'bill' },
];

const currencies = [
  { label: 'USD ($)', value: 'usd' },
  { label: 'EUR (€)', value: 'eur' },
  { label: 'GBP (£)', value: 'gbp' },
  { label: 'NPR (रू)', value: 'npr' },
];

export default function ReceiptForm() {
  const { photoUri } = useCamera();
  const router = useRouter();
  const { wallet } = useApp();

  // Form state
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [category, setCategory] = useState('');
  const [invoiceType, setInvoiceType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    // Here you would handle form submission, e.g. save to database
    console.log({
      photoUri,
      description,
      project,
      category,
      invoiceType,
      date,
      currency,
      amount,
    });
    console.log(await wallet?.signMessage(description));

    // Navigate back after submission
    //router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Receipt Image */}
        {photoUri ? (
          <Pressable onPress={() => router.push('/(tabs)/receipt/preview')}>
            <Box style={styles.imageContainer}>
              <Image
                source={{ uri: photoUri }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
                alt="Receipt Image"
              />
            </Box>
          </Pressable>
        ) : (
          <Box style={styles.noImageContainer}>
            <Text>No receipt image available</Text>
          </Box>
        )}

        <VStack space="md" style={styles.form}>
          <HStack space="md">
            <FormControl className="flex w-[120px]">
              <FormControlLabel>
                <FormControlLabelText>Currency</FormControlLabelText>
              </FormControlLabel>
              <AppSelect
                items={currencies}
                selectedValue={currency}
                onValueChange={setCurrency}
                placeholder="Select"
              />
            </FormControl>

            <FormControl className="flex flex-1">
              <FormControlLabel>
                <FormControlLabelText>Amount</FormControlLabelText>
              </FormControlLabel>
              <AppInput
                className="h-14"
                type="numeric"
                keyboardType="numeric"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </FormControl>
          </HStack>

          {/* Date */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Date</FormControlLabelText>
            </FormControlLabel>
            {Platform.OS === 'web' ? (
              <div className="px-2 py-2 border border-gray-300 rounded-md">
                <ReactDatePicker
                  wrapperClassName="w-full"
                  selected={date}
                  onChange={(d: Date | null) => {
                    if (d) setDate(d);
                  }}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  customInput={
                    <input
                      style={{ width: '100%' }}
                      className="border-none bg-transparent text-base"
                    />
                  }
                />
              </div>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                  }}
                >
                  <Text>{format(date, 'yyyy-MM-dd')}</Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) setDate(selectedDate);
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText size="sm">Description</FormControlLabelText>
            </FormControlLabel>
            <AppInput
              className="py-2"
              variant="outline"
              size="lg"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              inputFieldProps={{
                onChange: (e: any) => {
                  setDescription(e.nativeEvent.text);
                },
                placeholder: 'Enter description',
              }}
            />
          </FormControl>

          {/* Project */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Project</FormControlLabelText>
            </FormControlLabel>
            <AppSelect
              items={projects}
              selectedValue={project}
              onValueChange={setProject}
              placeholder="Select project"
            />
          </FormControl>

          {/* Category */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Category</FormControlLabelText>
            </FormControlLabel>
            <AppSelect
              items={categories}
              selectedValue={category}
              onValueChange={setCategory}
              placeholder="Select category"
            />
          </FormControl>

          {/* Invoice Type */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Invoice Type</FormControlLabelText>
            </FormControlLabel>
            <AppSelect
              items={invoiceTypes}
              selectedValue={invoiceType}
              onValueChange={setInvoiceType}
              placeholder="Select invoice type"
            />
          </FormControl>

          {/* Submit and Cancel Buttons */}
          <HStack space="md" className="m-auto mt-4">
            <Button variant="outline" onPress={handleCancel}>
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="solid"
              onPress={handleSubmit}
              className="bg-blue-500"
            >
              <Text className="text-white">Submit</Text>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200, // Increase height for full image display
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  form: {
    width: '100%',
  },
});
