import { GdriveWalletSetup } from '@/plugins/wallet-setup/gdrive';
import WalletSetupScreen from '@/screens/setup/wallet';
import { useMemo } from 'react';

export default function SetupWalletPage() {
  const WalletSetup = useMemo(() => new GdriveWalletSetup(), []);

  return <WalletSetupScreen WalletSetup={WalletSetup} />;
}
