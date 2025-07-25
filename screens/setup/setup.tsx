import { iWalletSetup } from '@/plugins/wallet-setup/iWalletSetup';
import storageUtil from '@/utils/store.utils';
import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import { router } from 'expo-router';

export const setup: iWalletSetup = {
  storeData: async (
    name: string,
    value: Record<string, any> | string,
    prefix?: string,
  ) => {
    prefix = prefix ? `backup_${prefix}_` : 'backup_';
    await storageUtil.setItem(`${prefix}${name}`, JSON.stringify(value));
  },
  getData: async (key: string, prefix?: string) => {
    prefix = prefix ? `backup_${prefix}_` : 'backup_';
    const data = (await storageUtil.getItem(`${prefix}${key}`)) || '{}';
    return JSON.parse(data);
  },
  removeData: async (key: string, prefix?: string) => {
    prefix = prefix ? `backup_${prefix}_` : 'backup_';
    await storageUtil.setItem(`${prefix}${key}`, '');
  },
  navigateToWalletSetup: () => {
    router.push('/wallet');
  },
  getWallet: async () => {
    const walletData = await storageUtil.getItem('wallet');
    if (!walletData) return null;

    const { privateKey, mnemonic } = JSON.parse(walletData);
    return {
      wallet: new Wallet(privateKey),
      mnemonic: mnemonic ? (mnemonic as Mnemonic) : undefined,
    };
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
