import LandingScreen from '@/screens/setup';
import React from 'react';

export default function LandingPage() {
  // React.useEffect(() => {
  //   const checkWallet = async () => {
  //     const wallet = await setup.getWallet();
  //     if (wallet) {
  //       router.replace('/home');
  //     }
  //   };
  //   checkWallet();
  // }, []);

  return <LandingScreen />;
}
