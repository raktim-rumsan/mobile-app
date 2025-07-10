import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { View } from '@/components/Themed';
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
import { useApp } from '@/context/AppContext';
import { useCamera } from '@/context/CameraContext';
import { useAddInvoice } from '@/queries/receipt.query';
import { InvoiceType } from '@/rumsan/types/raman/enums';
import { getUserIdFromAccessToken } from '@/utils/storage.utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Platform, Pressable, StyleSheet } from 'react-native';
import mime from 'react-native-mime-types';
import data from './data.json';

const invoiceTypes = [
  { label: 'VAT', value: InvoiceType.VAT },
  { label: 'PAN', value: InvoiceType.PAN },
  { label: 'Estimate', value: InvoiceType.ESTIMATE },
  { label: 'Bank Transfer', value: InvoiceType.BANK_TRANSFER },
  { label: 'Voucher', value: InvoiceType.VOUCHER },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // New error state
  const [success, setSuccess] = useState<string | null>(null); // New success state

  const { mutate: addInvoice } = useAddInvoice();


  const handleSubmit = async () => {
  setIsSubmitting(true);
  setError(null);
  setSuccess(null);

  try {
    const userId = await getUserIdFromAccessToken();
    if (!userId) {
      console.error('User ID not found from access token');
      setError('User ID not found. Please log in again.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('Invalid amount entered:', amount);
      setError('Please enter a valid positive amount');
      return;
    }

    const formData = new FormData();
    formData.append('amount', Math.floor(parsedAmount).toString());
    formData.append('currency', currency.toUpperCase());
    formData.append('description', description);
    formData.append('projectId', project);
    formData.append('categoryId', category);
    formData.append('invoiceType', invoiceType);
    formData.append('date', date.toISOString().split('T')[0]); // YYYY-MM-DD
    formData.append('userId', userId);

    if (photoUri) {
      try {
        // Assume photoUri is a single URI or an array of URIs
        const photoUris = Array.isArray(photoUri) ? photoUri : [photoUri];

        for (const uri of photoUris) {
          const fileName = uri.split('/').pop() || `receipt-${Date.now()}.jpg`;
          const fileType = mime.lookup(uri) || 'image/jpeg';

          // Fetch the file as a blob
          const response = await fetch(uri);
          const blob = await response.blob();

          // Append the blob as a file, mimicking web UI's File object
          formData.append('receipts', blob, fileName);
        }

        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      } catch (error) {
        console.error('Error processing receipt file:', error);
        setError('Failed to process receipt file. Please try again.');
        return;
      }
    }

    await addInvoice(formData);
    setSuccess('Receipt submitted successfully!');
    setTimeout(() => router.back(), 2000);
  } catch (error) {
    console.error('Error submitting invoice:', error);
    setError('Failed to submit invoice. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
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
        {error && (
          <Box style={styles.errorContainer}>
            <Text style={{ color: '#ef4444' }}>{error}</Text>
          </Box>
        )}

        {success && (
          <Box style={styles.successContainer}>
            <Text style={{ color: '#22c55e' }}>{success}</Text>
          </Box>
        )}

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
                inputFieldProps={{
                  onChangeText: (text: string) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    console.log('Sanitized amount input:', cleaned);
                    setAmount(cleaned);
                  },
                }}
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
    items={data.projects.map((p: any) => ({
      label: p.name,
      value: p.cuid,
    }))}
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
              items={data.categories.map((c: any) => ({
                label: c.name,
                value: c.cuid,
              }))}
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
              disabled={isSubmitting}
            >
              <Text className="text-white">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
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
    height: 200,
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
  errorContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
  },
  successContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    alignItems: 'center',
  },
});