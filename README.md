# Mobile App

This is a React Native mobile application built with Expo and Gluestack UI v2, using NativeWind for styling and Expo Router for navigation.

## Prerequisites

- [Node.js](https://nodejs.org/) (v23 or later recommended)
- [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

## 1. Clone the Repository

```sh
git clone <your-repo-url>
cd mobile-app
```

## 2. Install Dependencies

```sh
npm install
```

## 3. Environment Setup

1. Copy the environment example file:

   ```sh
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:

   - **EXPO_PUBLIC_GOOGLE_MAPS_API_KEY**: Your Google Maps API key (required for map functionality)
   - **EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID**: Your Google OAuth Android client ID
   - **EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID**: Your Google OAuth iOS client ID
   - **EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID**: Your Google OAuth web client ID
   - **EXPO_PUBLIC_OPENAI_API_KEY**: Your OpenAI API key (if using AI features)

   **Important**: Never commit the `.env` file to version control as it contains sensitive API keys.

## 4. Start the Development Server

```sh
npm start
```

This will launch the Expo Dev Tools in your browser. You can run the app on an emulator, simulator, or a physical device using the Expo Go app.

## 5. Running on Device or Simulator

- **iOS:**
  ```sh
  npm run ios
  ```
- **Android:**
  ```sh
  npm run android
  ```
- **Web:**
  ```sh
  npm run web
  ```

NOTE: If you are using Expo Go App, Make sure to run the expo app and your development machine over same wifi.

## 6. Building the App

To create a production build, use Expo's EAS Build:

1. Install eas-cli globally

   ```sh
   npm i -g eas-cli
   ```

2. [Sign up for Expo and log in](https://expo.dev/):
   ```sh
   eas login
   ```
3. Build for your target platform:
   ```sh
   npx expo run:ios   # for iOS simulator/device
   npx expo run:android  # for Android emulator/device
   # or use EAS Build for cloud builds:
   npx eas build --platform ios
   npx eas build --platform android
   ```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for more details.

## 7. Deploying the App

- **Expo Go/OTA Updates:**
  - Publish your app for over-the-air updates:
    ```sh
    npx expo publish
    ```
- **App Stores:**
  - Use EAS Build to generate binaries, then upload to the App Store or Google Play.

## 8. Environment & Configuration

- All UI components use Gluestack UI v2 and NativeWind for styling.
- Configuration files:
  - `app.json` — Expo app config
  - `tailwind.config.js` — Tailwind/NativeWind config
  - `gluestack-ui.config.json` — Gluestack UI config

## 9. Useful Scripts

- `npm start` / `yarn start` — Start Expo dev server
- `npm run ios` / `yarn ios` — Run on iOS simulator
- `npm run android` / `yarn android` — Run on Android emulator
- `npm run web` / `yarn web` — Run on web
- `npx expo publish` — Publish OTA update
- `npx eas build` — Build for app stores

## 10. Troubleshooting

- If you encounter issues with dependencies, try deleting `node_modules` and `package-lock.json`, then reinstall.
- For Gluestack UI or NativeWind issues, ensure you are using compatible versions as specified in `package.json`.
- DONOT USE `@gluestack-ui/themed` PACKAGE. THIS IS V1 PACKAGE SO IT WON'T BE COMPATIBLE WITH OURS.

---

For more information, see the [Expo documentation](https://docs.expo.dev/) and [Gluestack UI documentation](https://ui.gluestack.io/).

```bash
# Clean the project
npx expo prebuild --clean

# Rebuild for Android
JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home npx expo run:android
```
