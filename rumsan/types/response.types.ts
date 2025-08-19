export type Response<T> = {
  success: boolean;
  data: T | null;
  code?: string;
  meta?: Record<string, any>;
};
