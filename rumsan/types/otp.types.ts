import { AuthService } from './auth.types';

export type OTP = {
  address: string;
  service: AuthService | null;
  clientId: string | null;
};
