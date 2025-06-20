import { useApp } from '@/context/AppContext';
import { getServerInfo } from '@/utils/storage.utils';
import { RumsanClient } from '@rumsan/sdk/clients';
import { QueryClient } from '@tanstack/react-query';

const fallbackQueryClient = new QueryClient();
export function useRemoteClient() {
  const { accessToken, clientId } = useApp();

  const apiClient = async () => {
    const serverInfo = await getServerInfo();
    return new RumsanClient({
      baseURL: serverInfo?.url || process.env.EXPO_PUBLIC_SERVER_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'rs-client-id': clientId,
      },
    });
  };

  return {
    apiClient,
    queryClient: fallbackQueryClient,
  };
}
