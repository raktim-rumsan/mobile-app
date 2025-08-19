// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import { TLog } from '@/core/types/iHostService';
import '@ethersproject/shims';
import { format } from 'date-fns';
import { ethers } from 'ethers';
import {
  createFolder,
  downloadTextFile,
  findFirstObjectByName,
  renameObject,
  uploadStringToDrive,
} from './gdrive.utils';

const appUrl = process.env.EXPO_PUBLIC_BASE_URL;
const GOOGLE_API_URL = 'https://www.googleapis.com';
const BACKUP_FOLDER_NAME = 'RumsanWalletBackup';
const BACKUP_FILE_NAME = 'rumsan-wallet';

export const GoogleApis = {
  getJwtToken: async (code: string) => {
    const body = new FormData();
    body.append('code', code);
    const response = await fetch(`${appUrl}/api/auth/token`, {
      method: 'POST',
      body,
    });
    const { data } = await response.json();
    return data;
  },

  isAuthTokenValid: async (authToken: string): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const response = await fetch(
        `${GOOGLE_API_URL}/oauth2/v3/tokeninfo?access_token=${authToken}`,
      );

      if (!response.ok) return false;
      const data = await response.json();
      // If token is valid, data will have fields like 'aud', 'exp', etc.
      return data.expires_in > 0;
    } catch (error) {
      console.error('Error validating access token:', error);
      return false;
    }
  },

  getBackupWalletInfo: async (
    accessToken: string,
    log?: TLog,
  ): Promise<{ folderId: string; walletFileId: string | null }> => {
    const folderId = await GoogleApis.createOrGetBackupFolder(accessToken, log);
    const walletFileId = await findFirstObjectByName(
      accessToken,
      BACKUP_FILE_NAME,
      {
        isFolder: false,
        parentFolderId: folderId,
        log,
      },
    );
    if (walletFileId) {
      return { folderId, walletFileId };
    } else {
      return { folderId, walletFileId: null };
    }
  },

  createOrGetBackupFolder: async (
    accessToken: string,
    log?: TLog,
  ): Promise<string> => {
    const existingFolder = await findFirstObjectByName(
      accessToken,
      BACKUP_FOLDER_NAME,
      {
        isFolder: true,
        log,
      },
    );

    if (existingFolder) {
      log?.(`Found existing folder: ${BACKUP_FOLDER_NAME}: ${existingFolder}`);
      return existingFolder;
    }

    // If the folder does not exist, create it
    const newFolder = await createFolder(accessToken, BACKUP_FOLDER_NAME);
    log?.(`Created new folder named ${BACKUP_FOLDER_NAME}`);
    if (!newFolder || !newFolder.id) {
      throw new Error(`Failed to create folder: ${BACKUP_FOLDER_NAME}`);
    }
    return newFolder.id;
  },

  createAndBackupWallet: async (
    accessToken: string,
    password: string,
    folderId: string,
    log?: TLog,
  ) => {
    // Encrypt the wallet
    log?.(`Creating and backing up wallet with password: ${password}`);
    const wallet = await ethers.Wallet.createRandom();
    log?.(`Created wallet: ${wallet.address}`);

    const encryptedWallet = await wallet.encrypt(password);
    log?.('Encrypted wallet successfully');

    // Generate a filename based on the current date
    const date = format(new Date(), 'yyyy-MM-dd');
    const fileName = `${BACKUP_FILE_NAME}`;

    // Upload the file to Google Drive
    const uploadResult = await uploadStringToDrive(
      accessToken,
      encryptedWallet,
      {
        fileName,
        mimeType: 'application/json',
        folderId,
        description: 'Rumsan Wallet Backup',
      },
    );
    log?.('Uploaded wallet backup to Google Drive successfully');

    return { fileId: uploadResult.id, fileName, wallet };
  },

  getEncryptedWalletFileId: async (
    accessToken: string,
    folderId: string,
  ): Promise<string | null> => {
    const fileId = await findFirstObjectByName(accessToken, BACKUP_FILE_NAME, {
      isFolder: false,
      parentFolderId: folderId,
    });

    return fileId;
  },

  getEncryptedWallet: async (
    accessToken: string,
    folderId: string,
  ): Promise<{ fileId: string; content: string } | null> => {
    const fileId = await GoogleApis.getEncryptedWalletFileId(
      accessToken,
      folderId,
    );

    if (!fileId) {
      return null;
    }

    // Download the file
    const content = await downloadTextFile(accessToken, fileId);
    return { fileId, content };
  },

  archiveEncryptedWallet: async (
    accessToken: string,
    folderId: string,
    archiveName: string,
  ): Promise<string | null> => {
    const fileId = await GoogleApis.getEncryptedWalletFileId(
      accessToken,
      folderId,
    );

    if (!fileId) {
      return null;
    }

    // Rename the file to archive it
    const newFileName = `${BACKUP_FILE_NAME}|${archiveName}`;
    await renameObject(accessToken, fileId, newFileName);
    return newFileName;
  },
};

// export async function postWalletAddress(walletAddress: string) {
//   try {
//     // Replace with your actual API endpoint
//     const response = await fetch('https://api.example.com/wallet', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ address: walletAddress }),
//     });

//     return await response.json();
//   } catch (error) {
//     console.error('Error posting wallet address:', error);
//     throw error;
//   }
// }
