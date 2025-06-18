import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  AuthService,
  CreateChallenge,
  GoogleAuth,
  LoginResponse,
  OTP,
  WalletLogin,
} from '../types';
import { formatResponse } from '../utils';

export class AuthClient {
  private _client: AxiosInstance;
  private _prefix = 'auth';

  constructor(private apiClient: AxiosInstance) {
    this._client = apiClient;
  }
  async login<T>(
    data: {
      otp: string;
      challenge: string;
      service?: AuthService;
    },
    config?: AxiosRequestConfig,
  ) {
    data.service = data.service || AuthService.EMAIL;
    const response = await this._client.post(
      `${this._prefix}/login`,
      data,
      config,
    );
    return formatResponse<LoginResponse<T>>(response);
  }

  async getOtp(data: OTP, config?: AxiosRequestConfig) {
    const response = await this._client.post(
      `${this._prefix}/otp`,
      data,
      config,
    );
    return formatResponse<AuthResponse>(response);
  }

  async walletLogin(data: WalletLogin, config?: AxiosRequestConfig) {
    const response = await this._client.post(
      `${this._prefix}/wallet`,
      data,
      config,
    );
    return formatResponse<LoginResponse>(response);
  }

  async googleLogin(data: GoogleAuth, config?: AxiosRequestConfig) {
    const response = await this._client.post(
      `${this._prefix}/google`,
      data,
      config,
    );
    return formatResponse<LoginResponse>(response);
  }

  async getChallenge(data: CreateChallenge, config?: AxiosRequestConfig) {
    const response = await this._client.post(
      `${this._prefix}/challenge`,
      data,
      config,
    );
    return formatResponse<AuthResponse>(response);
  }
}
