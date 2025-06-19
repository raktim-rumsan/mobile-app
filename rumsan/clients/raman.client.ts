import { AxiosInstance } from 'axios';

export class RamanClient {
  private _client: AxiosInstance;
  private _prefix = '';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }
  // async getChallenge(data: CreateChallenge, config?: AxiosRequestConfig) {
  //   const response = await this._client.post(
  //     `${this._prefix}/challenge`,
  //     data,
  //     config,
  //   );
  //   return formatResponse<AuthResponse>(response);
  // }
}
