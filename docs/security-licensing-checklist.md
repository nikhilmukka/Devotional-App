# Security, Licensing, and Launch Checklist

## Current Status

### Verified core mobile stack licenses

The main mobile app dependencies currently in use are MIT-licensed:

- Expo
- React
- React Native
- React Navigation
- Expo Vector Icons
- Expo Linear Gradient
- Expo Status Bar

### Existing attribution already present

The current prototype includes:

- `shadcn/ui` under MIT license
- Unsplash photos under the Unsplash license

See:

- [`/Users/nikhilmukka/Documents/Devotional App/ATTRIBUTIONS.md`](/Users/nikhilmukka/Documents/Devotional%20App/ATTRIBUTIONS.md)

## Important Truth

We can reduce legal and security risk a lot, but no engineer can honestly guarantee that there will never be a legal issue later. The correct goal is:

- use reputable libraries
- keep proper license records
- only use content you own or are allowed to use
- follow App Store and Play Store policies
- publish the correct privacy disclosures

## Main Legal Risk Areas For This App

### 1. Prayer text, audio, and translations

You must have rights to use:

- prayer text
- translations
- transliterations
- audio recordings
- images and artwork

This is the biggest non-code legal risk.

### 2. Images from design/prototype

If any temporary photos or assets came from Figma export, stock sites, or third parties, we must verify they are allowed for commercial mobile app use before launch.

### 3. Privacy and user data

Because the app stores:

- email
- profile name
- profile photo
- phone number
- device notification token

you will need:

- Privacy Policy
- Terms of Service
- app-store privacy disclosures
- clear consent for notifications

### 4. Children feature later

Your future child-focused feature introduces stricter compliance requirements. Before launching child-oriented AI/chat/community features, we will need a separate review for:

- child safety
- parental expectations
- data handling
- moderation
- store categorization

### 5. Community feature later

If you add community posting/chat later, you will need:

- moderation workflow
- abuse reporting
- takedown process
- community guidelines

## Main Security Risk Areas

### 1. Authentication

- secure login
- Google auth correctly configured
- no secrets in mobile app code

### 2. Database access

- Row Level Security enabled in Supabase
- no open public tables for user data
- least-privilege access

### 3. File storage

- private profile photo access rules
- controlled audio bucket permissions
- signed URLs where needed

### 4. Notifications

- store device tokens securely
- allow user opt-in/opt-out
- do not send unwanted or misleading reminders

### 5. Admin content management

- only authorized admin users can upload/edit content
- audit trail for edits later

## Launch Guardrails We Should Follow

### Required before launch

- Use only libraries with acceptable commercial licenses
- Keep attribution/license records
- Confirm rights for all text, audio, and images
- Add Privacy Policy
- Add Terms of Service
- Add contact/support email
- Add proper App Store and Play Store privacy disclosures
- Implement secure Supabase access rules
- Test auth, profile updates, and reminder permissions carefully

### Strongly recommended

- Add dependency vulnerability checks in CI
- Add error monitoring
- Add analytics with privacy-conscious settings
- Add admin-only upload system instead of manual DB edits
- Keep a content ownership spreadsheet for every prayer/audio/image

## Recommended Documentation To Prepare

Before store submission, create these documents:

1. Privacy Policy
2. Terms of Service
3. Content Ownership Register
4. Open Source Notices
5. Subscription Terms later
6. Community Guidelines later

## My Recommendation For This Project

### Safe to continue with

- Expo React Native
- Supabase
- React Native ecosystem packages we selected

### Must be controlled by you or your team

- prayer text source
- translations
- transliterations
- audio files
- artwork / icons / photos
- brand name checks

## Release Readiness Decision

### Good news

The chosen tech stack is standard, commercial-friendly, and appropriate for App Store and Play Store launch.

### Important caution

The bigger legal risk is not the framework code. It is the app content, user-data disclosures, and future child/community features.

## Before We Ship Publicly

I recommend one final review checklist round covering:

- licensing
- privacy
- store metadata
- subscriptions
- content rights
- child/community feature risk

