// Type: WalletLogin
export type WalletLogin = {
  signature: `0x${string}`;
  challenge: string;
};

export type GoogleAuth = {
  idToken: string;
  walletSignature?: string;
};
