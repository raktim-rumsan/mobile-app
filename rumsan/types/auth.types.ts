export type Auth = {
  id?: number;
  userId: string;
  service: AuthService;
  serviceId: string;
  details?: Record<string, any>;
  challenge?: string;
  falseAttempts?: number;
  isLocked?: boolean;
  lockedOnAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type AuthSession = {
  id: number;
  clientId: string;
  sessionId: string;
  authId: number;
  ip?: string;
  details?: Record<string, any>;
  userAgent?: string;
  createdAt: Date;
};

export type AuthResponse = {
  clientId: string;
  ip: string;
  challenge: string;
};

export type AuthService =
  | 'EMAIL'
  | 'PHONE'
  | 'WALLET'
  | 'API'
  | 'GOOGLE'
  | 'APPLE'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'GITHUB'
  | 'LINKEDIN';
export const AuthService = {
  EMAIL: 'EMAIL' as AuthService,
  PHONE: 'PHONE' as AuthService,
  WALLET: 'WALLET' as AuthService,
  API: 'API' as AuthService,
  GOOGLE: 'GOOGLE' as AuthService,
  APPLE: 'APPLE' as AuthService,
  FACEBOOK: 'FACEBOOK' as AuthService,
  TWITTER: 'TWITTER' as AuthService,
  GITHUB: 'GITHUB' as AuthService,
  LINKEDIN: 'LINKEDIN' as AuthService,
};
