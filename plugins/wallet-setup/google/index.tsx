// hooks/useGoogleDriveSetup.ts
import { iHostService, TLog } from '@/plugins/iHostService';
import { iWalletPlugin } from '@/plugins/iWalletPlugin';
import { AuthUser } from '@/utils/middleware';
import {
  AuthError,
  AuthRequestConfig,
  AuthSessionResult,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import React, { useState } from 'react';
import { GoogleApis } from './api.google';

const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/token`,
  revocationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/revoke`,
};

const config: AuthRequestConfig = {
  clientId: 'google',
  scopes: [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive.file',
  ],
  redirectUri: makeRedirectUri(),
};

export function useGoogleDriveSetup(setup: iHostService): iWalletPlugin {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storeData = async (
    name: string,
    value: Record<string, any> | string,
  ) => {
    await setup.storeData(name, value, 'gDrive');
  };

  const getData = async (name: string) => {
    return await setup.getData(name, 'gDrive');
  };

  const signIn = async () => {
    try {
      if (!request) return;
      // const authData = await setup.getData('authData');
      // if (authData && authData.access_token) {
      //   checkToken(authData);
      //   return;
      // }
      const result: AuthSessionResult = await promptAsync();
      if (result.type === 'success') {
        const { code } = result.params;

        const authData = await GoogleApis.getJwtToken(code);
        await storeData('authData', authData);
        // const wallet = Wallet.createRandom();
        // setup.setWallet(wallet);
        setup.navigateToWalletSetup();
      } else if (result.type === 'cancel') {
        alert('Sign in cancelled');
      } else if (result.type === 'error') {
        setError(result.error as AuthError);
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  const getWalletBackupData = async (options?: {
    log?: TLog;
  }): Promise<string | null> => {
    try {
      const authData = await getData('authData');
      if (!authData || !authData.access_token) {
        throw new Error('No access token found. Please sign in first.');
      }
      const { folderId, walletFileId } = await GoogleApis.getBackupWalletInfo(
        authData.access_token,
        options?.log,
      );
      setFolderId(folderId);
      return walletFileId;
      // const folderId = await getBackupFolderId(authData.access_token);
      // if (!folderId) {
      //   throw new Error('No backup folder found');
      // }
      // const walletBackup = await getEncryptedWalletFromBackup(
      //   authData.access_token,
      //   folderId,
      // );
      // return walletBackup ? walletBackup.content : null;
    } catch (e) {
      setError(e as Error);
      return null;
    }
  };

  const createAndBackupWallet = async (
    password: string,
    options?: {
      log: TLog;
    },
  ) => {
    options?.log?.(`Creating and backing up wallet with password: ${password}`);
    const authData = await getData('authData');

    if (!authData || !authData.access_token) {
      throw new Error('No access token found. Please sign in first.');
    }
    if (!folderId) {
      throw new Error(
        'No backup folder ID found. Please get backup folder ID first.',
      );
    }

    const backupWallet = await GoogleApis.createAndBackupWallet(
      authData.access_token,
      password,
      folderId,
      options?.log,
    );

    return backupWallet.wallet;
  };

  const getEncryptedWalletFromBackup = async () => {
    const authData = await getData('authData');

    if (!authData || !authData.access_token) {
      throw new Error('No access token found. Please sign in first.');
    }
    if (!folderId) {
      throw new Error(
        'No backup folder ID found. Please get backup folder ID first.',
      );
    }

    return GoogleApis.getEncryptedWallet(authData.access_token, folderId);
  };

  const archiveEncryptedWallet = async (archiveName: string) => {
    const authData = await getData('authData');

    if (!authData || !authData.access_token) {
      throw new Error('No access token found. Please sign in first.');
    }
    if (!folderId) {
      throw new Error(
        'No backup folder ID found. Please get backup folder ID first.',
      );
    }

    return GoogleApis.archiveEncryptedWallet(
      authData.access_token,
      folderId,
      archiveName,
    );
  };

  const signOut = () => {
    setAuthTokenState(null);
    setBackupFile(null);
  };

  const getAuthToken = async () => {
    const authData = await getData('authData');
    return authData?.access_token || null;
  };

  return {
    signIn,
    getWalletBackupData,
    createAndBackupWallet,
    getEncryptedWalletFromBackup,
    archiveEncryptedWallet,
    signOut,
    getAuthToken,
    setAuthToken: setAuthTokenState,
    setBackupFile,
    error,
    isLoading,
  };
}
