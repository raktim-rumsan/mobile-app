// import { Ionicons } from '@expo/vector-icons';
// import * as DocumentPicker from 'expo-document-picker';
// import React, { useState } from 'react';
// import { ActivityIndicator, Alert, Platform, StyleSheet } from 'react-native';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import { useGoogle } from '../screens/wallet-setup/gdrive/GoogleContext';
// import {
//   pickFile,
//   pickFileWeb,
//   uploadFileFromWeb,
//   uploadFileToDrive,
// } from '../utils/gdrive.utils';
// import { ThemedText } from './ThemedText';
// import { ThemedView } from './ThemedView';

// interface FileUploadProps {
//   onUploadComplete?: (fileData: any) => void;
//   folderId?: string;
// }

// export default function GoogleDriveUpload({
//   onUploadComplete,
//   folderId,
// }: FileUploadProps) {
//   const { accessToken } = useGoogle();
//   const [isUploading, setIsUploading] = useState(false);
//   const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
//     null,
//   );
//   const [webFile, setWebFile] = useState<File | null>(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadError, setUploadError] = useState<string | null>(null);

//   const handleFilePick = async () => {
//     try {
//       setUploadError(null);
//       if (Platform.OS === 'web') {
//         const result = await pickFileWeb();
//         if (result) {
//           setWebFile(result);
//         }
//       } else {
//         const result = await pickFile();
//         if (result) {
//           setFile(result);
//         }
//       }
//     } catch (error) {
//       console.error('Error picking file:', error);
//       setUploadError('Failed to pick file');
//     }
//   };

//   const handleUpload = async () => {
//     if (Platform.OS === 'web') {
//       if (!webFile || !accessToken) {
//         setUploadError('No file selected or not authenticated');
//         return;
//       }
//     } else {
//       if (!file || !accessToken) {
//         setUploadError('No file selected or not authenticated');
//         return;
//       }
//     }

//     setIsUploading(true);
//     setUploadProgress(0);
//     setUploadError(null);

//     try {
//       // Create a simulated progress update
//       const progressInterval = setInterval(() => {
//         setUploadProgress((prev) => {
//           const newProgress = prev + 10;
//           if (newProgress >= 90) {
//             clearInterval(progressInterval);
//             return 90;
//           }
//           return newProgress;
//         });
//       }, 500);

//       // Upload the file based on platform
//       let uploadResult;
//       let fileName = '';

//       if (Platform.OS === 'web' && webFile) {
//         fileName = webFile.name;
//         uploadResult = await uploadFileFromWeb(
//           webFile, // Use the File object directly on web
//           accessToken,
//           {
//             fileName: fileName,
//             mimeType: webFile.type,
//             folderId,
//           },
//         );
//       } else if (file) {
//         fileName = file.name;
//         uploadResult = await uploadFileToDrive(accessToken, file.uri, {
//           fileName: fileName,
//           mimeType: file.mimeType,
//           folderId,
//         });
//       } else {
//         throw new Error('No file to upload');
//       }

//       clearInterval(progressInterval);
//       setUploadProgress(100);

//       if (onUploadComplete) {
//         onUploadComplete(uploadResult);
//       }

//       Alert.alert(
//         'Upload Success',
//         `File ${fileName} was uploaded to Google Drive successfully!`,
//         [{ text: 'OK' }],
//       );

