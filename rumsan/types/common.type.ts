export type CommonFields = {
  cuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  sessionId?: string;
};

export type CommonCreateFields = {
  cuid?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  sessionId?: string;
};
export type CommonUpdateFields = {
  cuid?: string;
  updatedAt?: Date;
  updatedBy?: string;
  sessionId?: string;
};
export type CommonDeleteFields = {
  cuid?: string;
  deletedAt?: Date;
  deletedBy?: string;
  sessionId?: string;
};
