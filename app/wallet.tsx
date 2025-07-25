import WalletSetupScreen from '@/screens/setup/wallet';
import React from 'react';

export default function SetupWalletPage() {
  // const WalletSetup = useMemo(() => new GdriveWalletSetup(), []);
  // React.useEffect(() => {
  //   const checkWallet = async () => {
  //     const wallet = await setup.getWallet();
  //     if (wallet) {
  //       router.replace('/home');
  //     }
  //   };
  //   checkWallet();
  // }, []);

  return <WalletSetupScreen />;
}
