import ApiService from '@/core/services/apiService';
import { useHostService } from '@/core/services/hostService';
import { iHostService } from '@/core/types/iHostService';
import { AuthClient } from '@/rumsan/clients/auth.client';
import { router } from 'expo-router';
import { AppStorage } from '../utils';
import { MiscClient } from './misc.client';
import { ReceiptClient } from './receipt.client';

export const AuthService = new AuthClient(ApiService.client);

export const getServices = async (hostService: iHostService) => {
  console.log('sss');
  const _store = AppStorage(hostService);
  const token = await _store.get('token');
  if (!token) {
    router.replace('/home');
    throw new Error('No token found. Please log in.');
  }
  ApiService.setAccessToken(token.toString());

  const Receipt = new ReceiptClient(ApiService.client);
  const Misc = new MiscClient(ApiService.client);

  return {
    Receipt,
    Misc,
  };
};

// Hook that provides a function to get services
export const useGetServices = () => {
  const hostService = useHostService();

  return () => getServices(hostService);
};
