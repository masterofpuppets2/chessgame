This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
npm run start -- --reset-cache
#npx react-native start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
npm run android
#npx react-native run-android
```

### For iOS

```bash
npm run ios
#npx react-native run-ios
```

```bash
npx react-native doctor
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

# Deploy

To create an app bundle:

Steps to be done only once at the beginning:

1. One-time setup: Generate an APK key using keytool:
   `keytool -genkey -v -keystore your-key-name.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias your-key-alias`

2. One-time adjustment: Replace the app launcher icon in android/app/src/main/res/ with the correct app icon that reflects the app's purpose.

Steps to be done regularly:

1. Update versionCode: Increment the versionCode in android/app/build.gradle by 1. This is required to upload the app to the Google Play Console.

2. Build the app bundle: Navigate to the /android folder and run the following command:
   `./gradlew bundleRelease`

3. Locate the bundle file: After the build is complete, the `app-release.aab` file will be generated in:
   android/app/build/outputs/bundle/release/app-release.aab

# TODO

- Stockfish
- play against computer

# Troubleshooting

Emulator should be in a lower version (here: API 30). API 35 doesnt work, screen was shown shortly and then closed.

Konfiguration des Icons:

Je nach deiner React Native-Version musst du möglicherweise die Fontdateien in die iOS- und Android-Projekte einfügen. In der android/app/build.gradle-Datei:

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
