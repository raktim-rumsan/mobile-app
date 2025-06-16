import { Platform, StyleSheet } from 'react-native';
import { ChevronDownIcon } from './ui/icon';
import { SelectIcon, SelectInput, SelectTrigger } from './ui/select';

interface AppSelectTriggerProps {
  selectInputProps?: Record<string, any>;
  [key: string]: any;
}

export function AppSelectTrigger(props: AppSelectTriggerProps) {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isMobile = isAndroid || isIOS;

  // On mobile platforms, we need to adjust the height and padding
  const mobileStyles = isMobile
    ? {
        height: isAndroid ? 48 : 46,
        paddingHorizontal: 16,
        minHeight: isAndroid ? 44 : 42,
      }
    : {};

  return (
    <SelectTrigger
      variant="outline"
      size="md"
      className={`border-gray-300 ${isAndroid ? 'h-12' : ''}`}
      style={[mobileStyles, props.style]}
      {...props}
    >
      <SelectInput
        className="text-gray-800 placeholder:text-gray-500"
        style={isMobile ? styles.inputText : {}}
        {...props.selectInputProps}
      />
      <SelectIcon
        className={`mr-3 ${isAndroid ? 'opacity-70' : ''}`}
        as={ChevronDownIcon}
        style={isMobile ? styles.icon : {}}
      />
    </SelectTrigger>
  );
}

const styles = StyleSheet.create({
  inputText: {
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 12,
    opacity: 0.7,
  },
});
