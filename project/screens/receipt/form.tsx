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
import { useCamera } from '@/core/context/CameraContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Platform, Pressable, TextInput } from 'react-native';
import { useCreateInvoice } from '../../queries/invoice.query';
import { Currency, InvoiceType } from '../../types/enums';
// @ts-ignore
import { Header } from '@/components/Header';
import { View } from '@/components/Themed';
import { useApp } from '@/core/context/AppContext';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { useLookupList } from '@/project/queries/misc.query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Form state type based on CreateInvoice but with some fields optional for form handling
 * Uses string for amount to handle form input, and allows empty strings for optional selects
 */
type ReceiptFormState = {
  description: string;
  projectId: string;
  categoryId: string;
  invoiceType: InvoiceType | '';
  date: Date;
  currency: Currency | '';
  amount: string; // Keep as string for form input handling
};

/**
 * UI state for form interactions (separate from data state)
 */
type FormUIState = {
  showDatePicker: boolean;
};

const invoiceTypes = [
  { label: 'VAT', value: 'VAT' },
  { label: 'PAN', value: 'PAN' },
  { label: 'Estimate', value: 'ESTIMATE' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Voucher', value: 'VOUCHER' },
];

const currencies = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'NPR (रू)', value: 'NPR' },
  { label: 'USDC', value: 'USDC' },
];

export default function ReceiptForm() {
  const { photoUri } = useCamera();
  const router = useRouter();
  const { wallet } = useApp();
  const createInvoiceMutation = useCreateInvoice();

  // Form state - object-based using Invoice type
  const [formData, setFormData] = useState<ReceiptFormState>({
    description: '',
    projectId: '',
    categoryId: '',
    invoiceType: '',
    date: new Date(),
    currency: '',
    amount: '',
  });

  // UI state for form interactions
  const [uiState, setUIState] = useState<FormUIState>({
    showDatePicker: false,
  });

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor =
    useThemeColor({}, 'background') === '#fff' ? '#e5e7eb' : '#374151';

  // Helper function to update form data with proper typing
  const updateFormData = <K extends keyof ReceiptFormState>(
    field: K,
    value: ReceiptFormState[K],
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Helper function to update UI state with proper typing
  const updateUIState = <K extends keyof FormUIState>(
    field: K,
    value: FormUIState[K],
  ) => {
    setUIState((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to reset form to initial state
  const resetForm = () => {
    setFormData({
      description: '',
      projectId: '',
      categoryId: '',
      invoiceType: '',
      date: new Date(),
      currency: '',
      amount: '',
    });
    setUIState({
      showDatePicker: false,
    });
  };

  const { data: lookupData } = useLookupList();

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.amount || !formData.currency || !formData.description) {
        alert(
          'Please fill in all required fields (amount, currency, and description)',
        );
        return;
      }

      // Validate amount is a valid number
      const parsedAmount = parseFloat(formData.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
      }

      // Prepare the receipt data
      const receiptData = {
        description: formData.description,
        date: formData.date,
        amount: parsedAmount,
        currency: formData.currency,
        categoryId: formData.categoryId || null,
        projectId: formData.projectId || null,
        invoiceType: formData.invoiceType || 'VAT',
        // Add photoUri to attachments if available
        attachments: photoUri ? [{ url: photoUri, type: 'image' }] : [],
      };

      // Create the receipt
      const newReceipt = await createInvoiceMutation.mutateAsync(receiptData);

      if (newReceipt) {
        console.log('Receipt created successfully:', newReceipt);

        // Sign the description with wallet if available
        if (wallet && formData.description) {
          try {
            const signature = await wallet.signMessage(formData.description);
          } catch (signError) {
            console.warn('Failed to sign message:', signError);
          }
        }

        // Navigate to the receipt detail page or back to list
        alert('Receipt created successfully!');
        resetForm(); // Reset form after successful creation
        router.replace('/(tabs)/receipt/list');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error creating receipt: ${errorMessage}. Please try again.`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title="Create Receipt"
        onBackPress={() => router.push('/receipt/list')}
      />
      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Receipt Image */}
          {photoUri ? (
            <Pressable onPress={() => router.push('/(tabs)/receipt/preview')}>
              <Box className="w-full h-[200px] mb-4 rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-full rounded-lg"
                  resizeMode="contain"
                  alt="Receipt Image"
                />
              </Box>
            </Pressable>
          ) : (
            <Box className="w-full h-[200px] mb-4 rounded-lg justify-center items-center bg-gray-100">
              <Text>No receipt image available</Text>
            </Box>
          )}

          <VStack space="md" className="w-full">
            <HStack space="md">
              <FormControl className="flex w-[120px]">
                <FormControlLabel>
                  <FormControlLabelText>Currency *</FormControlLabelText>
                </FormControlLabel>
                <AppSelect
                  items={currencies}
                  selectedValue="NPR"
                  onValueChange={(value: string) =>
                    updateFormData('currency', value as Currency)
                  }
                  placeholder="Select"
                  containerStyle={{ height: 48 }}
                />
              </FormControl>

              <FormControl className="flex flex-1">
                <FormControlLabel>
                  <FormControlLabelText>Amount *</FormControlLabelText>
                </FormControlLabel>
                {/* Temporary test with standard TextInput */}
                <TextInput
                  style={{
                    height: 48,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    backgroundColor: 'white',
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={(value: string) => {
                    updateFormData('amount', value);
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
                    selected={formData.date}
                    onChange={(d: Date | null) => {
                      if (d) updateFormData('date', d);
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
                    onPress={() => updateUIState('showDatePicker', true)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 6,
                    }}
                  >
                    <Text>{format(formData.date, 'yyyy-MM-dd')}</Text>
                  </Pressable>
                  {uiState.showDatePicker && (
                    <DateTimePicker
                      value={formData.date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        updateUIState('showDatePicker', Platform.OS === 'ios');
                        if (selectedDate) updateFormData('date', selectedDate);
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
                <FormControlLabelText size="sm">
                  Description *
                </FormControlLabelText>
              </FormControlLabel>
              {/* Temporary test with standard TextInput */}
              <TextInput
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                }}
                value={formData.description}
                onChangeText={(value: string) => {
                  updateFormData('description', value);
                }}
                placeholder="Enter description"
                multiline
              />
            </FormControl>

            {/* Project */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Project</FormControlLabelText>
              </FormControlLabel>
              <AppSelect
                items={lookupData?.selectData.projects}
                selectedValue={formData.projectId}
                onValueChange={(value: string) =>
                  updateFormData('projectId', value)
                }
                placeholder="Select project"
              />
            </FormControl>

            {/* Category */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Category</FormControlLabelText>
              </FormControlLabel>
              <AppSelect
                items={lookupData?.selectData.categories}
                selectedValue={formData.categoryId}
                onValueChange={(value: string) =>
                  updateFormData('categoryId', value)
                }
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
                selectedValue={formData.invoiceType}
                onValueChange={(value: string) =>
                  updateFormData('invoiceType', value as InvoiceType)
                }
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
                disabled={createInvoiceMutation.isPending}
              >
                <Text className="text-white">
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Submit'}
                </Text>
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
