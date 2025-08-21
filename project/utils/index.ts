import { iHostService } from '@/core/types/iHostService';

export const AppStorage = (setup: iHostService) => ({
  set: async (name: string, value: Record<string, any> | string) => {
    await setup.storeData(name, value, 'appService');
  },
  get: async (name: string) => {
    return await setup.getData(name, 'appService');
  },
});
