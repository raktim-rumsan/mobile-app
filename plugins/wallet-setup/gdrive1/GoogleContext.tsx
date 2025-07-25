import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Google Sign in EXPLAINED | React Native Tutorial | Expo | React
// https://www.youtube.com/watch?v=u9I54N80oBo

// IMPORTANT: Replace these with your Google OAuth credentials
// To set up Google OAuth:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Go to APIs & Services > OAuth consent screen
//    - Set up the consent screen information
// 4. Go to APIs & Services > Credentials
//    - Create OAuth client ID
//    - For Android: Use package name from app.json and get SHA-1 certificate fingerprint
//    - For iOS: Use bundle identifier from app.json
//    - For Web: Add authorized redirect URI: https://auth.expo.io/@your-username/your-app-slug

// Get client IDs from environment variables or configuration
// For development, you can replace these with your actual client IDs
// For production, you should use environment variables or a secure configuration mechanism

const ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || 'your-android-client-id';
const IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_IOS_CLIENT_ID || 'your-ios-client-id';
const EXPO_CLIENT_ID =
  process.env.EXPO_PUBLIC_EXPO_CLIENT_ID || 'your-expo-client-id';

// Initialize WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Define types for the auth context
type User = {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  accessToken?: string;
} | null;

type GoogleContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  error: string | null;
  accessToken: string | null;
};

// Create the auth context
const GoogleContext = createContext<GoogleContextType | null>(null);

// Create the auth provider component
export const GoogleProvider_expoAuth = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Set up Google auth request
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: EXPO_CLIENT_ID,
    clientId: ANDROID_CLIENT_ID,
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
    redirectUri: makeRedirectUri({
      path: 'success',
      // Remove "localhost" for production, use proxy: true for Expo Go
      // proxy: true,
      //      'http://localhost:8081/success?message=Please%20close%20this%20window%20to%20return%20to%20the%20app.',
    }),
  });

  // Function to handle the user login
  const login = async () => {
    setError(null);
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        // Get user info from Google
        const { authentication } = result;
        await getUserInfo(authentication?.accessToken);
      } else {
        setError('Authentication failed');
      }
    } catch (error: any) {
      setError(error.message || 'Authentication error');
    }
  };

  // Function to logout the user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      setError(error.message || 'Logout error');
    }
  };

  // Function to get user info using the access token
  const getUserInfo = async (token: string | undefined) => {
    if (!token) return;

    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const userData = await response.json();
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        photoUrl: userData.picture,
        accessToken: token, // Store the access token with user data
      };

      // Save user to storage
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      setUser(user);
      setAccessToken(token); // Set access token in state
    } catch (error: any) {
      setError(error.message || 'Failed to get user info');
    }
  };

  // Handle the authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      getUserInfo(authentication?.accessToken);
    }
  }, [response]);

  // Check for stored user on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setAccessToken(parsedUser.accessToken || null);
        }
      } catch (e: unknown) {
        console.error('Error loading user from storage:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    accessToken,
  };

  return (
    <GoogleContext.Provider value={value}>{children}</GoogleContext.Provider>
  );
};

// Create a hook to use the auth context
export const useGoogle_expoAuth = () => {
  const context = useContext(GoogleContext);
  if (!context) {
    throw new Error('useGoogle must be used within an GoogleProvider');
  }
  return context;
};
