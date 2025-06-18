import { Pagination, Permission, PermissionSet } from '.';

export type Role = {
  cuid?: string;
  name: string;
  isSystem?: boolean;
  permissions?: Permission[];
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
};

export type RoleWithPermission = {
  role: Role;
  permissions: PermissionSet;
};

export type CreateRole = {
  name: string;
  isSystem?: boolean;
  permissions?: Permission[];
  description?: string;
};

export type EditRole = Partial<CreateRole> & {
  name: string;
};

export type ListRole = Partial<Pagination>;

export type SearchPermission = {
  action: string;
  subject: string;
};
