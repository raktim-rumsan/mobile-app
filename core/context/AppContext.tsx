import { Wallet } from 'ethers';
import React, { createContext, ReactNode, useContext, useState } from 'react';

const AppContext = createContext<
  | {
      wallet?: Wallet | null;
      setWallet: (newWallet: Wallet | null) => void;
      setCache: (group: string, key: string, data: Record<string, any>) => void;
      getCache: (group: string, key: string) => Record<string, any> | undefined;
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
  const [cacheData, setCacheData] = useState<any>({});

  const setCache = (group: string, key: string, data: Record<string, any>) => {
    setCacheData((prev: Record<string, any>) => ({
      ...prev,
      [group + key]: data,
    }));
  };

  const getCache = (group: string, key: string): Record<string, any> => {
    return cacheData[group + key];
  };

  const throwError = (message: string) => {
    console.log(message);
  };

  return (
    <AppContext.Provider
      value={{
        wallet,
        setWallet,
        setCache,
        getCache,
        throwError,
        isLocked,
        setIsLocked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
