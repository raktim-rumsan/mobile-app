import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Setting } from '../types';
import { formatResponse } from '../utils/formatResponse.utils';

export class SettingsClient {
  private _client: AxiosInstance;
  private _prefix = 'settings';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }

  async list(config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}`, {
      ...config,
      params: {
        ...config?.params,
        page: 1,
        perPage: 1000,
      },
    });
    return formatResponse<Setting[]>(response);
  }

  async create(data: Setting, config?: AxiosRequestConfig) {
    const response = await this._client.post(`${this._prefix}`, data, config);
    return formatResponse<Setting>(response);
  }
  async getByName(name: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/${name}`, config);
    return formatResponse<Setting>(response);
  }

  async update(data: Setting, config?: AxiosRequestConfig) {
    const response = await this._client.patch(
      `${this._prefix}/${data?.name}`,
      data,
      config,
    );
    return formatResponse<Setting>(response);
  }
}
