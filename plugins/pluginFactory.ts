import { iAppServicePlugin } from '../core/types/iAppServicePlugin';
import { iHostService } from '../core/types/iHostService';
import { iWalletPlugin } from '../core/types/iWalletPlugin';
import { useRamanService } from './app-service/raman';
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
