# Map Component Setup for Android and iOS - ✅ WORKING!

## ✅ STATUS UPDATE: Google Maps API Key Issue RESOLVED!

**The Google Maps API key error has been successfully fixed for both Android and iOS!**

### What Was Fixed:

- ✅ **Android**: Google Maps API Key properly configured in app.json
- ✅ **Android**: AndroidManifest.xml now contains the API key meta-data: `<meta-data android:name="com.google.android.geo.API_KEY" android:value="AIzaSyCWhJCIPwFvQkfz1Ah9P_U77oy6L44YVp8"/>`
- ✅ **iOS**: Google Maps API Key configured in app.json and Info.plist: `<key>GMSApiKey</key><string>AIzaSyCWhJCIPwFvQkfz1Ah9P_U77oy6L44YVp8</string>`
- ✅ **expo-maps** working on both Android (Google Maps) and iOS (Apple Maps + Google Maps option)
- ✅ **No more "API key not found" errors**

## 🔑 IMPORTANT: Google Maps API Key Setup (Required for Android & iOS)

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Maps SDK for Android** API (for Android)
4. Enable **Maps SDK for iOS** API (for iOS if using Google Maps)
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy the API key

### Step 2: Configure API Key in Environment

Add your Google Maps API key to `.env` file:

```bash
# Google Maps API Key - Required for Android maps functionality
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 3: Verify app.json Configuration

Ensure your `app.json` has the Google Maps configuration:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### Step 4: Clean and Rebuild

After adding the API key, you must clean and rebuild:

```bash
# Clean the project
npx expo prebuild --clean

# Rebuild for Android
JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home npx expo run:android
```

## Current Status

✅ **MAPS ARE NOW WORKING!** The map component has been successfully updated to work with both Android and iOS devices using `expo-maps`.

## What's Been Done

1. ✅ **Switched to expo-maps**: Removed react-native-maps conflicts and used expo-maps for better Expo SDK 53 compatibility
2. ✅ **Updated MapComponent**: Now uses expo-maps for native platforms
3. ✅ **Fixed Java version**: Configured to use Java 17 instead of Java 24
4. ✅ **Multi-platform support**: Web (OpenStreetMap), Android/iOS (expo-maps with native rendering)
5. ✅ **Android build successful**: Development build working on Android

## Working Solution

### Android (Currently Working) ✅

````bash
# Set Java 17 (required for Android builds)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home

# Build and run on Android
npx expo run:android

```bash
# Install EAS CLI if you haven't already
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Create development builds
eas build --profile development --platform android
eas build --profile development --platform ios
````

### Option 2: Local Development Build

```bash
# For Android (requires Java 17 or 11)
# JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home npx expo run:android
npx expo run:android

# For iOS (requires macOS and Xcode)
npx expo run:ios
```

#### Troubleshooting Google Maps API Key Issues

**Error: "API key not found. Check that <meta-data android:name="com.google.android.geo.API_KEY" android:value="your API key"/> is in the <application> element of AndroidManifest.xml"**

This error occurs when the Google Maps API key is not properly configured. Follow these steps:

1. **Verify your API key is in .env:**

   ```bash
   # Check if the API key is set
   grep EXPO_PUBLIC_GOOGLE_MAPS_API_KEY .env
   ```

2. **Ensure your Google Cloud API key has the right permissions:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Click on your API key
   - Under **Application restrictions**, select **Android apps**
   - Add your app's package name: `com.rumsan.wallet`
   - Get your SHA-1 certificate fingerprint and add it

3. **Get SHA-1 fingerprint for development:**

   ```bash
   # For debug builds, use the debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

4. **Clean and rebuild after API key changes:**

   ```bash
   # Important: Always clean after changing API keys
   npx expo prebuild --clean
   JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home npx expo run:android
   ```

5. **Alternative: Use EAS Build with API key:**
   ```bash
   # Build with EAS (automatically handles API key injection)
   eas build --profile development --platform android
   ```

#### Troubleshooting Android Build Issues

If you get "Unsupported class file major version" error:

**Solution 1: Install Java 17 (Recommended)**

```bash
# Install Java 17 using Homebrew
brew install openjdk@17

# Set JAVA_HOME for current session
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Add to your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Verify Java version
java -version
```

**Solution 2: Use EAS Build (Easier)**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for Android (no local Java setup needed)
eas build --profile development --platform android
```

## Current Behavior

- **Web**: Uses OpenStreetMap embed (works immediately)
- **Mobile (Expo Go)**: Shows fallback message because react-native-maps requires native compilation
- **Mobile (Development Build)**: Will show native maps with full functionality

## Map Features

When running on a development build, the map will include:

- Native map rendering (Google Maps on Android, Apple Maps on iOS)
- User location display
- Location marker with title and description
- Map controls (compass, scale, zoom)
- My location button (Android only)

## Location Permissions

The app already includes the necessary location permissions:

- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- iOS: `NSLocationWhenInUseUsageDescription`

## Testing

1. Build a development build using one of the options above
2. Install the development build on your device
3. Start the development server: `npx expo start --dev-client`
4. Navigate to the demo screen with the map component
5. The map should now display with native functionality

## Troubleshooting

If maps still don't work after creating a development build:

1. **Check location permissions**: Ensure the app has location permissions granted
2. **Google Maps API Key**: For production Android builds, you'll need a Google Maps API key
3. **Apple Maps**: iOS doesn't require additional API keys for basic map functionality
4. **Rebuild**: Try cleaning and rebuilding the development build

## Production Builds

For production builds, you'll need:

- Google Maps API key for Android (add to app.json under android.config.googleMaps.apiKey)
- Proper code signing for iOS
- App Store/Play Store approval for location permissions
