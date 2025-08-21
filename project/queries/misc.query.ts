import { queryClient } from '@/core/utils/query.client';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '../services';
import { LookupData } from '../types/misc.type';

const selectOptionsData = <T extends keyof LookupData>(
  data: LookupData | undefined,
) => {
  const accounts =
    data?.accounts.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const categories =
    data?.categories.map((item) => ({
      ...item,
      label: item.group + ' - ' + item.name,
      value: item.cuid,
    })) || [];

  const projects =
    data?.projects.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const users =
    data?.users.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const departments =
    data?.departments.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const clients =
    data?.clients.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  //if (!data) return undefined; // Explicitly return undefined when data is not available
  return {
    accounts,
    categories,
    projects,
    users,
    departments,
    clients,
  };
};

type LookupListResult = {
  data: LookupData;
  selectData: ReturnType<typeof selectOptionsData>;
  lookupByCuid: (
    group: keyof LookupData,
    cuid: string,
  ) => LookupData[keyof LookupData] | undefined;
};

export const useLookupList = () => {
  return useQuery(
    {
      queryKey: ['lookup_list'],
      queryFn: async () => {
        const services = await getServices();
        const { data } = await services.Misc.getLookupData();
        return {
          data,
          selectData: selectOptionsData(data),
          lookupByCuid: (group: keyof LookupData, cuid: string) =>
            data ? data[group]?.find((item) => item.cuid === cuid) : null,
        };
      },
      staleTime: Infinity, // Data will never become stale automatically
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch when reconnecting
    },
    queryClient,
  );
};
