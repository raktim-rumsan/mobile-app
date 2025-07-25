import { useGoogleDriveSetup } from './google';
import { iWalletBackup } from './iWalletBackup';
import { iWalletSetup } from './iWalletSetup';

type WalletBackupHook = () => iWalletBackup;

export const getWalletBackupProvider = (
  setup: iWalletSetup,
): WalletBackupHook => {
  const provider =
    process.env.EXPO_PUBLIC_WALLET_BACKUP_PROVIDER?.trim().toLowerCase();
  switch (provider) {
    case 'google':
      return () => useGoogleDriveSetup(setup);
    default:
      throw new Error(
        `Unsupported BACKUP_PROVIDER: ${process.env.EXPO_PUBLIC_WALLET_BACKUP_PROVIDER}`,
      );
  }
};
