import { LoadingScreen } from '@/components/LoadingScreen';
import { useApp } from '@/context/AppContext';
import { getBackupWalletInfo } from '@/plugins/wallet-setup/gdrive1/utils';
import { iWalletSetup } from '@/plugins/wallet-setup/iWalletSetup';
import {
  checkGDriveWritePermission,
  getAccessToken,
  isAccessTokenValid,
} from '@/utils/gdrive.utils';
import { HDNodeWallet, Wallet } from 'ethers';
import { router } from 'expo-router';
import React, { useCallback } from 'react';

export default function WalletSetupScreen(props: {
  WalletSetup: iWalletSetup;
}) {
  const { WalletSetup } = props;
  const [progressLog, setProgressLog] = React.useState<
    { title: string; isError: boolean }[]
  >([]);
  const [step, setStep] = React.useState('init');
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const { setWallet } = useApp();

  const addProgressLog = React.useCallback(
    (title: string, isError: boolean = false) => {
      title = title + '...';
      //emitEvent('registrationStep', { title, completed });
      setProgressLog((prevLog) => [...prevLog, { title, isError }]);
    },
    [],
  );

  const setupWallet = React.useCallback(async () => {
    let storedWallet = await WalletSetup.getStoredWallet();
    if (storedWallet) {
      setWallet(storedWallet.wallet);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/login');
      return;
    }
    setStep('setup');

    const accessToken = await getAccessToken();
    if (!accessToken) {
      router.replace('/');
      return false;
    }
    setAccessToken(accessToken);

    // Check if the access token is valid
    const isValid = await isAccessTokenValid(accessToken);
    console.log('Access token valid:', isValid);
    if (!isValid) {
      console.warn('Access token is invalid, logging out');
      await WalletSetup.logout();
      router.replace('/');
      return false;
    }

    // Check if the user has granted write permission to Google Drive
    const hasPermission = await checkGDriveWritePermission(accessToken);
    addProgressLog('Checking Google Drive access', !hasPermission);
    if (!hasPermission) return false;

    const { folderId, walletFileId } = await getBackupWalletInfo(
      accessToken,
      addProgressLog,
    );
    if (folderId) {
      setFolderId(folderId);
    }

    if (!walletFileId) {
      setStep('wallet-create');
    } else {
      setStep('wallet-restore');
    }
  }, [addProgressLog]);

  React.useEffect(() => {
    setProgressLog([]);

    setupWallet();
    return () => {};
  }, [setupWallet]);

  const onWalletReady = useCallback(
    async (_wallet: HDNodeWallet | Wallet) => {
      WalletSetup.storeWallet(_wallet);

      let wallet: Wallet;
      if (_wallet instanceof HDNodeWallet) {
        wallet = new Wallet(_wallet.privateKey);
      } else {
        wallet = _wallet;
      }
      setWallet(wallet);
      router.replace('/login');
      return;
    },
    [WalletSetup, setWallet],
  );

  const onNewWallet = useCallback(
    (archiveFileName?: string) => {
      if (!archiveFileName) {
        addProgressLog(`Existing wallet archived as ${archiveFileName}`, false);
      }
      setStep('wallet-create');
    },
    [addProgressLog],
  );

  return (
    <>
      {step === 'init' && <LoadingScreen message="Loading Wallet" />}
      {step === 'setup' && <WalletSetup.SetupUI progressLog={progressLog} />}
      {step === 'wallet-create' && accessToken && folderId && (
        <WalletSetup.CreateUI
          onWalletReady={onWalletReady}
          accessToken={accessToken}
          folderId={folderId}
        />
      )}
      {step === 'wallet-restore' && accessToken && folderId && (
        <WalletSetup.RestoreUI
          onWalletReady={onWalletReady}
          onNewWallet={onNewWallet}
          accessToken={accessToken}
          folderId={folderId}
        />
      )}
    </>
  );
}
