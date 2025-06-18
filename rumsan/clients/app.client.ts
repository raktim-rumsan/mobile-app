import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { formatResponse } from '../utils/formatResponse.utils';

export class AppClient {
  private _client: AxiosInstance;
  private _prefix = 'app';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }

  async listConstants(name: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(
      `${this._prefix}/constants/${name}`,
      config,
    );
    return formatResponse<any>(response);
  }
}
