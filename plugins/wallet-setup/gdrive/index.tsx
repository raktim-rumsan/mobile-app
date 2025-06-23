import AsyncStorage from '@react-native-async-storage/async-storage';
import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import { IWalletSetup } from '../../../types/wallet-setup.interface';
import WalletCreate from './create';
import WalletSetupProgress from './progress';
import WalletRestore from './restore';

export class GdriveWalletSetup implements IWalletSetup {
  localStorageKey = '@wallet';
  private _wallet: Wallet | null = null;
  CreateUI = WalletCreate;
  RestoreUI = WalletRestore;
  SetupUI = WalletSetupProgress;

  logout = async () => {
    await AsyncStorage.removeItem('@user');
  };

  storeWallet = async (wallet: HDNodeWallet | Wallet) => {
    await AsyncStorage.setItem(
      this.localStorageKey,
      JSON.stringify({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: 'mnemonic' in wallet ? wallet.mnemonic : undefined,
      }),
    );
  };

  getStoredWallet = async (): Promise<{
    wallet: Wallet;
    mnemonic: Mnemonic | undefined;
  } | null> => {
    const walletData = await AsyncStorage.getItem(this.localStorageKey);
    if (!walletData) return null;

    const { privateKey, mnemonic } = JSON.parse(walletData);
    return {
      wallet: new Wallet(privateKey),
      mnemonic: mnemonic ? (mnemonic as Mnemonic) : undefined,
    };
  };

  removeStoredWallet = async () => {
    await AsyncStorage.removeItem(this.localStorageKey);
  };
}
