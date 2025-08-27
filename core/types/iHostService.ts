import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';

export * from '@/core/utils/error';
export type TLog = (message: string, isError?: boolean) => void;

export interface iHostService {
  storeData: (
    name: string,
    value: Record<string, any> | string,
    prefix: string,
  ) => Promise<void>;
  removeData: (key: string, prefix: string) => Promise<void>;
  getData: (key: string, prefix: string) => Promise<Record<string, any> | null>;

  setCache: (group: string, key: string, data: Record<string, any>) => void;
  getCache: (group: string, key: string) => Record<string, any> | undefined;

  navigateToWalletSetup: () => void;
  setWallet: (wallet: HDNodeWallet | Wallet) => Promise<void>;
  getWallet: (passCode: string) => Promise<Wallet | null>;
  getMnemonic: (passCode: string) => Promise<Mnemonic | null>;
  removeWallet: () => Promise<void>;
}
