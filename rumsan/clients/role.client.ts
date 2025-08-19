import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  CreateRole,
  EditRole,
  ListRole,
  Permission,
  Role,
  RoleWithPermission,
  SearchPermission,
} from '../types';
import { formatResponse } from '../utils/formatResponse.utils';

export class RoleClient {
  private _client: AxiosInstance;
  private _prefix = 'roles';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }

  async createRole(role: CreateRole) {
    const response = await this._client.post(`${this._prefix}`, role);
    return formatResponse<Role>(response);
  }
  async listRole(data?: ListRole, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}`, {
      params: data,
      ...config,
    });
    return formatResponse<Role>(response);
  }
  async searchRoleByPermission(
    data: SearchPermission,
    config?: AxiosRequestConfig,
  ) {
    const response = await this._client.post(
      `${this._prefix}/search-by-permission`,
      data,
      config,
    );
    return formatResponse<Role[]>(response);
  }
  async updateRole(name: string, data: EditRole, config?: AxiosRequestConfig) {
    const response = await this._client.patch(
      `${this._prefix}/${name}`,
      data,
      config,
    );
    return formatResponse<RoleWithPermission>(response);
  }
  async deleteRole(name: string, config?: AxiosRequestConfig) {
    const response = await this._client.delete(
      `${this._prefix}/${name}`,
      config,
    );
    return formatResponse<Role>(response);
  }
  async getRole(name: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(`${this._prefix}/${name}`, config);
    return formatResponse<RoleWithPermission>(response);
  }
  async listPermissionsByRole(name: string, config?: AxiosRequestConfig) {
    const response = await this._client.get(
      `${this._prefix}/${name}/permissions`,
      config,
    );
    return formatResponse<Permission[]>(response);
  }
}
