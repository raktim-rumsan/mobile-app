import { LoadingScreen } from '@/components/LoadingScreen';
import { useApp } from '@/core/context/AppContext';
import { getWalletBackupProvider } from '@/plugins/pluginFactory';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useHostService } from '../services/hostService';
import { AppError } from '../utils/error';
import { truncateAddress } from '../utils/string.utils';
import WalletCreateNew from './create';
import SetupProgress from './progress';
import WalletRestore from './restore';

export default function WalletSetupScreen() {
  const [progressLog, setProgressLog] = React.useState<
    { title: string; isError: boolean }[]
  >([]);
  const hostService = useHostService();
  const [step, setStep] = React.useState('init');
  const [address, setAddress] = useState<string | null>(null);
  const [walletFileId, setWalletFileId] = React.useState<string | null>(
    'loading',
  );
  const { setWallet } = useApp();

  const useWalletSetup = getWalletBackupProvider(hostService);
  const walletSetup = useWalletSetup();

  const addProgressLog = React.useCallback(
    (title: string, isError: boolean = false) => {
      title = title + '.';
      setProgressLog((prevLog) => [...prevLog, { title, isError }]);
    },
    [],
  );

  const setupWallet = React.useCallback(async () => {
    const wallet = await hostService.getWallet('TODO_temp');
    if (wallet) {
      setWallet(wallet);
      router.push('/home');
      return;
    }

    setStep('setup');
    addProgressLog('Initializing wallet setup');
    try {
      let fileId = await walletSetup.getWalletBackupData({
        log: addProgressLog,
      });
      if (fileId) {
        addProgressLog('Backup file found: ' + truncateAddress(fileId));
        const _encryptedWallet =
          await walletSetup.getEncryptedWalletFromBackup();
        if (!_encryptedWallet) {
          setWalletFileId(null);
          return;
        }

        try {
          const encryptedWalletJson = JSON.parse(_encryptedWallet.content);
          setAddress(encryptedWalletJson.address);
          addProgressLog(
            'Found Wallet Address: ' +
              truncateAddress(encryptedWalletJson.address),
          );
          setWalletFileId(fileId);
        } catch (error) {
          setWalletFileId(null);
        }
      } else {
        addProgressLog('No wallet backup found. Create a new Wallet');
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        if (error.isAuthenticationError) router.push('/');
      }
      addProgressLog('Error getting wallet backup: ' + error.message, true);
      setWalletFileId(null);
    }
  }, []);

  const createNewWallet = useCallback(
    async (archiveFileName?: string) => {
      setStep('setup');
      if (archiveFileName) {
        setWalletFileId('loading');
        addProgressLog(`Existing wallet archived as ${archiveFileName}`, false);
        await walletSetup.archiveEncryptedWallet(archiveFileName);
        setWalletFileId(null);
        addProgressLog('Create a new Wallet');
      }
    },
    [addProgressLog],
  );

  React.useEffect(() => {
    setProgressLog([]);

    setupWallet();
    return () => {};
  }, [setupWallet]);

  //console.log(await walletSetup.getAuthToken());
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {step === 'init' && <LoadingScreen message="Loading Wallet" />}
      {step === 'setup' && (
        <SetupProgress
          progressLog={progressLog}
          setStep={setStep}
          walletFileId={walletFileId}
        />
      )}
      {step === 'wallet-create' && (
        <WalletCreateNew walletSetup={walletSetup} />
      )}
      {step === 'wallet-restore' && (
        <WalletRestore
          address={address}
          walletSetup={walletSetup}
          createNewWallet={createNewWallet}
        />
      )}
    </SafeAreaView>
  );
}
