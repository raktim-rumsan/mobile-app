export type CurrentUser = {
  id?: number;
  cuid: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  wallet?: string | null;
  roles: string[];
  permissions: {
    action: string;
    subject: string;
    inverted: boolean;
    conditions: string;
  }[];
  sessionId: string;
};

export type CUI = CurrentUser;
export type TokenData = CurrentUser;
