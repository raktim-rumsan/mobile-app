import { User } from './user.types';

export type LoginResponse<T = Record<string, any>> = {
  accessToken: string;
  currentUser?: User;
  userDetails: T;
};
