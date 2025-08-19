import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from './ui/button';

// Add a set of allowed icon colors with names
export const ALERT_POPUP_ICON_COLORS = [
  { name: 'Red', code: '#e53e3e' },
  { name: 'Orange', code: '#f59e42' },
  { name: 'Yellow', code: '#ecc94b' },
  { name: 'Green', code: '#38a169' },
  { name: 'Blue', code: '#3182ce' },
  { name: 'Purple', code: '#805ad5' },
  { name: 'Pink', code: '#d53f8c' },
  { name: 'Gray', code: '#718096' },
  { name: 'Dark Gray', code: '#2d3748' },
  { name: 'Almost Black', code: '#1a202c' },
] as const;

export type AlertPopupIconColor = (typeof ALERT_POPUP_ICON_COLORS)[number];

interface AlertPopupProps {
  visible: boolean;
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: AlertPopupIconColor;
  onClose: () => void;
  details?: string; // Optional error details
  buttonText?: string; // Customizable button text
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  visible,
  message,
  iconName = 'alert-circle',
  iconColor = ALERT_POPUP_ICON_COLORS[0], // Default to Red
  onClose,
  details,
  buttonText = 'Close',
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  // Handle platform-specific styling
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const containerPadding = isAndroid ? 0 : 8;
  const iconSize = isAndroid ? 56 : 64;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.popup,
            { padding: 24 + containerPadding },
            isAndroid && styles.androidPopup,
            isIOS && styles.iosPopup,
          ]}
        >
          <Ionicons
            name={iconName}
            size={iconSize}
            color={iconColor.code}
            style={styles.icon}
          />
          <Text
            style={[
              styles.message,
              isAndroid ? styles.androidText : {},
              isIOS ? styles.iosText : {},
            ]}
            className="mt-4 mb-8"
          >
            {message}
          </Text>

          {details && showDetails && (
            <Text
              style={[
                styles.details,
                isAndroid ? styles.androidDetailsText : {},
                isIOS ? styles.iosDetailsText : {},
              ]}
            >
              {details}
            </Text>
          )}

          <Button
            size="md"
            variant="solid"
            action="positive"
            onPress={onClose}
            className={`text-white ${isAndroid ? 'mb-2' : ''}`}
            style={[
              { backgroundColor: iconColor.code },
              isAndroid && styles.androidButton,
              isIOS && styles.iosButton,
            ]}
          >
            <Text
              style={[styles.buttonText, isAndroid && styles.androidButtonText]}
            >
              {buttonText}
            </Text>
          </Button>

          {details && (
            <TouchableOpacity
              onPress={() => setShowDetails((v) => !v)}
              style={styles.infoButton}
              activeOpacity={0.7}
              accessibilityLabel="Toggle error details"
              accessibilityRole="button"
              accessibilityState={{ expanded: showDetails }}
            >
              <Ionicons
                name={
                  showDetails
                    ? 'chevron-up-circle-outline'
                    : 'information-circle-outline'
                }
                size={22}
                color="#888"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Shortcut popups
export const ErrorPopup = (
  props: Omit<AlertPopupProps, 'iconName' | 'iconColor'> & {
    iconColor?: AlertPopupIconColor;
  },
) => (
  <AlertPopup
    {...props}
    iconName="close-circle"
    iconColor={props.iconColor || ALERT_POPUP_ICON_COLORS[0]} // Red
  />
);

export const InfoPopup = (
  props: Omit<AlertPopupProps, 'iconName' | 'iconColor'> & {
    iconColor?: AlertPopupIconColor;
  },
) => (
  <AlertPopup
    {...props}
    iconName="information-circle"
    iconColor={props.iconColor || ALERT_POPUP_ICON_COLORS[4]} // Blue
  />
);

export const WarningPopup = (
  props: Omit<AlertPopupProps, 'iconName' | 'iconColor'> & {
    iconColor?: AlertPopupIconColor;
  },
) => (
  <AlertPopup
    {...props}
    iconName="warning"
    iconColor={props.iconColor || ALERT_POPUP_ICON_COLORS[1]} // Orange
  />
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  // Platform specific popup styles
  androidPopup: {
    borderRadius: 8,
    elevation: 24,
    width: '90%',
  },
  iosPopup: {
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  androidText: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    lineHeight: 20,
  },
  iosText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  details: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -8,
    lineHeight: 16,
  },
  androidDetailsText: {
    fontFamily: 'sans-serif',
    fontSize: 12,
  },
  iosDetailsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  androidButton: {
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 48,
  },
  androidButtonText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 15,
  },
  iosButton: {
    borderRadius: 10,
    paddingHorizontal: 18,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
  },
});
