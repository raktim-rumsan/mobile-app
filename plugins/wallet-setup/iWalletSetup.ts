import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';

export interface iWalletSetup {
  storeData: (
    name: string,
    value: Record<string, any> | string,
    prefix?: string,
  ) => Promise<void>;
  removeData: (key: string, prefix?: string) => Promise<void>;
  getData: (
    key: string,
    prefix?: string,
  ) => Promise<Record<string, any> | null>;

  navigateToWalletSetup: () => void;
  setWallet: (wallet: HDNodeWallet | Wallet) => Promise<void>;
  getWallet: () => Promise<{
    wallet: Wallet;
    mnemonic: Mnemonic | undefined;
  } | null>;
  removeWallet: () => Promise<void>;
}
