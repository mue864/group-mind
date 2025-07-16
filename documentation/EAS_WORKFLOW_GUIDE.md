# EAS Workflow Guide: From Expo Prebuild to Production

## What is EAS?

Expo Application Services (EAS) is a suite of cloud services provided by Expo to help you build, submit, and update your React Native apps with ease. EAS includes:

- **EAS Build**: Cloud builds for iOS and Android
- **EAS Submit**: Automated app store submissions
- **EAS Update**: Over-the-air (OTA) updates for your app

EAS enables you to go beyond the limitations of the classic Expo Go workflow, supporting custom native code, dependencies, and advanced configuration.

---

## Prerequisites

- Node.js (LTS recommended)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account ([signup here](https://expo.dev/signup))
- Your project initialized with Expo (managed or bare)

---

## 1. Running `expo prebuild`

`expo prebuild` generates the native iOS and Android directories from your app config. This is required for EAS Build if you need custom native code or want to use the bare workflow.

**Steps:**

1. Make sure your app.json/app.config.js is configured.
2. Run:
   ```sh
   expo prebuild
   ```
   This will create (or update) the `ios/` and `android/` directories.

**When to use:**

- When you add custom native code or dependencies
- When you want to switch from managed to bare workflow

---

## 2. Configuring `eas.json`

`eas.json` defines your build profiles and settings for EAS Build.

**Example:**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

- Place this file in your project root.
- Adjust profiles as needed (see [EAS Build docs](https://docs.expo.dev/build-reference/eas-json/)).

---

## 3. Using EAS Build

EAS Build lets you build your app in the cloud for iOS and Android.

### Authenticate

```sh
eas login
```

### Build for Android

```sh
eas build -p android --profile production
```

### Build for iOS

```sh
eas build -p ios --profile production
```

- The first time, EAS will guide you through credentials setup.
- Download the build artifact from the Expo dashboard or CLI output.

---

## 4. Using EAS Submit

EAS Submit uploads your build to the App Store or Google Play.

### Submit Android build

```sh
eas submit -p android --latest
```

### Submit iOS build

```sh
eas submit -p ios --latest
```

- You may need to provide API keys or credentials for app stores.
- See [EAS Submit docs](https://docs.expo.dev/submit/introduction/).

---

## 5. Using EAS Update (OTA Updates)

EAS Update lets you push JS/CSS updates to users instantly (no app store review needed).

### Setup

- Add `expo-updates` to your project (usually already included in prebuild)
- Configure your app.json/app.config.js with `updates` key if needed

### Publish an update

```sh
eas update --branch main --message "Describe your update"
```

- Users will receive the update on next app launch.
- See [EAS Update docs](https://docs.expo.dev/eas-update/).

---

## 6. Common Troubleshooting & Tips

- **Native changes require new builds**: OTA updates only work for JS/CSS changes.
- **Credentials**: EAS can manage credentials for you, or you can provide your own.
- **Custom native code**: Use `expo prebuild` and commit the `ios/` and `android/` folders.
- **Debugging builds**: Use the Expo dashboard to view logs and download artifacts.
- **Environment variables**: Use `eas.json` or `.env` files for secrets/config.

---

## 7. Useful Links

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [EAS Update Docs](https://docs.expo.dev/eas-update/)
- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [eas.json Reference](https://docs.expo.dev/build-reference/eas-json/)

---

## 8. Example Workflow

```sh
# 1. Prebuild native projects (if needed)
expo prebuild

# 2. Build for Android
EAS_BUILD_PROFILE=production eas build -p android

# 3. Build for iOS
EAS_BUILD_PROFILE=production eas build -p ios

# 4. Submit to stores
EAS_BUILD_PROFILE=production eas submit -p android --latest
EAS_BUILD_PROFILE=production eas submit -p ios --latest

# 5. Push OTA update
EAS_UPDATE_BRANCH=main eas update --branch main --message "Bug fixes and improvements"
```

---

## 9. FAQ

- **Do I need to run prebuild every time?**
  - Only when you add/remove native dependencies or change native config.
- **Can I use EAS with custom native code?**
  - Yes! That’s a key benefit of EAS over classic Expo.
- **Is EAS free?**
  - EAS has a free tier, but some features require a paid plan. See [Expo Pricing](https://expo.dev/pricing).

---

Happy building with EAS! 🎉
