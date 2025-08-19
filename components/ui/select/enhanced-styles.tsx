import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

// Enhanced styles for Select ActionSheet
export const enhancedSelectStyles = {
  // Adjust these values to improve the popup appearance
  contentStyle: tva({
    base: 'items-center rounded-tl-3xl rounded-tr-3xl p-3 bg-background-0 web:pointer-events-auto web:select-none shadow-lg',
  }),

  backdropStyle: tva({
    base: 'absolute left-0 top-0 right-0 bottom-0 bg-background-dark web:cursor-default web:pointer-events-auto opacity-70',
  }),

  // Additional direct styles for React Native
  nativeStyles: StyleSheet.create({
    content: {
      maxHeight: isAndroid ? '60%' : '70%',
      marginTop: 'auto', // Push to bottom
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 16,
      paddingBottom: isIOS ? 40 : 24, // Extra padding for iOS (safe area)
      backgroundColor: '#ffffff',
      width: SCREEN_WIDTH,

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

      // Improved animation handling
      animationDuration: 300,
    },
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker for better visibility
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    itemText: {
      paddingVertical: isAndroid ? 14 : 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#333',
    },
    selectedItem: {
      backgroundColor: '#f0f4ff',
    },
    selectedText: {
      color: '#0052cc',
      fontWeight: '500',
    },
    dragIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#ccc',
      marginBottom: 16, // Increased for better spacing
      marginTop: 8,
    },
    scrollView: {
      width: '100%',
      paddingHorizontal: 8,
    },
    listContainer: {
      width: '100%',
      alignItems: 'center',
      paddingBottom: isIOS ? 24 : 16,
    },
    header: {
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#eee',
      marginBottom: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      textAlign: 'center',
    },
  }),
};
