import { HDNodeWallet } from 'ethers';
import { TLog } from './iHostService';

export interface iWalletPlugin {
  signIn: () => Promise<void>;
  signOut: () => void;
  getWalletBackupData: (options?: { log?: TLog }) => Promise<string | null>;
  createAndBackupWallet: (
    password: string,
    options?: {
      log: TLog;
    },
  ) => Promise<HDNodeWallet | undefined>;
  getEncryptedWalletFromBackup: () => Promise<{
    fileId: string;
    content: string;
  } | null>;

  archiveEncryptedWallet: (archiveName: string) => Promise<string | null>;

  getAuthToken: () => Promise<string | null>;
  setAuthToken: (token: string | null) => void;
  setBackupFile: (file: File | null) => void;
  isLoading: boolean;
  error: Error | null;
}
