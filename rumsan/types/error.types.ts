export type RSErrorInfo = {
  name: string;
  message: string;
  type?: string;
  httpCode: number;
  srcModule?: string;
  meta?: any;
};
