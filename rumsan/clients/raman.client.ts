import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Pagination } from '../types';
import { TimeOff } from '../types/raman/timeOff.type';
import { TimeOffRequest } from '../types/raman/timeOffRequest.type';
import { formatResponse } from '../utils';

export class RamanClient {
  private _client: AxiosInstance;
  private _prefix = 'timeoff';

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

   async list(data: Pagination, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}`, {
      params: data,
      ...config,
    });
    return formatResponse<TimeOff[]>(response);
  }  async search(
    params?: Pagination,
    filters?: any,
    config?: AxiosRequestConfig,
  ) {
    const response = await this._client.post(
      `${this._prefix}/search`,
      filters,
      {
        params,
        ...config,
      },
    );
    return formatResponse<TimeOffRequest[]>(response);
  }
  async create(data: TimeOffRequest, config?: AxiosRequestConfig) {
    const response = await this._client.post(`${this._prefix}/request`, data, config);
    return formatResponse<TimeOffRequest>(response);
  }

   async findOne(cuid: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/${cuid}`, config);
    return formatResponse<TimeOffRequest>(response);
  }

   async getTimeOffByUserId(userId: string, config?: AxiosRequestConfig) {
    // Calls /timeoff/users/:userId with query params
    const response = await this._client.get(`${this._prefix}/users/${userId}`, config);
    return response.data; // Assumes backend returns { data: TimeOffRequest[], meta: any }
  }

  async delete(cuid: string, config?: AxiosRequestConfig) {
    const response = await this._client.delete(`${this._prefix}/request/${cuid}`, config);
    return response.data; 
  }
}
