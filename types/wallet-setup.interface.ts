import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import React from 'react';

export interface IWalletSetup {
  localStorageKey: string;
  CreateUI: (props: {
    onWalletReady: (wallet: HDNodeWallet | Wallet) => void;
    accessToken: string;
    folderId: string;
  }) => React.JSX.Element;

  RestoreUI: (props: {
    onWalletReady: (wallet: HDNodeWallet | Wallet) => void;
    onNewWallet: (archiveFileName?: string) => void;
    accessToken: string;
    folderId: string;
  }) => React.JSX.Element;

  SetupUI: (props: {
    progressLog: { title: string; isError?: boolean }[];
  }) => React.JSX.Element;

  storeWallet: (wallet: HDNodeWallet | Wallet) => Promise<void>;
  getStoredWallet: () => Promise<{
    wallet: Wallet;
    mnemonic: Mnemonic | undefined;
  } | null>;
  removeStoredWallet: () => Promise<void>;
}
