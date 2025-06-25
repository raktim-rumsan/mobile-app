import { PaginationQuery } from '@/rumsan/types';
import { TimeOffRequest } from '@/rumsan/types/raman/timeOffRequest.type';
import { getServerInfo } from '@/utils/storage.utils';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useRemoteClient } from './api.utils';

const booleanFilters = (filters: any, field: string) => {
  if (!filters) return filters;
  let filterField = filters[field];
  if (filterField) {
    if (typeof filterField === 'string') filterField = [filterField];

    if (filterField.indexOf('true') > -1 && filterField.indexOf('false') > -1)
      delete filters[field];
    else if (filterField.indexOf('true') > -1) filters[field] = true;
    else filters[field] = false;
  }
  return filters;
};

export const useTimeOffRequestList = (
  pageQuery: PaginationQuery,
): UseQueryResult<{ data: TimeOffRequest[] | null; meta: any }, Error> => {
  const { apiClient, queryClient } = useRemoteClient();
  let { pagination, filters } = pageQuery;
  return useQuery(
    {
      queryKey: ['timeoffreq_list', { ...pagination, ...filters }],
      queryFn: async () => {
        filters = booleanFilters(filters, 'isPaid');
        const client = await apiClient();
        const { response } = await client.Raman.search(
          pagination,
          filters,
        );
        return {
          data: response.data,
          meta: response.meta,
        };
      },
    },
    queryClient,
  );
};



export const useTimeOffRequestAdd = () => {
  const { apiClient, queryClient } = useRemoteClient();
  

  return useMutation(
    {
      mutationFn: async (payload: any) => {
         const serverInfo = await getServerInfo();
        const token = serverInfo?.accessToken;
        console.log('useTimeOffRequestAdd payload', token);
        const client = await apiClient();             
        const { data } = await client.Raman.create(payload,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return data;
      },

      onSuccess: () => {
        queryClient?.invalidateQueries({
          queryKey: ['timeoffreq_list'],
        });
      },
    },
    queryClient,
  );
};


export const useTimeOffById = (
  timeoffId: string,
): UseQueryResult<TimeOffRequest, Error> => {
  const { apiClient, queryClient } = useRemoteClient();
  return useQuery(
    {
      queryKey: ['timeoff_get', timeoffId],
      queryFn: async () => {
          const serverInfo = await getServerInfo();
        const token = serverInfo?.accessToken;
                const client = await apiClient();             

        const { data } = await client.Raman.findOne(timeoffId,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return data;
      },
      enabled: !!timeoffId,
    },
    queryClient,
  );
};

export const useTimeOffByUserId = (
  userId: string,
  query: any
): UseQueryResult<TimeOffRequest[], Error> => {
  const { apiClient, queryClient } = useRemoteClient();
  return useQuery(
    {
      queryKey: ['timeoff_by_user', userId, query],
      queryFn: async () => {
        const serverInfo = await getServerInfo();
        const token = serverInfo?.accessToken;
        console.log(token,'toekn')
        const client = await apiClient();
        const response = await client.Raman.getTimeOffByUserId(userId, {
          params: query,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response?.data || [];
      },
      enabled: !!userId,
    },
    queryClient,
  );
};

