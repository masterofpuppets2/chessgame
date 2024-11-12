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

um app bundle zu kreiieren (vorher mit keytool ein apk key generieren), in android folder ausführen:
./gradlew bundleRelease
und in android/app/build/outputs/bundle/release ist dann app-release.aab file drin

# TODO

- Stockfish einbinden
- gegen Computer spielen können

- Deployen!

- Refaktoren:
  Code-Aufteilung und Strukturierung: Durch die Aufteilung des Codes in kleinere Komponenten kannst du die Übersichtlichkeit erhöhen. Besonders der Renderprozess für das Schachbrett und die Modale könnten in eigenständige Komponenten ausgelagert werden.

Datenmodell und Zustand:

    Verwende useMemo für die Berechnung von displayBoard, um unnötige Render-Vorgänge zu vermeiden.
    Der Zustand moveHistory könnte optimiert werden, indem die Historie in einer flachen Struktur gespeichert wird. Diese könnte in ein Objekt-Format umgewandelt werden, um den Zugriff und das Update zu vereinfachen.

Verbesserung der Benutzeroberfläche:

    Für das Styling der Züge kannst du flexiblere Styles definieren, um das Layout unabhängig von Bildschirmgrößen zu gestalten.
    Um die aktuellen Features visuell ansprechender zu gestalten, könnte die Promotion und Checkmate-Modale um Animationen oder Tooltips ergänzt werden.

Code-Optimierungen:

    HandleMove-Logik: Anstatt setBoard(game.board()) direkt aufzurufen, könntest du game.fen() in einer useEffect-Abhängigkeit verwenden, um die Aktualisierung bei jedem neuen FEN-String-Update durchzuführen.
    Zustandsmanagement: Der currentTurn könnte durch den move.color dynamisch festgelegt werden.

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
