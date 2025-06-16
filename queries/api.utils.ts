// import { useWallet } from '@/context/WalletContext';
// import { getServerInfo } from '@/utils/storage.utils';
// import { ApiClient } from '@rumsan/raman/clients';
// import { QueryClient } from '@tanstack/react-query';

// const fallbackQueryClient = new QueryClient();
// export function useRemoteClient() {
//   const { accessToken, clientId } = useWallet();

//   const apiClient = async () => {
//     const serverInfo = await getServerInfo();
//     return new ApiClient({
//       baseURL: serverInfo?.url || process.env.EXPO_PUBLIC_SERVER_URL,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'rs-client-id': clientId,
//       },
//     });
//   };

//   return {
//     apiClient,
//     queryClient: fallbackQueryClient,
//   };
// }
