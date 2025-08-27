// Import polyfills first
import '@/core/utils/polyfills';

import { iHostService } from '@/core/types/iHostService';
import storageUtil from '@/core/utils/store.utils';
import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import { router } from 'expo-router';
import { useApp } from '../context/AppContext';

export function useHostService(): iHostService {
  const { getCache, setCache } = useApp();

  const storeData = async (
    name: string,
    value: Record<string, any> | string,
    prefix: string,
  ) => {
    await storageUtil.setItem(`${prefix}_${name}`, JSON.stringify(value));
  };

  const getData = async (name: string, prefix: string) => {
    const data = (await storageUtil.getItem(`${prefix}_${name}`)) || '{}';
    return JSON.parse(data);
  };
  const removeData = async (name: string, prefix: string) => {
    await storageUtil.setItem(`${prefix}_${name}`, '');
  };
  const navigateToWalletSetup = () => {
    router.push('/wallet');
  };
  const getWallet = async (passCode: string) => {
    const walletData = await storageUtil.getItem('wallet');
    if (!walletData) return null;

    const { privateKey } = JSON.parse(walletData);
    return new Wallet(privateKey);
  };

  const getMnemonic = async (passCode: string) => {
    const walletData = await storageUtil.getItem('wallet');
    if (!walletData) return null;

    const { mnemonic } = JSON.parse(walletData);
    return mnemonic ? (mnemonic as Mnemonic) : null;
  };

  const setWallet = async (wallet: HDNodeWallet | Wallet) => {
    await storageUtil.setItem(
      'wallet',
      JSON.stringify({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: 'mnemonic' in wallet ? wallet.mnemonic : undefined,
      }),
    );
  };

  const removeWallet = async () => {
    await storageUtil.setItem('wallet', '');
  };

  return {
    setCache,
    getCache,
    storeData,
    getData,
    removeData,
    navigateToWalletSetup,
    getWallet,
    getMnemonic,
    setWallet,
    removeWallet,
  };
}
