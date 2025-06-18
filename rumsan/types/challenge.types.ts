export type Challenge = {
  clientId: string;
  timestamp: number;
  ip: string | null;
  address: string | null;
  data: Record<string, any>;
};

export type CreateChallenge = {
  clientId?: string;
  ip?: string;
  address?: string;
  data?: Record<string, any>;
};
