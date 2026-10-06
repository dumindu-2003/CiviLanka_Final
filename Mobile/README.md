# CiviLanka Mobile

React Native application built with Expo and React Navigation.

This folder is only the foundation: splash screen, officer login validation, home placeholder, bottom tabs, and a backend health check.

## Requirements

- Node.js and npm
- Expo Go on the Android phone, or an Android emulator
- The backend in `../Backend` when you want to test the API connection

## Install and run

```powershell
cd C:\Desktop\CiviLanka_Final\Mobile
npm install
npx expo start
```

From the repository root, `cd Mobile` is enough.

## Expo Go on Android

1. Install Expo Go from the Google Play Store.
2. Put the phone and the computer on the same Wi-Fi network.
3. Start the backend (`npm run dev` inside `Backend`).
4. Find the computer IPv4 address:

```powershell
ipconfig
```

5. Edit the only API address in `src/services/api.js`:

```javascript
const API_BASE_URL = "http://192.168.1.20:5000/api";
```

Use the IPv4 address from `ipconfig`. Do not use `localhost` for a physical phone.

6. Run `npx expo start`.
7. Open Expo Go and scan the QR code.
8. The splash screen stays for about 2.5 seconds, then opens three onboarding screens, then Officer Login.
9. Leave a field empty and press **Sign In to Tracker** to see validation messages.
10. Fill all three fields and press **Sign In to Tracker** to open Home.
11. Use the bottom tabs: Home, News, Notification, and Profile.
12. On Home, press **Check Backend Status**.

## Screens

| Screen | File | Current behavior |
| --- | --- | --- |
| Splash | `src/screens/SplashScreen.js` | Shows the logo, then opens onboarding |
| Onboarding | `src/screens/OnboardingScreen.js` | Three screens, then opens login |
| Login | `src/screens/LoginScreen.js` | Officer login with no bottom bar. Empty fields are rejected |
| Home | `src/screens/HomeScreen.js` | Shows role `User` and the backend status check |
| News, Notification, Profile | `src/screens/PlaceholderScreen.js` | Placeholder text only |

Navigation files:

- `src/navigation/AppNavigator.js` moves from splash to onboarding, then login, then the main tabs
- `src/navigation/MainTabs.js` is the bottom tab bar

Splash, onboarding, and login have no bottom bar. Home, News, Notification, and Profile appear after a valid sign-in.

## API service

`src/services/api.js` exports:

- `API_BASE_URL`
- `checkBackendHealth()`

`checkBackendHealth()` calls `GET /api/health` and returns the JSON body when `success` is true. Network failures and bad responses throw a readable error, which the Home screen displays.

## Colors

All interface colors come from `src/constants/colors.js`.

## Not included yet

Authentication, registration, certificate screens, uploads, payments, notifications, and role dashboards are out of scope for this stage.
