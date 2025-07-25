import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
//const SecureStore: any = null;

const storageUtil = {
  setItem: async (k: string, v: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(k, v);
    } else {
      await SecureStore?.setItemAsync(k, v.toString());
    }
  },
  getItem: async (k: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(k);
    } else {
      return await SecureStore?.getItemAsync(k);
    }
  },
};
export default storageUtil;
