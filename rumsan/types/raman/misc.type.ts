export type LookupData = {
  departments: { name: string; cuid: string; meta?: Record<string, any> }[];
  categories: {
    name: string;
    cuid: string;
    group: string;
    meta?: Record<string, any>;
  }[];
  projects: { name: string; cuid: string; meta?: Record<string, any> }[];
  accounts: { name: string; cuid: string; meta?: Record<string, any> }[];
  users: { name: string; cuid: string; meta?: Record<string, any> }[];
  clients: { name: string; cuid: string; meta?: Record<string, any> }[];
};
