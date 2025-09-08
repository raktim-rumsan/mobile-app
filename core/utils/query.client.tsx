// import { useRumsanAppStore } from '@rumsan/ui/stores/app.store';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
// import { showToastError } from './toast.provider';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Check for authentication errors and redirect to lock screen
      const statusCode = error?.response?.status;
      if (statusCode === 401) {
        router.replace('/lock');
        return;
      }

      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      const queryKey = query.queryKey;
      const { name, errorMsg } = query.options.meta || {};

      // const isDebugMode = useRumsanAppStore.getState().isDebugMode;
      // const debugInfo = isDebugMode
      //   ? `\n\nDebug Info:\n${JSON.stringify(
      //       error?.response?.data || error,
      //       null,
      //       2,
      //     )}`
      //   : '';

      // showToastError(
      //   `${name ? `Error: ${name}` : 'Error'}`,
      //   `${errorMsg || errorMessage}\n\n ref:[${queryKey}]${debugInfo}`,
      // );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      // Check for authentication errors and redirect to lock screen
      const statusCode = error?.response?.status;
      if (statusCode === 401) {
        router.replace('/lock');
        return;
      }

      const errorMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      const mutationKey = mutation.options.mutationKey;
      const { name, errorMsg } = mutation.options.meta || {};

      // const isDebugMode = useRumsanAppStore.getState().isDebugMode;
      // const debugInfo = isDebugMode
      //   ? `\n\nDebug Info:\n${JSON.stringify(
      //       error?.response?.data || error,
      //       null,
      //       2,
      //     )}`
      //   : '';

      // showToastError(
      //   `${name ? `Error: ${name}` : 'Error'}`,
      //   `${errorMsg || errorMessage}\n\n ref:[${mutationKey}]${debugInfo}`,
      // );
    },
  }),
});
