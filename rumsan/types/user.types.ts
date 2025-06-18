import { CommonFields } from './common.type';
import { Pagination } from './pagination.types';

export type UserBase<T> = {
  id?: number;
  cuid?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  wallet?: string;
  notes?: string;
  sessionId?: string;
  details?: T;
  permissions?: string[];
  roles?: string[];
};

export type User<T = Record<string, unknown>> = UserBase<T> &
  CommonFields & { cuid: string };

export type UserRole = {
  id: number;
  userId: string;
  roleId: string;
  expiry: Date | null;
  createdAt: Date;
  createdBy: number | null;
  name: string;
};

export interface CreateUserDto<T = Record<string, unknown>>
  extends UserBase<T> {}

export interface UpdateUserDto<T = Record<string, unknown>>
  extends Partial<UserBase<T>> {}

export interface ListUserDto<T = Record<string, unknown>>
  extends Pagination<T> {}

export type SignupStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'REJECTED';
export const SignupStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
};

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  UNKNOWN: 'UNKNOWN',
};

export type SignupBase<T = Record<string, unknown>> = {
  data: T;
  userIdentifier: string | null;
  status: SignupStatus;
  rejectedReason: string | null;
  approvedBy: number | null;
  approvedAt: Date | null;
};

export type Signup<T = Record<string, unknown>> = UserBase<T> &
  CommonFields & { cuid: string; id: number };

export type SignupConfig = {
  autoApprove: boolean;
};
