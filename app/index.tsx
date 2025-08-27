// Import polyfills first
import '@/core/utils/polyfills';

import { LoadingScreen } from '@/components/LoadingScreen';
import LandingScreen from '@/core/screens';
import WalletSetupScreen from '@/core/screens/wallet';
import { useHostService } from '@/core/services/hostService';
import { Mnemonic, Wallet } from 'ethers';
import React, { useEffect, useState } from 'react';

interface WalletData {
  wallet: Wallet;
  mnemonic?: Mnemonic;
}

export default function LandingPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const { getWallet } = useHostService();

  useEffect(() => {
    async function fetchWallet() {
      //TODO
      const walletObj = await getWallet('TEMP');
      if (walletObj) {
        setWallet({ wallet: walletObj });
      } else {
        setWallet(null);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
    fetchWallet();
  }, []);

  if (loading) {
    return <LoadingScreen />; // Placeholder while wallet is being fetched
  }

  return wallet ? <WalletSetupScreen /> : <LandingScreen />;
}
