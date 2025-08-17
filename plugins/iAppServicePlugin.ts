export interface iAppServicePlugin {
  onUnlock: () => Promise<boolean>;
  isSessionValid: () => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}
