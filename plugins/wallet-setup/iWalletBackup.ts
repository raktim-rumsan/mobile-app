import { HDNodeWallet } from 'ethers';

export type loggerType = (message: string, isError?: boolean) => void;

export interface iWalletBackup {
  signIn: () => Promise<void>;
  signOut: () => void;
  getWalletBackupData: (options?: {
    log?: loggerType;
  }) => Promise<string | null>;
  createAndBackupWallet: (
    password: string,
    options?: {
      log: loggerType;
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
