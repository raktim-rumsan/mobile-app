import { LoadingScreen } from '@/components/LoadingScreen';
import LandingScreen from '@/core/screens';
import { hostService } from '@/core/screens/hostService';
import WalletSetupScreen from '@/core/screens/wallet';
import { Mnemonic, Wallet } from 'ethers';
import React, { useEffect, useState } from 'react';

interface WalletData {
  wallet: Wallet;
  mnemonic?: Mnemonic;
}

export default function LandingPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      const walletData = await hostService.getWallet();
      setWallet(walletData);
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
