import { iHostService } from '@/core/types/iHostService';
import storageUtil from '@/core/utils/store.utils';
import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import { router } from 'expo-router';

export const hostService: iHostService = {
  storeData: async (
    name: string,
    value: Record<string, any> | string,
    prefix: string,
  ) => {
    await storageUtil.setItem(`${prefix}_${name}`, JSON.stringify(value));
  },
  getData: async (name: string, prefix: string) => {
    const data = (await storageUtil.getItem(`${prefix}_${name}`)) || '{}';
    return JSON.parse(data);
  },
  removeData: async (name: string, prefix: string) => {
    await storageUtil.setItem(`${prefix}_${name}`, '');
  },
  navigateToWalletSetup: () => {
    router.push('/wallet');
  },
  getWallet: async (passCode: string) => {
    const walletData = await storageUtil.getItem('wallet');
    if (!walletData) return null;

    const { privateKey } = JSON.parse(walletData);
    return new Wallet(privateKey);
  },
  getMnemonic: async (passCode: string) => {
    const walletData = await storageUtil.getItem('wallet');
    if (!walletData) return null;

    const { mnemonic } = JSON.parse(walletData);
    return mnemonic ? (mnemonic as Mnemonic) : null;
  },
  setWallet: async (wallet: HDNodeWallet | Wallet) => {
    await storageUtil.setItem(
      'wallet',
      JSON.stringify({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: 'mnemonic' in wallet ? wallet.mnemonic : undefined,
      }),
    );
  },
  removeWallet: async () => {
    await storageUtil.setItem('wallet', '');
  },
};
