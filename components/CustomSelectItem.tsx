import React from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { SelectItem } from './ui/select';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

interface CustomSelectItemProps {
  label: string;
  value: string;
  isSelected?: boolean;
  onSelect: (value: string) => void;
}

export function CustomSelectItem({
  label,
  value,
  isSelected = false,
  onSelect,
}: CustomSelectItemProps) {
  // On web, use the default SelectItem component
  if (Platform.OS === 'web') {
    return <SelectItem label={label} value={value} />;
  }

  // For mobile platforms, use a custom component with better touch area
  return (
    <TouchableHighlight
      underlayColor="#f0f4ff"
      onPress={() => onSelect(value)}
      style={[styles.item, isSelected && styles.selectedItem]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.itemContainer}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>
          {label}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
}

// Mobile-specific component for select items list
export function MobileSelectList({
  items = [],
  selectedValue,
  onValueChange,
  onClose,
}: {
  items: Array<{ label: string; value: string }>;
  selectedValue?: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
}) {
  const handleSelect = (value: string) => {
    onValueChange(value);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.dragIndicator} />

      <View style={styles.header}>
        <Text style={styles.headerText}>Select an option</Text>
      </View>

      {/* Set a fixed height for the scroll view to ensure the cancel button is always visible */}
      <View style={styles.scrollViewContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item) => (
            <CustomSelectItem
              key={item.value}
              label={item.label}
              value={item.value}
              isSelected={selectedValue === item.value}
              onSelect={handleSelect}
            />
          ))}
        </ScrollView>
      </View>

      {/* Cancel button - always visible */}
      <TouchableHighlight
        underlayColor="#f5f5f5"
        onPress={onClose}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingBottom: isIOS ? 34 : 16, // Account for bottom safe area on iOS
  },
  scrollViewContainer: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.45, // Limit height to ensure cancel button is visible
    flexShrink: 1,
  },
  scrollView: {
    width: '100%',
    flexGrow: 0,
  },
  scrollContent: {
    width: '100%',
    paddingBottom: 16,
  },
  header: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginTop: 8,
    marginBottom: 16,
  },
  item: {
    width: '100%',
    paddingVertical: isAndroid ? 16 : 14,
    paddingHorizontal: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItem: {
    backgroundColor: '#f0f4ff',
  },
  text: {
    fontSize: isAndroid ? 16 : 17,
    color: '#333',
  },
  selectedText: {
    color: '#0052cc',
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0052cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '90%',
    marginTop: 12,
    marginBottom: isIOS ? 8 : 4,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    // Ensure the button stands out with a subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: isAndroid ? 2 : 0,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500',
  },
});
