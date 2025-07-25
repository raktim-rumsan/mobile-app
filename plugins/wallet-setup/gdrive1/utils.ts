import { WALLET_INFO } from '@/constants/wallet';
import {
  createFolder,
  downloadTextFile,
  findFirstObjectByName,
  uploadStringToDrive,
} from '@/utils/gdrive.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { ethers } from 'ethers';

const WALLET_BACKUP_INFO = '@wallet_gdrive';

/**
 * Save the wallet file name to AsyncStorage
 * @param fileName The name of the wallet file
 */
export async function setBackupInfo(info: {
  id: string;
  name: string;
}): Promise<void> {
  await AsyncStorage.setItem(WALLET_BACKUP_INFO, JSON.stringify(info));
}

/**
 * Get the stored wallet file name from AsyncStorage
 * @returns The stored wallet file name or null if not found
 */
export async function getBackupInfo(): Promise<{
  id: string;
  name: string;
} | null> {
  const backupInfo = await AsyncStorage.getItem(WALLET_BACKUP_INFO);
  return backupInfo ? JSON.parse(backupInfo) : null;
}

export async function getBackupWalletInfo(
  accessToken: string,
  log?: (message: string, isError?: boolean) => void,
): Promise<{ folderId: string; walletFileId: string | null }> {
  // Ensure the user has a folder named 'RumsanWalletBackup' in Google Drive
  const folderId = await createOrGetBackupFolder(accessToken, log);

  // Check if the backup folder exists
  const walletFileId = await findFirstObjectByName(
    accessToken,
    WALLET_INFO.BACKUP_FILE_NAME,
    {
      isFolder: false,
      parentFolderId: folderId,
      log,
    },
  );
  if (walletFileId) {
    return { folderId, walletFileId }; // Wallet backup file exists
  } else {
    return { folderId, walletFileId: null }; // Wallet backup file does not exist
  }
}

/**
 * Backup a wallet to Google Drive
 * @param wallet The wallet to backup
 * @param password The password to encrypt the wallet
 * @param accessToken Google Drive access token
 * @returns A promise that resolves to the uploaded file details
 */
export async function createAndBackupWallet(
  accessToken: string,
  password: string,
  folderId: string,
  log?: (message: string, isError?: boolean) => void,
) {
  // Encrypt the wallet
  const wallet = await ethers.Wallet.createRandom();
  const encryptedWallet = await wallet.encrypt(password);
  log?.('Created and encrypted wallet successfully');

  // Generate a filename based on the current date
  const date = format(new Date(), 'yyyy-MM-dd');
  const fileName = `${WALLET_INFO.BACKUP_FILE_NAME}`;

  // Upload the file to Google Drive
  const uploadResult = await uploadStringToDrive(accessToken, encryptedWallet, {
    fileName,
    mimeType: 'application/json',
    folderId,
    description: 'Rumsan Wallet Backup',
  });
  log?.('Uploaded wallet backup to Google Drive successfully');

  // Save the file name for future reference
  await setBackupInfo({ id: uploadResult.id, name: fileName });
  return wallet;
}

/**
 * Create or get the wallet backup folder in Google Drive
 * @param accessToken Google Drive access token
 * @returns The folder ID
 */
export async function createOrGetBackupFolder(
  accessToken: string,
  log?: (message: string, isError?: boolean) => void,
): Promise<string> {
  // Check if the folder already exists
  const existingFolder = await findFirstObjectByName(
    accessToken,
    WALLET_INFO.BACKUP_FOLDER_NAME,
    {
      isFolder: true,
      log,
    },
  );
  if (existingFolder) {
    log?.(
      `Found existing folder: ${WALLET_INFO.BACKUP_FOLDER_NAME}: ${existingFolder}`,
    );
    return existingFolder;
  }

  // If the folder does not exist, create it
  const newFolder = await createFolder(
    accessToken,
    WALLET_INFO.BACKUP_FOLDER_NAME,
  );
  log?.(`Created new folder named ${WALLET_INFO.BACKUP_FOLDER_NAME}`);
  if (!newFolder || !newFolder.id) {
    throw new Error(
      `Failed to create folder: ${WALLET_INFO.BACKUP_FOLDER_NAME}`,
    );
  }
  return newFolder.id;
}

/**
 * Download and restore a wallet from Google Drive
 * @param fileId The ID of the file to download
 * @param fileName The name of the file to restore
 * @param password The password to decrypt the wallet
 * @param accessToken Google Drive access token
 * @returns The restored wallet
 */
export async function getEncryptedWalletFromBackup(
  accessToken: string,
  folderId: string,
): Promise<{ fileId: string; content: string } | null> {
  const fileId = await findFirstObjectByName(
    accessToken,
    WALLET_INFO.BACKUP_FILE_NAME,
    {
      isFolder: false,
      parentFolderId: folderId,
    },
  );

  if (!fileId) {
    return null;
  }

  // Download the file
  const content = await downloadTextFile(accessToken, fileId);
  return { fileId, content };
}

/**
 * Call API to post wallet address
 * @param walletAddress The wallet address to post
 * @returns The API response
 */
export async function postWalletAddress(walletAddress: string) {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://api.example.com/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: walletAddress }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error posting wallet address:', error);
    throw error;
  }
}

// User ethers package create random wallet or encrypt the wallet file using the password
// After successful google login, check if the user has access to Google Drive
// If the user does not have access to Google Drive, show an error message. Add button to get permission to the drive
// Check if the wallet file is in folder named RumsanWalletBackup in google Drive
// If files exists, create a screen list the files in the folder.
// When clicked on a file, download the file
// Show the screen to input the password to decrypt the wallet file
// If the password is correct, decrypt the wallet file and restore the wallet, Save the decrypted wallet file name in the app storage
// If the password is incorrect, show an error message
// Show a success message if the wallet is restored successfully
// If the folder and files do not exist, show the password input screen directly
// If the folder does not exist, create the folder
// Encrypt the wallet file using the password and upload it to Google Drive with the name rwallet_<DD-MM-YYYY>.json
// Save the decrypted wallet file name in the app storage
// Call sample api to post the wallet address
