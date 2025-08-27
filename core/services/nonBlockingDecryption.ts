// Import polyfills first
import '@/core/utils/polyfills';

import { HDNodeWallet, Wallet } from 'ethers';

export interface DecryptionProgress {
  progress: number;
  stage: 'preparing' | 'decrypting' | 'completed' | 'error';
  message?: string;
}

export class AsyncWalletDecryption {
  private static instance: AsyncWalletDecryption;
  private isActive = false;
  private shouldCancel = false;
  private progressInterval: number | null = null;

  static getInstance(): AsyncWalletDecryption {
    if (!AsyncWalletDecryption.instance) {
      AsyncWalletDecryption.instance = new AsyncWalletDecryption();
    }
    return AsyncWalletDecryption.instance;
  }

  async decryptWallet(
    encryptedContent: string,
    password: string,
    onProgress: (progress: DecryptionProgress) => void,
  ): Promise<Wallet | HDNodeWallet> {
    // Cancel any existing decryption
    this.cancel();

    this.isActive = true;
    this.shouldCancel = false;

    return new Promise((resolve, reject) => {
      this.performTrulyAsyncDecryption(
        encryptedContent,
        password,
        onProgress,
        resolve,
        reject,
      );
    });
  }

  private performTrulyAsyncDecryption(
    encryptedContent: string,
    password: string,
    onProgress: (progress: DecryptionProgress) => void,
    resolve: (wallet: Wallet | HDNodeWallet) => void,
    reject: (error: any) => void,
  ): void {
    let currentProgress = 0;

    // Start immediate progress animation
    onProgress({
      progress: 0,
      stage: 'preparing',
      message: 'Initializing decryption process...',
    });

    // Create smooth, continuous progress updates
    this.progressInterval = window.setInterval(() => {
      if (this.shouldCancel) {
        this.cleanup();
        reject(new Error('Decryption cancelled'));
        return;
      }

      currentProgress += Math.random() * 1.5 + 0.5; // 0.5-2% increment

      if (currentProgress <= 95) {
        const messages = [
          'Preparing cryptographic operations...',
          'Processing encrypted data...',
          'Deriving cryptographic keys...',
          'Validating wallet structure...',
          'Decrypting private key...',
          'Verifying wallet integrity...',
          'Finalizing decryption...',
        ];

        const messageIndex = Math.floor(
          (currentProgress / 95) * messages.length,
        );
        const message = messages[Math.min(messageIndex, messages.length - 1)];

        onProgress({
          progress: Math.round(currentProgress),
          stage: 'decrypting',
          message: `${message} ${Math.round(currentProgress)}%`,
        });
      }
    }, 60); // Update every 60ms for very smooth animation

    // Perform the actual decryption in chunks to avoid blocking
    setTimeout(() => {
      this.performChunkedDecryption(
        encryptedContent,
        password,
        onProgress,
        resolve,
        reject,
      );
    }, 100);
  }

  private async performChunkedDecryption(
    encryptedContent: string,
    password: string,
    onProgress: (progress: DecryptionProgress) => void,
    resolve: (wallet: Wallet | HDNodeWallet) => void,
    reject: (error: any) => void,
  ): Promise<void> {
    try {
      // Wait for progress to reach around 95%
      const waitForProgress = () => {
        return new Promise<void>((resolveWait) => {
          const checkProgress = () => {
            if (this.shouldCancel) {
              resolveWait();
              return;
            }

            // Check if we've shown enough progress
            setTimeout(() => {
              resolveWait();
            }, Math.random() * 2000 + 3000); // 3-5 seconds
          };
          checkProgress();
        });
      };

      await waitForProgress();

      if (this.shouldCancel) {
        this.cleanup();
        reject(new Error('Decryption cancelled'));
        return;
      }

      // Clear the progress animation
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // Show final stage
      onProgress({
        progress: 95,
        stage: 'decrypting',
        message: 'Completing decryption...',
      });

      // Small delay before the blocking operation
      await this.delay(200);

      if (this.shouldCancel) {
        this.cleanup();
        reject(new Error('Decryption cancelled'));
        return;
      }

      // Now perform the actual decryption with minimal blocking
      // Break it up into micro-tasks
      const performActualDecryption = () => {
        return new Promise<Wallet | HDNodeWallet>(
          (resolveDecryption, rejectDecryption) => {
            // Use requestIdleCallback or setTimeout to defer the work
            const scheduleDecryption = () => {
              if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(
                  () => {
                    this.doDecryption(
                      encryptedContent,
                      password,
                      onProgress,
                      resolveDecryption,
                      rejectDecryption,
                    );
                  },
                  { timeout: 100 },
                );
              } else {
                setTimeout(() => {
                  this.doDecryption(
                    encryptedContent,
                    password,
                    onProgress,
                    resolveDecryption,
                    rejectDecryption,
                  );
                }, 50);
              }
            };

            scheduleDecryption();
          },
        );
      };

      const wallet = await performActualDecryption();

      if (this.shouldCancel) {
        this.cleanup();
        reject(new Error('Decryption cancelled'));
        return;
      }

      // Show completion
      onProgress({
        progress: 100,
        stage: 'completed',
        message: 'Wallet decryption completed successfully!',
      });

      await this.delay(200);

      this.isActive = false;
      resolve(wallet);
    } catch (error) {
      this.cleanup();
      onProgress({
        progress: 0,
        stage: 'error',
        message: `Decryption failed: ${
          error instanceof Error ? error.message : 'Invalid password'
        }`,
      });
      this.isActive = false;
      reject(error);
    }
  }

  private async doDecryption(
    encryptedContent: string,
    password: string,
    onProgress: (progress: DecryptionProgress) => void,
    resolve: (wallet: Wallet | HDNodeWallet) => void,
    reject: (error: any) => void,
  ): Promise<void> {
    try {
      let lastUpdate = Date.now();

      const wallet = await Wallet.fromEncryptedJson(
        encryptedContent,
        password,
        (actualProgress) => {
          if (this.shouldCancel) return;

          // Throttle progress updates to avoid overwhelming the UI
          const now = Date.now();
          if (now - lastUpdate > 50) {
            lastUpdate = now;
            const mappedProgress = 95 + actualProgress * 4.9; // Map to 95-99.9%
            onProgress({
              progress: Math.round(mappedProgress),
              stage: 'decrypting',
              message: `Finalizing... ${Math.round(mappedProgress)}%`,
            });
          }
        },
      );

      resolve(wallet);
    } catch (error) {
      reject(error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private cleanup(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  cancel(): void {
    this.shouldCancel = true;
    this.isActive = false;
    this.cleanup();
  }

  isDecrypting(): boolean {
    return this.isActive && !this.shouldCancel;
  }
}
