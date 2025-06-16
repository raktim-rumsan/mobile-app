import { useState } from 'react';
import {
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { MobileSelectList } from './CustomSelectItem';
import { ChevronDownIcon } from './ui/icon';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './ui/select';
import { enhancedSelectStyles } from './ui/select/enhanced-styles';

interface SelectItem {
  label: string;
  value: string;
}

interface AppSelectProps {
  items?: SelectItem[];
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppSelect({
  items = [],
  selectedValue,
  onValueChange = () => {},
  placeholder = 'Select an option',
  isDisabled = false,
  containerStyle = {},
}: AppSelectProps) {
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Get the selected item's label to display in the trigger
  const selectedItem = items.find((item) => item.value === selectedValue);
  const displayText = selectedItem?.label || placeholder;

  // On mobile platforms (iOS and Android), use a custom modal for better UX
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <>
        <TouchableOpacity
          style={[styles.trigger, containerStyle]}
          disabled={isDisabled}
          onPress={() => setShowMobileModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.triggerText, !selectedItem && styles.placeholder]}
          >
            {displayText}
          </Text>
          <ChevronDownIcon width={20} height={20} stroke="#666" />
        </TouchableOpacity>

        <Modal
          visible={showMobileModal}
          transparent={true}
          animationType={Platform.OS === 'android' ? 'fade' : 'slide'}
          onRequestClose={() => setShowMobileModal(false)}
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={() => setShowMobileModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,
                    Platform.OS === 'android' ? styles.androidModalContent : {},
                  ]}
                >
                  <MobileSelectList
                    items={items}
                    selectedValue={selectedValue}
                    onValueChange={onValueChange}
                    onClose={() => setShowMobileModal(false)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }

  // Web platform uses the default select component
  return (
    <Select
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      isDisabled={isDisabled}
    >
      <SelectTrigger
        variant="outline"
        size="md"
        className="border-gray-300"
        style={containerStyle}
      >
        <SelectInput
          className="text-gray-800 placeholder:text-gray-500"
          placeholder={placeholder}
        />
        <SelectIcon className="mr-3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop style={enhancedSelectStyles.nativeStyles.backdrop} />
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  triggerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Extra padding for iOS
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 10,
  },
  androidModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
    elevation: 24,
  },
});
