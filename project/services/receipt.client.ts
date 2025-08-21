import { PaginationQuery } from '@/rumsan/types';
import { formatResponse } from '@rumsan/sdk/utils/formatResponse.utils';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Invoice } from '../types/invoice.type';

export class ReceiptClient {
  private _client: AxiosInstance;
  private _prefix = 'invoices';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }

  async myReceipts(pageQuery: PaginationQuery, config?: AxiosRequestConfig) {
    const response = await this._client.get(
      `me/invoices?page=${pageQuery.pagination.page}&limit=${pageQuery.pagination.limit}`,
      config,
    );
    return formatResponse<Invoice[]>(response);
  }

  async get(id: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/${id}`, config);
    return formatResponse<Invoice>(response);
  }

  async create(payload: any, config?: AxiosRequestConfig) {
    const response = await this._client.post(`me/invoices`, payload, config);
    return formatResponse<Invoice>(response);
  }

  async update(id: string, payload: any, config?: AxiosRequestConfig) {
    const response = await this._client.patch(
      `${this._prefix}/${id}`,
      payload,
      config,
    );
    return formatResponse<Invoice>(response);
  }
}
