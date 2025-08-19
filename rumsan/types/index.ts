export * from './auth.types';
export * from './challenge.types';
export * from './error.types';
export * from './exceptionResponse.types';
export * from './loginResponse.types';
export * from './otp.types';
export * from './pagination.types';
export * from './permission.types';
export * from './request.types';
export * from './response.types';
export * from './role.types';
export * from './session.types';
export * from './setting.types';
export * from './user.types';
export * from './walletLogin.types';

export type FileAttachment = {
  hash: string;
  filename: string;
  size: number;
  mimeType: string;
  url?: string | null;
  previewUrl?: string;
  cloudStorage?: string;
  cloudStorageId?: string;
};
