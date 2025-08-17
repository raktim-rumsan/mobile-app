import { TLog } from '@/plugins/iHostService';
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
    const aboutResponse = await fetch(
      `${GOOGLE_DRIVE_API_URL}/about?fields=user,storageQuota`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // If basic access check fails, no need to check write permissions
    if (!aboutResponse.ok) return false;

    // To verify write access, we'll attempt to create a temporary folder
    // This confirms the user has permission to write to their Drive
    const tempFolderName = `temp_access_check_${Date.now()}`;
    const createResponse = await fetch(`${GOOGLE_DRIVE_API_URL}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tempFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    // If folder creation succeeds, delete it immediately (cleanup)
    if (createResponse.ok) {
      const folder = await createResponse.json();

      // Delete the temporary folder
      await fetch(`${GOOGLE_DRIVE_API_URL}/files/${folder.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Successfully created and deleted - write permission confirmed
      return true;
    }

    // Could not create folder, so no write access
    return false;
  } catch (error) {
    console.error('Error checking Google Drive write permission:', error);
    return false;
  }
};

/**
 * Pick a file from device storage
 */
export const pickFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Allow all file types
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking file:', error);
    throw error;
  }
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
  try {
    // Set default file name if not provided
    const fileName = options.fileName || file.name || 'Untitled';

    // Determine MIME type
    const mimeType =
      options.mimeType || file.type || 'application/octet-stream';

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

    // Upload file to Google Drive
    const response = await fetch(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: requestBody,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error uploading to Google Drive from web:', error);
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
  try {
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

    // Upload file to Google Drive
    const response = await fetch(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: requestBody,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
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
  try {
    const queryParams = new URLSearchParams({
      pageSize: pageSize.toString(),
      fields: 'files(id, name, mimeType, webViewLink, size)',
    });

    if (query) {
      queryParams.append('q', query);
    }

    const response = await fetch(
      `${GOOGLE_DRIVE_API_URL}/files?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to list files: ${
          errorData.error?.message || response.statusText
        }`,
      );
    }

    const responseData = await response.json();
    return responseData.files;
  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
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
  try {
    const metadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create folder: ${
          errorData.error?.message || response.statusText
        }`,
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    throw error;
  }
};

export const findFirstObjectByName = async (
  accessToken: string,
  objectName: string,
  options: {
    parentFolderId?: string;
    isFolder?: boolean;
    log?: TLog;
  } = { isFolder: false },
): Promise<string | null> => {
  const query = `name='${objectName}' and trashed=false${
    options.isFolder ? " and mimeType='application/vnd.google-apps.folder'" : ''
  }${
    options.parentFolderId ? ` and '${options.parentFolderId}' in parents` : ''
  }`;

  const response = await fetch(
    `${GOOGLE_DRIVE_API_URL}/files?q=${encodeURIComponent(
      query,
    )}&fields=files(id,name)`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    const errorData = await response.json();
    options.log?.(
      `Failed to find folder: ${
        errorData.error?.message || response.statusText
      }`,
      true,
    );
    return null;
  }
  const responseData = await response.json();
  // Return the first folder that matches the name
  if (responseData.files && responseData.files.length > 0) {
    return responseData.files[0].id;
  }
  // Folder not found
  return null;
};

export const renameObject = async (
  accessToken: string,
  fileId: string,
  newName: string,
): Promise<objectResponse> => {
  try {
    // Metadata for renaming the file
    const metadata = {
      name: newName,
    };
    const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to rename file: ${
          errorData.error?.message || response.statusText
        }`,
      );
    }
    const responseData = await response.json();
    return {
      id: responseData.id,
      name: responseData.name,
      mimeType: responseData.mimeType,
      webViewLink: responseData.webViewLink,
      size: responseData.size,
    };
  } catch (error) {
    console.error('Error renaming file in Google Drive:', error);
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
  try {
    // Query to search for a folder with the given name
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;

    const response = await fetch(
      `${GOOGLE_DRIVE_API_URL}/files?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to search for folder: ${
          errorData.error?.message || response.statusText
        }`,
      );
    }

    const responseData = await response.json();

    // Return the first folder that matches the name
    if (responseData.files && responseData.files.length > 0) {
      return {
        id: responseData.files[0].id,
        name: responseData.files[0].name,
      };
    }

    // Folder not found
    return null;
  } catch (error) {
    console.error('Error searching for folder in Google Drive:', error);
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
  try {
    // Query to list files in the folder
    const query = `'${folderId}' in parents and trashed=false`;

    const response = await fetch(
      `${GOOGLE_DRIVE_API_URL}/files?q=${encodeURIComponent(
        query,
      )}&fields=files(id,name,mimeType,size)`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to list files in folder: ${
          errorData.error?.message || response.statusText
        }`,
      );
    }

    const responseData = await response.json();
    return responseData.files || [];
  } catch (error) {
    console.error('Error listing files in Google Drive folder:', error);
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
  const response = await fetch(
    `${GOOGLE_DRIVE_API_URL}/files/${fileId}?alt=media`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    options.error?.(
      `Failed to download file: ${errorText || response.statusText}`,
    );
  }

  return response.text();
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
  try {
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
  } catch (error) {
    console.error('Error creating file from string:', error);
    throw error;
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
  try {
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

    // Upload content directly to Google Drive
    const response = await fetch(
      `${GOOGLE_UPLOAD_API_URL}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: requestBody,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.error?.message || response.statusText}`,
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error uploading string content to Google Drive:', error);
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
    const response = await fetch(
      `${GOOGLE_API_URL}/oauth2/v3/tokeninfo?access_token=${accessToken}`,
    );
    if (!response.ok) return false;
    const data = await response.json();
    // If token is valid, data will have fields like 'aud', 'exp', etc.
    return !data.error;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
};
