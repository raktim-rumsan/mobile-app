import { setStoredAccessToken } from '@/utils/storage.utils';
import { Wallet } from 'ethers';
import { createContext, ReactNode, useContext, useState } from 'react';

// Create a context to hold text and setText
const AppContext = createContext<
  | {
      wallet?: Wallet | null;
      setWallet: (newWallet: Wallet | null) => void;
      clientId?: string | null;
      setClientId: (clientId: string | null) => void;
      accessToken?: string | null;
      setAccessToken: (token: string | null) => void;
      throwError: (message: string) => void;
    }
  | undefined
>(undefined);

// Custom hook for easier access to context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Create a provider to wrap the parent component
export function AppProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const updateAccessToken = (token: string | null) => {
    setStoredAccessToken(token);
    setAccessToken(token);
  };

  const throwError = (message: string) => {
    console.log(message);
  };

  return (
    <AppContext.Provider
      value={{
        wallet,
        setWallet,
        accessToken,
        setAccessToken: updateAccessToken,
        clientId,
        setClientId,
        throwError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
