# BhaktiVerse Mobile App

This folder contains the production mobile app foundation built with Expo React Native.

## Planned Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Supabase
- Expo Notifications
- RevenueCat later

## Run Locally

1. Install dependencies

```bash
cd mobile-app
npm install
```

2. Start Expo

```bash
npm run start
```

3. Test on iPhone

- install `Expo Go` from the App Store
- scan the QR code from the terminal

## Current Status

- Expo project structure created
- bottom tab navigation added
- home screen shell started
- placeholder screens added for search, audio, favorites, profile, reminders, and prayer detail

## Next Steps

1. Port approved UI screen-by-screen from the prototype
2. Add shared design system and localization layer
3. Set up Supabase backend
4. Add login, profile, reminders, and audio flows

## Development Build

Use these commands when we move from Expo Go to a real iPhone development build:

```bash
cd mobile-app
npx eas build --profile development --platform ios
```

Once the build is created, install it on the iPhone and use it for:

- Google login validation
- notification testing
- deep-link testing
- production-like premium flow testing
