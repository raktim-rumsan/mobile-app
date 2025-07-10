import { LookupData } from '@/rumsan/types/raman/misc.type';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useRemoteClient } from './api.utils';

export const useLookUpList = (): UseQueryResult<LookupData, Error> => {
  const { apiClient, queryClient } = useRemoteClient();

  return useQuery(
    {
      queryKey: ['lookup_list'],
      queryFn: async () => {
        const client = await apiClient();
        const { data } = await client.Misc.getLookupData();
        return data;
      },
      staleTime: Infinity, // Data will never become stale automatically
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch when reconnecting
    },
    queryClient,
  );
};
