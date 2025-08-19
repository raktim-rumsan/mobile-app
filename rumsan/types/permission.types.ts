export type Permission = {
  cuid?: string;
  roleId: string;
  action: string;
  subject: string;
  inverted: boolean;
  conditions: Record<string, any>;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PermissionSet = {
  [subject: string]: ('manage' | 'create' | 'read' | 'update' | 'delete')[];
};
