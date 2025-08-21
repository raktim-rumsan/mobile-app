import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { Header } from '@/components/Header';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { CheckIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetInvoice, useUpdateInvoice } from '../../queries/invoice.query';

const projects = [
  { label: 'Project Alpha', value: 'project_alpha' },
  { label: 'Project Beta', value: 'project_beta' },
  { label: 'Project Gamma', value: 'project_gamma' },
  { label: 'Project Delta', value: 'project_delta' },
];

const categories = [
  { label: 'Groceries', value: 'groceries' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Dining', value: 'dining' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Health', value: 'health' },
  { label: 'Accommodation', value: 'accommodation' },
  { label: 'Office Supplies', value: 'office_supplies' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Entertainment', value: 'entertainment' },
];

const invoiceTypes = [
  { label: 'Receipt', value: 'receipt' },
  { label: 'Invoice', value: 'invoice' },
  { label: 'Bill', value: 'bill' },
  { label: 'Expense Report', value: 'expense_report' },
];

const currencies = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'NPR (रू)', value: 'NPR' },
];

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Reimbursed', value: 'REIMBURSED' },
];

export default function ReceiptEditScreen() {
  const { id } = useLocalSearchParams();
  const {
    data: receipt,
    isLoading: loadingReceipt,
    error,
  } = useGetInvoice(id as string);
  const updateInvoiceMutation = useUpdateInvoice();

  // Form state - initialize with existing data
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [category, setCategory] = useState('');
  const [invoiceType, setInvoiceType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing receipt data
  useEffect(() => {
    if (receipt) {
      setDescription(receipt.description || '');
      setProject(receipt.Project?.cuid || '');
      setCategory(receipt.Category?.cuid || '');
      setInvoiceType(receipt.invoiceType || '');
      setDate(new Date(receipt.date));
      setCurrency(receipt.currency || '');
      setAmount(receipt.amount?.toString() || '');
      setStatus(receipt.status || '');
      setImageUrl(receipt.attachments?.[0]?.url || '');
      setLoading(false);
    }
  }, [receipt]);

  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!amount || !currency || !category || !description) {
        alert('Please fill in all required fields');
        return;
      }

      const updatedReceipt = {
        description,
        categoryId: category,
        invoiceType,
        date,
        currency,
        amount: parseFloat(amount),
        status,
        projectId: project || null,
      };

      console.log('Saving receipt:', updatedReceipt);

      await updateInvoiceMutation.mutateAsync({
        id: id as string,
        payload: updatedReceipt,
      });

      // Navigate back to detail page
      router.back();
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleImagePress = () => {
    // Navigate to image preview
    router.push(
      `/(tabs)/receipt/preview?imageUrl=${encodeURIComponent(imageUrl)}`,
    );
  };

  if (loadingReceipt || loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Header title="Edit Receipt" />
        <Box className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading receipt data...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (error || !receipt) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Header
          title="Edit Receipt"
          onBackPress={() => router.push(`/receipt/detail?id=${receipt?.cuid}`)}
        />
        <Box className="flex-1 items-center justify-center">
          <Text className="text-red-500 text-center text-lg">
            Error loading receipt
          </Text>
          <Text className="text-gray-400 text-center text-sm mt-2">
            Please try again later
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        {/* Header */}
        <Header
          title="Edit Receipt"
          onBackPress={() => router.push(`/receipt/detail?id=${id}`)}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Receipt Image */}
          {imageUrl ? (
            <Pressable onPress={handleImagePress}>
              <Box style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-full rounded-lg"
                  resizeMode="contain"
                  alt="Receipt Image"
                />
                <Text className="text-center text-sm text-gray-500 mt-2">
                  Tap to view full size
                </Text>
              </Box>
            </Pressable>
          ) : (
            <Box style={styles.noImageContainer}>
              <Text className="text-gray-500">No receipt image available</Text>
            </Box>
          )}

          <VStack space="md" style={styles.form}>
            {/* Amount and Currency */}
            <HStack space="md">
              <FormControl className="flex w-[120px]">
                <FormControlLabel>
                  <FormControlLabelText>Currency *</FormControlLabelText>
                </FormControlLabel>
                <AppSelect
                  items={currencies}
                  selectedValue={currency}
                  onValueChange={setCurrency}
                  placeholder="Select"
                  containerStyle={{ height: 48 }}
                />
              </FormControl>

              <FormControl className="flex flex-1">
                <FormControlLabel>
                  <FormControlLabelText>Amount *</FormControlLabelText>
                </FormControlLabel>
                <AppInput
                  style={{ height: 48 }}
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
                <FormControlLabelText>Date *</FormControlLabelText>
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

            {/* Category */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Category *</FormControlLabelText>
              </FormControlLabel>
              <AppSelect
                items={categories}
                selectedValue={category}
                onValueChange={setCategory}
                placeholder="Select category"
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Description *</FormControlLabelText>
              </FormControlLabel>
              <AppInput
                className="py-2"
                variant="outline"
                size="lg"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                inputFieldProps={{
                  value: description,
                  onChangeText: setDescription,
                  placeholder: 'Enter description',
                  multiline: true,
                  numberOfLines: 3,
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

            {/* Status */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Status</FormControlLabelText>
              </FormControlLabel>
              <AppSelect
                items={statusOptions}
                selectedValue={status}
                onValueChange={setStatus}
                placeholder="Select status"
              />
            </FormControl>

            {/* Action Buttons */}
            <HStack space="md" className="mt-6">
              <Button
                variant="outline"
                onPress={handleCancel}
                className="flex-1"
              >
                <HStack className="items-center space-x-2">
                  <XMarkIcon size={16} color="#6b7280" />
                  <Text className="text-gray-700">Cancel</Text>
                </HStack>
              </Button>
              <Button
                variant="solid"
                onPress={handleSave}
                className="bg-blue-600 flex-1"
                disabled={updateInvoiceMutation.isPending}
              >
                <HStack className="items-center space-x-2">
                  <CheckIcon size={16} color="white" />
                  <Text className="text-white">
                    {updateInvoiceMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
