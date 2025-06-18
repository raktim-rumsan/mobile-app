import { AxiosHeaderValue, AxiosInstance } from 'axios';

export interface IRumsanClient {
  apiClient: AxiosInstance;

  accessToken: string;
  appId: string;
  clientId: string;
  url: string;
  headers: { [key: string]: AxiosHeaderValue };

  getHeaders(name: string): AxiosHeaderValue | undefined;

  setAccessToken(token: string): void;
  setAppId(appId: string): void;
  setClientId(clientId: string): void;
  setUrl(url: string): void;
  setHeaders(headers: { [key: string]: AxiosHeaderValue }): void;
}
