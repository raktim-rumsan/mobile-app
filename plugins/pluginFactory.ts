import { useRamanService } from './app-service/raman';
import { iAppServicePlugin } from './iAppServicePlugin';
import { iHostService } from './iHostService';
import { iWalletPlugin } from './iWalletPlugin';
import { useGoogleDriveSetup } from './wallet-setup/google';

type WalletPlugin = () => iWalletPlugin;
//type AppServicePlugin = () => iAppServicePlugin;

export const getWalletBackupProvider = (setup: iHostService): WalletPlugin => {
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

export const useAppServicePlugin = (
  service: iHostService,
): iAppServicePlugin => {
  const AppServicePlugin = useRamanService(service);
  return AppServicePlugin;
};
