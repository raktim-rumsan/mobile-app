import { AppError } from '@/core/types/iHostService';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Google Drive API base URL
const GOOGLE_API_URL = 'https://www.googleapis.com';
const GOOGLE_DRIVE_API_URL = `${GOOGLE_API_URL}/drive/v3`;
const GOOGLE_UPLOAD_API_URL = `${GOOGLE_API_URL}/upload/drive/v3`;

/**
 * Interface for file upload response
 */
interface objectResponse {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
}

/**
 * Interface for file upload options
 */
interface FileUploadOptions {
  fileName?: string;
  mimeType?: string;
  folderId?: string;
  description?: string;
}

export const checkGDriveWritePermission = async (
  accessToken: string,
): Promise<boolean> => {
  try {
    if (!accessToken) return false;

    // First verify basic access using the "about" endpoint
    const aboutResponse = await axios.get(`${GOOGLE_DRIVE_API_URL}/about`, {
      params: {
        fields: 'user,storageQuota',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If basic access check fails, no need to check write permissions
    if (!aboutResponse.data) return false;

    // To verify write access, we'll attempt to create a temporary folder
    // This confirms the user has permission to write to their Drive
    const tempFolderName = `temp_access_check_${Date.now()}`;
    const createResponse = await axios.post(
      `${GOOGLE_DRIVE_API_URL}/files`,
      {
        name: tempFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // If folder creation succeeds, delete it immediately (cleanup)
    if (createResponse.data?.id) {
      // Delete the temporary folder
      await axios.delete(
        `${GOOGLE_DRIVE_API_URL}/files/${createResponse.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // Successfully created and deleted - write permission confirmed
      return true;
    }

    // Could not create folder, so no write access
    return false;
  } catch (error) {
    // For permission checking, we want to catch errors and return false
    // This is a utility function that should not throw
    console.error('Error checking Google Drive write permission:', error);
    return false;
  }
};

/**
 * Pick a file from device storage
 */
export const pickFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*', // Allow all file types
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
};

/**
 * File picker for web platform
 */
export const pickFileWeb = (): Promise<File | null> => {
  return new Promise((resolve) => {
    // Create a temporary file input element
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0] || null;
      resolve(file);
    };

    // Handle cancellation
    input.oncancel = () => resolve(null);

    // Trigger the file picker
    input.click();
  });
};

/**
 * Upload file from web browser to Google Drive
 */
export const uploadFileFromWeb = async (
  file: File,
  accessToken: string,
  options: FileUploadOptions = {},
): Promise<objectResponse> => {
  // Set default file name if not provided
  const fileName = options.fileName || file.name || 'Untitled';

  // Determine MIME type
  const mimeType = options.mimeType || file.type || 'application/octet-stream';

  // Convert file to base64
  const fileContent = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extract the base64 data without the data URL prefix
      const base64Content = (reader.result as string).split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  // Metadata for the file
  const metadata = {
    name: fileName,
    mimeType,
    description: options.description || '',
  };

  // If folderId is provided, add it to metadata
  if (options.folderId) {
    Object.assign(metadata, {
      parents: [options.folderId],
    });
  }

  // Create multipart request
  const boundary = 'boundary_' + Math.random().toString().substr(2);
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  // Build multipart request body
  let requestBody = delimiter;
  requestBody += 'Content-Type: application/json\r\n\r\n';
  requestBody += JSON.stringify(metadata) + delimiter;
  requestBody += 'Content-Type: ' + mimeType + '\r\n';
  requestBody += 'Content-Transfer-Encoding: base64\r\n\r\n';
  requestBody += fileContent + closeDelimiter;

  try {
    // Upload file to Google Drive
    const response = await axios.post(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Upload failed: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: uploadFileFromWeb',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Upload file to Google Drive
 */
export const uploadFileToDrive = async (
  accessToken: string,
  fileUri: string,
  options: FileUploadOptions = {},
): Promise<objectResponse> => {
  // Set default file name if not provided
  const fileName = options.fileName || fileUri.split('/').pop() || 'Untitled';

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }

  // Determine MIME type
  let mimeType = options.mimeType || 'application/octet-stream';

  // File content
  const fileContent = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Metadata for the file
  const metadata = {
    name: fileName,
    mimeType,
    description: options.description || '',
  };

  // If folderId is provided, add it to metadata
  if (options.folderId) {
    Object.assign(metadata, {
      parents: [options.folderId],
    });
  }

  // Create multipart request
  const boundary = 'boundary_' + Math.random().toString().substr(2);
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  // Build multipart request body
  let requestBody = delimiter;
  requestBody += 'Content-Type: application/json\r\n\r\n';
  requestBody += JSON.stringify(metadata) + delimiter;
  requestBody += 'Content-Type: ' + mimeType + '\r\n';
  requestBody += 'Content-Transfer-Encoding: base64\r\n\r\n';
  requestBody += fileContent + closeDelimiter;

  try {
    // Upload file to Google Drive
    const response = await axios.post(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Upload failed: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: uploadFileToDrive',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * List files from Google Drive
 */
export const listFiles = async (
  accessToken: string,
  pageSize = 10,
  query = '',
) => {
  const params: any = {
    pageSize: pageSize.toString(),
    fields: 'files(id, name, mimeType, webViewLink, size)',
  };

  if (query) {
    params.q = query;
  }

  try {
    const response = await axios.get(`${GOOGLE_DRIVE_API_URL}/files`, {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.files;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Failed to list files: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: listFiles',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Create a folder in Google Drive
 */
export const createFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string,
) => {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  try {
    const response = await axios.post(
      `${GOOGLE_DRIVE_API_URL}/files`,
      metadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Failed to create folder: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: createFolder',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

export const findFirstObjectByName = async (
  accessToken: string,
  objectName: string,
  options: {
    parentFolderId?: string;
    isFolder?: boolean;
  } = { isFolder: false },
): Promise<string | null> => {
  const query = `name='${objectName}' and trashed=false${
    options.isFolder ? " and mimeType='application/vnd.google-apps.folder'" : ''
  }${
    options.parentFolderId ? ` and '${options.parentFolderId}' in parents` : ''
  }`;

  try {
    const response = await axios.get(`${GOOGLE_DRIVE_API_URL}/files`, {
      params: {
        q: query,
        fields: 'files(id,name)',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // With axios, response.data contains the parsed JSON
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }
    // Object not found
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = `Failed to find object '${objectName}': ${
        error.response?.data?.error?.message || error.message
      }`;

      throw new AppError(
        errorMessage,
        error.response?.status || 0,
        'GDrive: findFirstObjectByName',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

export const renameObject = async (
  accessToken: string,
  fileId: string,
  newName: string,
): Promise<objectResponse> => {
  // Metadata for renaming the file
  const metadata = {
    name: newName,
  };

  try {
    const response = await axios.patch(
      `${GOOGLE_DRIVE_API_URL}/files/${fileId}`,
      metadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      webViewLink: response.data.webViewLink,
      size: response.data.size,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Failed to rename file: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: renameObject',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Search for a folder in Google Drive
 * @param folderName Name of the folder to search
 * @param accessToken Google access token
 * @returns Folder information or null if not found
 */
export const searchForFolder = async (
  accessToken: string,
  folderName: string,
): Promise<{ id: string; name: string } | null> => {
  // Query to search for a folder with the given name
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;

  try {
    const response = await axios.get(`${GOOGLE_DRIVE_API_URL}/files`, {
      params: {
        q: query,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Return the first folder that matches the name
    if (response.data.files && response.data.files.length > 0) {
      return {
        id: response.data.files[0].id,
        name: response.data.files[0].name,
      };
    }

    // Folder not found
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Failed to search for folder: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: searchForFolder',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * List files in a folder in Google Drive
 * @param folderId ID of the folder to list files from
 * @param accessToken Google access token
 * @returns List of files in the folder
 */
export const listFilesInFolder = async (
  accessToken: string,
  folderId: string,
): Promise<{ id: string; name: string; mimeType: string; size?: string }[]> => {
  // Query to list files in the folder
  const query = `'${folderId}' in parents and trashed=false`;

  try {
    const response = await axios.get(`${GOOGLE_DRIVE_API_URL}/files`, {
      params: {
        q: query,
        fields: 'files(id,name,mimeType,size)',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.files || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Failed to list files in folder: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: listFilesInFolder',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Download a file from Google Drive
 * @param fileId ID of the file to download
 * @param accessToken Google access token
 * @returns File content as string
 */
export const downloadTextFile = async (
  accessToken: string,
  fileId: string,
  options: {
    error?: (message: string) => void;
  } = {},
): Promise<string> => {
  try {
    const response = await axios.get(
      `${GOOGLE_DRIVE_API_URL}/files/${fileId}`,
      {
        params: {
          alt: 'media',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = `Failed to download file: ${
        error.response?.data?.error?.message || error.message
      }`;
      options.error?.(errorMessage);

      throw new AppError(
        errorMessage,
        error.response?.status || 0,
        'GDrive: downloadTextFile',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Create a file from string content
 * @param content String content to create a file with
 * @param options File options including name, mime type, etc
 * @returns File object on web or file URI on native platforms
 */
export const createFileFromString = async (
  content: string,
  options: {
    fileName: string;
    mimeType?: string;
    encoding?: FileSystem.EncodingType;
  },
): Promise<string | File> => {
  const {
    fileName,
    mimeType = 'text/plain',
    encoding = FileSystem.EncodingType.UTF8,
  } = options;

  // Check if running on web
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Web implementation
    const blob = new Blob([content], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  } else {
    // React Native implementation
    // Create a temporary file in the cache directory
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Write the content to the file
    await FileSystem.writeAsStringAsync(fileUri, content, { encoding });

    return fileUri;
  }
};

/**
 * Upload string content directly to Google Drive
 * @param content String content to upload
 * @param accessToken Google access token
 * @param options File upload options
 * @returns File upload response
 */
export const uploadStringToDrive = async (
  accessToken: string,
  content: string,
  options: FileUploadOptions & {
    fileName: string;
    mimeType?: string;
  },
): Promise<objectResponse> => {
  // Set default file name and mime type
  const fileName = options.fileName;
  const mimeType = options.mimeType || 'text/plain';

  // Convert string content to base64 if needed
  const base64Content =
    typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(content))) // Web environment
      : Buffer.from(content).toString('base64'); // React Native

  // Metadata for the file
  const metadata = {
    name: fileName,
    mimeType,
    description: options.description || '',
  };

  // If folderId is provided, add it to metadata
  if (options.folderId) {
    Object.assign(metadata, {
      parents: [options.folderId],
    });
  }

  // Create multipart request
  const boundary = 'boundary_' + Math.random().toString().substr(2);
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  // Build multipart request body
  let requestBody = delimiter;
  requestBody += 'Content-Type: application/json\r\n\r\n';
  requestBody += JSON.stringify(metadata) + delimiter;
  requestBody += 'Content-Type: ' + mimeType + '\r\n';
  requestBody += 'Content-Transfer-Encoding: base64\r\n\r\n';
  requestBody += base64Content + closeDelimiter;

  try {
    // Upload content directly to Google Drive
    const response = await axios.post(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        `Upload failed: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.response?.status || 0,
        'GDrive: uploadStringToDrive',
        undefined,
        error.response?.data?.error?.code,
        error.response?.data?.error?.message,
      );
    }
    throw error;
  }
};

/**
 * Check if a Google access token is valid (not expired)
 * @param accessToken Google OAuth access token
 * @returns true if valid, false if expired/invalid
 */
export const isAccessTokenValid = async (
  accessToken: string,
): Promise<boolean> => {
  if (!accessToken) return false;

  try {
    const response = await axios.get(`${GOOGLE_API_URL}/oauth2/v3/tokeninfo`, {
      params: {
        access_token: accessToken,
      },
    });

    // If token is valid, data will have fields like 'aud', 'exp', etc.
    return !response.data.error;
  } catch (error) {
    // For token validation, we want to catch errors and return false
    // This is a utility function that should not throw
    console.error('Error validating access token:', error);
    return false;
  }
};
