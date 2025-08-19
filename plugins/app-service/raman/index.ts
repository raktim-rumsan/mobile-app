import { iAppServicePlugin } from '@/core/types/iAppServicePlugin';
import { iHostService } from '@/core/types/iHostService';
import { RumsanClient } from '@/rumsan/clients';
import { Wallet } from 'ethers';
import React, { useState } from 'react';
import { _utils } from './utils';

export function useRamanService(setup: iHostService): iAppServicePlugin {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const _store = _utils.storage(setup);

  const getAccessToken = React.useCallback(
    async (wallet: Wallet): Promise<boolean> => {
      setIsLoading(true);
      const serverInfo = { url: null, clientId: '1111111' }; //await getServerInfo();
      const baseURL = serverInfo?.url || process.env.EXPO_PUBLIC_SERVER_URL;
      const rumsanClient = new RumsanClient({
        baseURL,
      });

      try {
        const { data: ChallengeData } = await rumsanClient.Auth.getChallenge({
          clientId: serverInfo?.clientId || undefined,
        });
        const { challenge, clientId } = ChallengeData;
        const signature = await wallet.signMessage(challenge);
        const { data } = await rumsanClient.Auth.walletLogin({
          challenge,
          signature: signature as `0x${string}`,
        });
        if (data.accessToken) {
          _store.set('token', data.accessToken);
          if (data.currentUser) {
            _store.set('user', data.currentUser);
          }
          // router.replace('/');
        } else {
          throw new Error('Failed to retrieve access token. Please try again.');
        }
        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        throw new Error(
          `An error occurred while logging in. Please try again. [${
            err && typeof err === 'object' && 'message' in err
              ? (err as { message: string }).message
              : String(err)
          }]`,
        );
      }
    },
    [],
  );

  const onUnlock = async () => {
    return getAccessToken(
      (await setup.getWallet('TODO_temp')) as unknown as Wallet,
    );
  };

  //TODO: Implement this function to check if the session is valid
  const isSessionValid = async () => {
    const token = (await _store.get('token')) as string | null;
    return typeof token === 'string' && token.length > 0;
  };

  return {
    onUnlock,
    error,
    isLoading,
    isSessionValid,
  };
}
