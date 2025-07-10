import { getServerInfo } from "@/utils/storage.utils";
import { useMutation } from "@tanstack/react-query";
import { useRemoteClient } from "./api.utils";

export const useAddInvoice = () => {
  const { apiClient, queryClient } = useRemoteClient();

  return useMutation(
    {
      mutationFn: async (payload: any) => {
       const serverInfo = await getServerInfo();
              const token = serverInfo?.accessToken;
              const client = await apiClient();             
              const { data } = await client.Receipt.create(payload,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return data;
            },
      onSuccess: () => {
        console.log("Invoice added successfully");
      },
    },
    queryClient,
  );
};