//       // Reset file after successful upload
//       if (Platform.OS === 'web') {
//         setWebFile(null);
//       } else {
//         setFile(null);
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       setUploadError('Failed to upload file to Google Drive');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const formatFileSize = (bytes?: number) => {
//     if (!bytes) return 'Unknown size';

//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//     if (bytes === 0) return '0 Byte';
//     const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
//     return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
//   };

//   return (
//     <ThemedView style={styles.container}>
//       <ThemedText type="title" style={styles.title}>
//         Upload to Google Drive
//       </ThemedText>

//       <TouchableOpacity
//         style={[
//           styles.button,
//           styles.selectButton,
//           isUploading && styles.disabledButton,
//         ]}
//         onPress={handleFilePick}
//         disabled={isUploading}
//       >
//         <Ionicons
//           name="document-outline"
//           size={20}
//           color="#4285F4"
//           style={styles.buttonIcon}
//         />
//         <ThemedText>
//           {(Platform.OS === 'web' ? webFile : file)
//             ? 'Change File'
//             : 'Select File'}
//         </ThemedText>
//       </TouchableOpacity>

//       {Platform.OS === 'web'
//         ? webFile && (
//             <ThemedView style={styles.fileInfoContainer}>
//               <ThemedText style={styles.fileName}>{webFile.name}</ThemedText>
//               <ThemedText style={styles.fileSize}>
//                 {formatFileSize(webFile.size)}
//               </ThemedText>
//               <ThemedText
//                 numberOfLines={1}
//                 ellipsizeMode="middle"
//                 style={styles.fileUri}
//               >
//                 {webFile.type}
//               </ThemedText>
//             </ThemedView>
//           )
//         : file && (
//             <ThemedView style={styles.fileInfoContainer}>
//               <ThemedText style={styles.fileName}>{file.name}</ThemedText>
//               <ThemedText style={styles.fileSize}>
//                 {formatFileSize(file.size)}
//               </ThemedText>
//               <ThemedText
//                 numberOfLines={1}
//                 ellipsizeMode="middle"
//                 style={styles.fileUri}
//               >
//                 {file.uri}
//               </ThemedText>
//             </ThemedView>
//           )}

//       {isUploading && (
//         <ThemedView style={styles.uploadingContainer}>
//           <ThemedView style={styles.progressRow}>
//             <ActivityIndicator size="small" color="#4285F4" />
//             <ThemedText style={styles.progressText}>
//               Uploading... {uploadProgress}%
//             </ThemedText>
//           </ThemedView>
//           <ThemedView style={styles.progressBarContainer}>
//             <ThemedView
//               style={[styles.progressBar, { width: `${uploadProgress}%` }]}
//             />
//           </ThemedView>
//         </ThemedView>
//       )}

//       {uploadError && (
//         <ThemedView style={styles.errorContainer}>
//           <ThemedText style={styles.errorText}>{uploadError}</ThemedText>
//         </ThemedView>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.button,
//           styles.uploadButton,
//           (Platform.OS === 'web'
//             ? !webFile
//             : !file || isUploading || !accessToken) && styles.disabledButton,
//         ]}
//         onPress={handleUpload}
//         disabled={
//           (Platform.OS === 'web' ? !webFile : !file) ||
//           isUploading ||
//           !accessToken
//         }
//       >
//         <Ionicons
//           name="cloud-upload-outline"
//           size={20}
//           color="white"
//           style={styles.buttonIcon}
//         />
//         <ThemedText style={styles.uploadButtonText}>
//           Upload to Google Drive
//         </ThemedText>
//       </TouchableOpacity>

//       {!accessToken && (
//         <ThemedText style={styles.errorText}>
//           You need to be logged in to upload files
//         </ThemedText>
//       )}
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: '#f9f9fb',
//     marginVertical: 10,
//     marginHorizontal: 8,
//   },
//   title: {
//     fontSize: 18,
//     marginBottom: 16,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 6,
//     justifyContent: 'center',
//     marginVertical: 8,
//   },
//   selectButton: {
//     backgroundColor: '#eef1fe',
//     borderWidth: 1,
//     borderColor: '#d1d5fc',
//   },
//   uploadButton: {
//     backgroundColor: '#4285F4',
//     marginTop: 12,
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   buttonIcon: {
//     marginRight: 8,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontWeight: '500',
//   },
//   fileInfoContainer: {
//     marginTop: 8,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 6,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//   },
//   fileName: {
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   fileSize: {
//     fontSize: 13,
//     color: '#666',
//     marginBottom: 2,
//   },
//   fileUri: {
//     fontSize: 12,
//     color: '#888',
//   },
//   uploadingContainer: {
//     marginTop: 12,
//   },
//   progressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   progressText: {
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#4285F4',
//     borderRadius: 3,
//   },
//   errorContainer: {
//     marginTop: 8,
//     padding: 8,
//     backgroundColor: '#ffeeee',
//     borderRadius: 4,
//   },
//   errorText: {
//     color: '#d32f2f',
//   },
// });
