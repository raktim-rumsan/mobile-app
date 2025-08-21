import { queryClient } from '@/core/utils/query.client';
import { getServices } from '@/project/services';
import { Invoice } from '@/project/types/invoice.type';
import { PaginationQuery } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';

export const useReceiptList = (
  pageQuery: PaginationQuery,
  options = {},
): UseQueryResult<
  {
    data: Invoice[] | null;
    meta: any;
  },
  Error
> => {
  return useQuery(
    {
      queryKey: ['invoice_list', JSON.stringify(pageQuery)],
      queryFn: async () => {
        const services = await getServices();
        const { response } = (await services?.Receipt.myReceipts(
          pageQuery,
        )) as FormattedResponse<Invoice[]>;
        return {
          data: response.data,
          meta: response.meta,
        };
      },
      ...options,
    },
    queryClient,
  );
};

export const useGetInvoice = (
  id: string,
): UseQueryResult<Invoice | null, Error> => {
  return useQuery(
    {
      queryKey: ['invoice_get', id],
      queryFn: async () => {
        const services = await getServices();
        const { response } = (await services?.Receipt.get(
          id,
        )) as FormattedResponse<Invoice>;
        return response.data;
      },
      enabled: !!id,
    },
    queryClient,
  );
};

export const useCreateInvoice = () => {
  return useMutation(
    {
      mutationFn: async (payload: any) => {
        const services = await getServices();
        const { response } = (await services?.Receipt.create(
          payload,
        )) as FormattedResponse<Invoice>;
        if (!response.data) {
          throw new Error('Failed to create invoice');
        }
        return response.data;
      },
      onSuccess: (newInvoice: Invoice) => {
        // Invalidate and refetch invoice list
        queryClient.invalidateQueries({ queryKey: ['invoice_list'] });
        // Add the new invoice to cache
        if (newInvoice) {
          queryClient.setQueryData(
            ['invoice_get', newInvoice.cuid],
            newInvoice,
          );
        }
      },
    },
    queryClient,
  );
};

export const useUpdateInvoice = () => {
  return useMutation(
    {
      mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
        const services = await getServices();
        const { response } = (await services?.Receipt.update(
          id,
          payload,
        )) as FormattedResponse<Invoice>;
        if (!response.data) {
          throw new Error('Failed to update invoice');
        }
        return response.data;
      },
      onSuccess: (updatedInvoice: Invoice) => {
        // Invalidate and refetch invoice list
        queryClient.invalidateQueries({ queryKey: ['invoice_list'] });
        // Update the specific invoice in cache
        if (updatedInvoice) {
          queryClient.setQueryData(
            ['invoice_get', updatedInvoice.cuid],
            updatedInvoice,
          );
        }
      },
    },
    queryClient,
  );
};

// export const useAddInvoice = () => {
//   const { apiClient, queryClient } = useRemoteClient();

//   return useMutation(
//     {
//       mutationFn: async (payload: any) => {
//         const { data } = await apiClient.Invoice.create(payload, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });

//         return data;
//       },
//       onSuccess: (newExpense) => {
//         queryClient?.setQueryData<Invoice[]>(
//           ['invoice_list'],
//           (oldData = []) => {
//             return [newExpense, ...oldData];
//           },
//         );
//       },
//     },
//     queryClient,
//   );
// };
