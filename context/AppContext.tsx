import { Wallet } from 'ethers';
import React, { createContext, ReactNode, useContext, useState } from 'react';

const AppContext = createContext<
  | {
      wallet?: Wallet | null;
      setWallet: (newWallet: Wallet | null) => void;
      throwError: (message: string) => void;
      isLocked: boolean;
      setIsLocked: (locked: boolean) => void;
    }
  | undefined
>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null | undefined>(undefined);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const throwError = (message: string) => {
    console.log(message);
  };

  return (
    <AppContext.Provider
      value={{
        wallet,
        setWallet,
        throwError,
        isLocked,
        setIsLocked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
