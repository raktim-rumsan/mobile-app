import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CreateInvoice, Invoice } from '../types/raman/receipt.type';
import { formatResponse } from '../utils';

export class ReceiptClient {
  private _client: AxiosInstance;
  private _prefix = 'invoices';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }

  async create(data: CreateInvoice, config?: AxiosRequestConfig) {
    const response = await this._client.post(`${this._prefix}`, data, config);
    return formatResponse<Invoice>(response);
  }
}
