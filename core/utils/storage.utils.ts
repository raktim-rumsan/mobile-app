import { STORAGE } from '@/core/constants/wallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getServerInfo(): Promise<{
  accessToken?: string | null;
  url?: string | null;
  clientId?: string | null;
} | null> {
  const backupInfo = await AsyncStorage.getItem(STORAGE.SERVER);
  return backupInfo ? JSON.parse(backupInfo) : null;
}

export async function updateServerInfo(data: {
  accessToken?: string | null;
  url?: string | null;
  clientId?: string | null;
}): Promise<void> {
  const currentInfo = await getServerInfo();

  const updatedInfo = { ...currentInfo, ...data };
  await setServerInfo(updatedInfo);
}

export async function setServerInfo(data: {
  accessToken?: string | null;
  url?: string | null;
  clientId?: string | null;
}): Promise<void> {
  await AsyncStorage.setItem(STORAGE.SERVER, JSON.stringify(data));
}

export async function clearServerInfo(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE.SERVER);
}

export async function getStoredAccessToken(): Promise<
  string | null | undefined
> {
  const serverInfo = await getServerInfo();
  return serverInfo ? serverInfo.accessToken : undefined;
}

export async function setStoredAccessToken(
  accessToken: string | null,
): Promise<void> {
  const serverInfo = await getServerInfo();
  if (serverInfo) {
    serverInfo.accessToken = accessToken;
    await setServerInfo(serverInfo);
  } else {
    await setServerInfo({ accessToken });
  }
}

export async function clearStoredAccessToken(): Promise<void> {
  const serverInfo = await getServerInfo();
  if (serverInfo) {
    serverInfo.accessToken = undefined;
    await setServerInfo(serverInfo);
  }
}

export async function getStoredClientId(): Promise<string | null | undefined> {
  const serverInfo = await getServerInfo();
  return serverInfo ? serverInfo.clientId : undefined;
}
