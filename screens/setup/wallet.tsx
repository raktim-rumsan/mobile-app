import { LoadingScreen } from '@/components/LoadingScreen';
import { useApp } from '@/context/AppContext';
import { getWalletBackupProvider } from '@/plugins/wallet-setup/walletSetupFactory';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native';
import WalletCreateNew from './create';
import SetupProgress from './progress';
import WalletRestore from './restore';
import { setup } from './setup';

export default function WalletSetupScreen() {
  const [progressLog, setProgressLog] = React.useState<
    { title: string; isError: boolean }[]
  >([]);
  const [step, setStep] = React.useState('init');
  const { setWallet } = useApp();

  const useWalletSetup = getWalletBackupProvider(setup);
  const walletSetup = useWalletSetup();

  const addProgressLog = React.useCallback(
    (title: string, isError: boolean = false) => {
      title = title + '...';
      setProgressLog((prevLog) => [...prevLog, { title, isError }]);
    },
    [],
  );

  const setupWallet = React.useCallback(async () => {
    const wallet = await setup.getWallet();
    if (wallet) {
      router.push('/login');
      return;
    }

    setStep('setup');
    addProgressLog('Initializing wallet setup');
    let walletFileId = await walletSetup.getWalletBackupData({
      log: addProgressLog,
    });

    if (!walletFileId) {
      setStep('wallet-create');
    } else {
      setStep('wallet-restore');
    }
  }, []);

  const createNewWallet = useCallback(
    (archiveFileName?: string) => {
      if (!archiveFileName) {
        addProgressLog(`Existing wallet archived as ${archiveFileName}`, false);
      }
      setStep('wallet-create');
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
      {step === 'setup' && <SetupProgress progressLog={progressLog} />}
      {step === 'wallet-create' && (
        <WalletCreateNew walletSetup={walletSetup} />
      )}
      {step === 'wallet-restore' && (
        <WalletRestore
          walletSetup={walletSetup}
          createNewWallet={createNewWallet}
        />
      )}
    </SafeAreaView>
  );
}
