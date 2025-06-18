import { IRumsanClient } from '../types/rumsanClient.types';
import { AppClient } from './app.client';
import { AuthClient } from './auth.client';
import { RoleClient } from './role.client';
import { SettingsClient } from './setting.client';
import { UserClient } from './user.client';

import axios, {
  AxiosHeaderValue,
  AxiosInstance,
  CreateAxiosDefaults,
  HeadersDefaults,
} from 'axios';

export class RumsanClient implements IRumsanClient {
  public apiClient: AxiosInstance;

  constructor(config: CreateAxiosDefaults) {
    this.apiClient = axios.create(config);
  }

  public get accessToken() {
    return this.apiClient.defaults.headers['Authorization'] as string;
  }
  public set accessToken(token: string) {
    this.apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  public get appId() {
    return this.apiClient.defaults.headers['rs-app-id'] as string;
  }

  public set appId(appId: string) {
    this.apiClient.defaults.headers['rs-app-id'] = appId;
  }

  public get clientId() {
    return this.apiClient.defaults.headers['rs-client-id'] as string;
  }

  public set clientId(clientId: string) {
    this.apiClient.defaults.headers['rs-client-id'] = clientId;
  }

  public get url() {
    return this.apiClient.defaults.baseURL as string;
  }

  public set url(url: string) {
    this.apiClient.defaults.baseURL = url;
  }

  public set headers(headers: { [key: string]: AxiosHeaderValue }) {
    this.apiClient.defaults.headers = headers as HeadersDefaults & {
      [key: string]: AxiosHeaderValue;
    };
  }

  public getHeaders(name: string) {
    return this.apiClient.defaults.headers[name];
  }

  public setAccessToken(token: string) {
    this.apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  public setAppId(appId: string) {
    this.apiClient.defaults.headers['rs-app-id'] = appId;
  }

  public setClientId(clientId: string) {
    this.apiClient.defaults.headers['rs-client-id'] = clientId;
  }

  public setUrl(url: string) {
    this.apiClient.defaults.baseURL = url;
  }

  public setHeaders(headers: { [key: string]: AxiosHeaderValue }) {
    this.apiClient.defaults.headers = headers as HeadersDefaults & {
      [key: string]: AxiosHeaderValue;
    };
  }

  public get App() {
    return new AppClient(this.apiClient);
  }

  public get Auth() {
    return new AuthClient(this.apiClient);
  }

  public get Role() {
    return new RoleClient(this.apiClient);
  }

  public get Setting() {
    return new SettingsClient(this.apiClient);
  }

  public get User() {
    return new UserClient(this.apiClient);
  }
}

export const RumsanService = new RumsanClient({});
